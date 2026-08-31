from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request, status, Depends
from app.schemas.session import (
    SessionVaultRequest,
    SessionVaultResponse,
    TelemetryLogRequest,
    LoginRequest,
    SessionTokenRequest
)
from app.core.config import settings
from app.core.security import create_access_token, get_token_payload, verify_admin_token
from app.core.encryption import encrypt_data, decrypt_data

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint for Docker container and Cloud deployments."""
    return {
        "status": "healthy",
        "service": "Continuum Engine API",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/auth/login", status_code=status.HTTP_200_OK)
async def login(payload: LoginRequest):
    """Authenticate admin/operator credentials and return JWT."""
    if payload.username != settings.ADMIN_USERNAME or payload.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Expiry 24h for admin access
    token = create_access_token(
        data={"sub": payload.username, "role": "admin"},
        expires_delta=timedelta(hours=24)
    )
    return {"access_token": token, "token_type": "bearer"}

@router.post("/session/token", status_code=status.HTTP_200_OK)
async def get_session_token(payload: SessionTokenRequest):
    """Generate a JWT session token for a given session ID."""
    token = create_access_token(
        data={"session_id": payload.session_id, "role": "user"},
        expires_delta=timedelta(hours=24)
    )
    return {"access_token": token, "token_type": "bearer"}

@router.post("/session/vault", response_model=SessionVaultResponse, status_code=status.HTTP_200_OK)
async def vault_session(
    request: Request, 
    payload: SessionVaultRequest, 
    token: dict = Depends(get_token_payload)
):
    """Save an encrypted snapshot of the current session wizard progress."""
    # Security: Verify that user is Admin or that the token matches the session_id
    if token.get("role") != "admin" and token.get("session_id") != payload.session_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Session token does not match requested session ID"
        )

    db = request.app.state.db
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=24) # 24 hours TTL expiration

    # Encrypt form data at rest
    encrypted_form_data = encrypt_data(payload.form_data)

    doc = {
        "_id": payload.session_id,
        "user_id": payload.user_id,
        "client_version": payload.client_version,
        "current_step": payload.current_step,
        "form_data": encrypted_form_data,
        "last_saved_at": now,
        "expires_at": expires,
        "is_recovered": False
    }

    try:
        await db.session_snapshots.update_one(
            {"_id": payload.session_id},
            {"$set": doc},
            upsert=True
        )
        return SessionVaultResponse(
            success=True,
            session_id=payload.session_id,
            message="Session snapshot vaulted successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to vault session state: {str(e)}"
        )

@router.get("/session/rehydrate/{session_id}", status_code=status.HTTP_200_OK)
async def rehydrate_session(
    request: Request, 
    session_id: str, 
    token: dict = Depends(get_token_payload)
):
    """Retrieve and decrypt the vaulted session progress."""
    # Security: Verify that user is Admin or that the token matches the session_id
    if token.get("role") != "admin" and token.get("session_id") != session_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Session token does not match requested session ID"
        )

    db = request.app.state.db
    try:
        snapshot = await db.session_snapshots.find_one({"_id": session_id})
        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No session snapshot found for the given session ID"
            )
        
        # Mark as recovered
        await db.session_snapshots.update_one(
            {"_id": session_id},
            {"$set": {"is_recovered": True}}
        )

        # Decrypt form data values
        snapshot["form_data"] = decrypt_data(snapshot.get("form_data", {}))

        # Convert _id to session_id for client-side serialization consistency
        snapshot["session_id"] = snapshot.pop("_id")
        return snapshot
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rehydrating session: {str(e)}"
        )

@router.post("/telemetry/log", status_code=status.HTTP_201_CREATED)
async def log_telemetry(request: Request, payload: TelemetryLogRequest):
    """Ingest error telemetry log from the client app."""
    db = request.app.state.db
    doc = payload.model_dump()
    doc["timestamp"] = datetime.now(timezone.utc)

    try:
        await db.telemetry_logs.insert_one(doc)
        return {"success": True, "message": "Telemetry log recorded"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest telemetry log: {str(e)}"
        )

@router.get("/version/check", status_code=status.HTTP_200_OK)
async def check_version():
    """Return the active production version of the application."""
    return {"active_version": settings.APP_VERSION}

@router.get("/telemetry/metrics", status_code=status.HTTP_200_OK)
async def get_telemetry_metrics(request: Request, admin: dict = Depends(verify_admin_token)):
    """Fetch aggregated telemetry statistics. Required: Admin authentication."""
    db = request.app.state.db
    try:
        from app.core.mock_db import MockDatabase
        is_mock = isinstance(db, MockDatabase)

        if is_mock:
            snapshots = list(db.session_snapshots.documents.values())
            telemetry = list(db.telemetry_logs.documents.values())
        else:
            snapshots = await db.session_snapshots.find({}).to_list(length=10000)
            telemetry = await db.telemetry_logs.find({}).to_list(length=10000)

        total_crashes = len(telemetry)

        # Logs grouped by client version
        version_crashes = {}
        for log in telemetry:
            ver = log.get("client_version", "unknown")
            version_crashes[ver] = version_crashes.get(ver, 0) + 1

        # Unique impacted user sessions
        impacted_sessions = len(set(log.get("session_id") for log in telemetry if log.get("session_id")))

        # Version drift counts
        drifted_sessions = 0
        for snap in snapshots:
            if snap.get("client_version") != settings.APP_VERSION:
                drifted_sessions += 1

        return {
            "total_crashes": total_crashes,
            "drifted_sessions": drifted_sessions,
            "impacted_sessions": impacted_sessions,
            "version_crashes": version_crashes,
            "active_production_version": settings.APP_VERSION
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch telemetry metrics: {str(e)}"
        )

@router.get("/telemetry/logs", status_code=status.HTTP_200_OK)
async def get_telemetry_logs(request: Request, admin: dict = Depends(verify_admin_token)):
    """Retrieve raw crash logs. Required: Admin authentication."""
    db = request.app.state.db
    try:
        from app.core.mock_db import MockDatabase
        is_mock = isinstance(db, MockDatabase)

        if is_mock:
            logs = list(db.telemetry_logs.documents.values())
            logs.sort(key=lambda x: x.get("timestamp") or datetime.min, reverse=True)
            return logs
        else:
            cursor = db.telemetry_logs.find({}).sort("timestamp", -1)
            logs = await cursor.to_list(length=100)
            for log in logs:
                if "_id" in log:
                    log["_id"] = str(log["_id"])
            return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch telemetry logs: {str(e)}"
        )
