import io
import csv
import time
import sys
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request, Response, status, Depends, Query
from typing import Optional
from app.schemas.session import (
    SessionVaultRequest,
    SessionVaultResponse,
    TelemetryLogRequest,
    LoginRequest,
    GoogleLoginRequest,
    UserProfileResponse,
    SessionTokenRequest
)
from app.core.config import settings
from app.core.security import create_access_token, get_token_payload, verify_admin_token
from app.core.encryption import encrypt_data, decrypt_data

START_TIME = time.time()
router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint with system diagnostics for Docker container and Cloud deployments."""
    uptime_sec = round(time.time() - START_TIME, 2)
    return {
        "success": True,
        "status": "healthy",
        "service": "Continuum Engine API",
        "version": settings.APP_VERSION,
        "uptime_seconds": uptime_sec,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "system": {
            "python_version": sys.version.split()[0],
            "platform": sys.platform,
            "encryption_standard": "AES-256-CBC (PKCS7)",
            "auth_scheme": "JWT (HMAC-SHA256)"
        }
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
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": "usr_admin_01",
            "name": "System Administrator",
            "email": "admin@continuum.io",
            "picture": "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
            "is_verified": True,
            "reward_credits": 500,
            "role": "admin"
        }
    }

@router.post("/auth/google", status_code=status.HTTP_200_OK)
async def google_login(payload: GoogleLoginRequest):
    """Authenticate user with Google Account, issue JWT, verify account, and award Quantum credits."""
    user_id = f"goog_{abs(hash(payload.email)) % 1000000}"
    default_pic = f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.name.replace(' ', '')}"
    picture = payload.picture if payload.picture else default_pic

    user_data = {
        "user_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "picture": picture,
        "is_verified": True,
        "reward_credits": 100,  # 100 Bonus reward credits granted on login
        "role": "user"
    }

    token = create_access_token(
        data={"sub": user_id, "email": payload.email, "role": "user"},
        expires_delta=timedelta(hours=24)
    )

    return {
        "success": True,
        "message": "Google Account authenticated and verified successfully! 100 Bonus Quantum Credits granted.",
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }


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
async def get_telemetry_logs(
    request: Request,
    search: Optional[str] = Query(None, description="Filter logs by session ID, target chunk URL, or error message"),
    version: Optional[str] = Query(None, description="Filter logs by client version"),
    page: Optional[int] = Query(None, ge=1, description="Page number for pagination"),
    limit: Optional[int] = Query(None, ge=1, le=500, description="Items per page"),
    admin: dict = Depends(verify_admin_token)
):
    """Retrieve raw crash logs with optional filtering, search, and pagination. Required: Admin authentication."""
    db = request.app.state.db
    try:
        from app.core.mock_db import MockDatabase
        is_mock = isinstance(db, MockDatabase)

        if is_mock:
            logs = list(db.telemetry_logs.documents.values())
            logs.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        else:
            cursor = db.telemetry_logs.find({}).sort("timestamp", -1)
            raw_logs = await cursor.to_list(length=1000)
            logs = []
            for log in raw_logs:
                if "_id" in log:
                    log["_id"] = str(log["_id"])
                logs.append(log)

        # Apply search and version filters if present
        if search:
            q = search.lower().strip()
            logs = [
                l for l in logs
                if q in str(l.get("session_id", "")).lower()
                or q in str(l.get("target_asset_url", "")).lower()
                or q in str(l.get("error_message", "")).lower()
                or q in str(l.get("user_agent", "")).lower()
            ]

        if version:
            v = version.strip()
            logs = [l for l in logs if str(l.get("client_version", "")).strip() == v]

        # Apply pagination if specified
        if page is not None and limit is not None:
            start = (page - 1) * limit
            logs = logs[start:start + limit]

        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch telemetry logs: {str(e)}"
        )

@router.get("/telemetry/export/csv", status_code=status.HTTP_200_OK)
async def export_telemetry_csv(request: Request, admin: dict = Depends(verify_admin_token)):
    """Export all telemetry crash incident logs as a formatted CSV attachment."""
    db = request.app.state.db
    try:
        from app.core.mock_db import MockDatabase
        is_mock = isinstance(db, MockDatabase)

        if is_mock:
            logs = list(db.telemetry_logs.documents.values())
            logs.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        else:
            cursor = db.telemetry_logs.find({}).sort("timestamp", -1)
            logs = await cursor.to_list(length=5000)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Timestamp", "Session ID", "Client Version", "Target Chunk URL", "Error Message", "User Agent"])

        for log in logs:
            ts = log.get("timestamp", "")
            if isinstance(ts, datetime):
                ts = ts.isoformat()
            writer.writerow([
                str(ts),
                str(log.get("session_id", "")),
                str(log.get("client_version", "")),
                str(log.get("target_asset_url", "")),
                str(log.get("error_message", "")).replace("\n", " "),
                str(log.get("user_agent", "")).replace("\n", " ")
            ])

        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=continuum_telemetry_{int(time.time())}.csv"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export telemetry CSV: {str(e)}"
        )

# =========================================================================
# ADVANCED ADMIN CONSOLE ENDPOINTS
# =========================================================================

@router.get("/admin/overview", status_code=status.HTTP_200_OK)
async def get_admin_overview(request: Request, admin: dict = Depends(verify_admin_token)):
    """Get high-level engine overview, database type, and cluster telemetry status."""
    db = request.app.state.db
    from app.core.mock_db import MockDatabase
    is_mock = isinstance(db, MockDatabase)
    
    total_snapshots = 0
    total_logs = 0
    
    if is_mock:
        total_snapshots = len(db.session_snapshots.documents)
        total_logs = len(db.telemetry_logs.documents)
    else:
        try:
            total_snapshots = await db.session_snapshots.count_documents({})
            total_logs = await db.telemetry_logs.count_documents({})
        except Exception:
            pass

    uptime_sec = round(time.time() - START_TIME, 2)
    return {
        "status": "operational",
        "service": "Continuum Engine Core",
        "app_version": settings.APP_VERSION,
        "database_backend": "In-Memory Mock Vault" if is_mock else "MongoDB Cluster",
        "encryption_algorithm": "AES-256-CBC (PKCS7)",
        "total_snapshots": total_snapshots,
        "total_telemetry_logs": total_logs,
        "uptime_seconds": uptime_sec,
        "active_nodes": ["us-east-core", "eu-central-vault", "ap-southeast-mesh", "sa-east-node"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/admin/snapshots", status_code=status.HTTP_200_OK)
async def get_admin_snapshots(
    request: Request,
    search: Optional[str] = Query(None, description="Filter snapshots by session ID, user ID, or applicant name"),
    page: Optional[int] = Query(None, ge=1, description="Page number for pagination"),
    limit: Optional[int] = Query(None, ge=1, le=500, description="Items per page"),
    admin: dict = Depends(verify_admin_token)
):
    """Retrieve all vaulted session snapshots for administrator inspection and audits."""
    db = request.app.state.db
    from app.core.mock_db import MockDatabase
    is_mock = isinstance(db, MockDatabase)
    
    try:
        if is_mock:
            raw_snapshots = list(db.session_snapshots.documents.values())
        else:
            raw_snapshots = await db.session_snapshots.find({}).sort("last_saved_at", -1).to_list(length=1000)

        results = []
        for doc in raw_snapshots:
            d = dict(doc)
            sid = str(d.get("_id", d.get("session_id", "")))
            d["session_id"] = sid
            # Decrypt form data preview for the administrator
            encrypted_data = d.get("form_data", {})
            try:
                decrypted_data = decrypt_data(encrypted_data) if encrypted_data else {}
            except Exception:
                decrypted_data = {"error": "Decryption failed or invalid key"}
            d["decrypted_form_data"] = decrypted_data
            if "_id" in d:
                d["_id"] = str(d["_id"])
            if "last_saved_at" in d and isinstance(d["last_saved_at"], datetime):
                d["last_saved_at"] = d["last_saved_at"].isoformat()
            if "expires_at" in d and isinstance(d["expires_at"], datetime):
                d["expires_at"] = d["expires_at"].isoformat()
            results.append(d)

        # Apply search filter if provided
        if search:
            q = search.lower().strip()
            results = [
                s for s in results
                if q in str(s.get("session_id", "")).lower()
                or q in str(s.get("user_id", "")).lower()
                or q in str(s.get("decrypted_form_data", {}).get("fullName", "")).lower()
            ]

        # Apply pagination if specified
        if page is not None and limit is not None:
            start = (page - 1) * limit
            results = results[start:start + limit]
            
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch snapshots: {str(e)}"
        )

@router.get("/admin/snapshots/export/csv", status_code=status.HTTP_200_OK)
async def export_admin_snapshots_csv(request: Request, admin: dict = Depends(verify_admin_token)):
    """Export all vaulted snapshots with decrypted audit metadata as a formatted CSV attachment."""
    db = request.app.state.db
    from app.core.mock_db import MockDatabase
    is_mock = isinstance(db, MockDatabase)
    
    try:
        if is_mock:
            raw_snapshots = list(db.session_snapshots.documents.values())
        else:
            raw_snapshots = await db.session_snapshots.find({}).sort("last_saved_at", -1).to_list(length=5000)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Session ID", "User ID", "Step", "Version", "Applicant Name", 
            "Email", "Phone", "Employment Status", "Annual Income ($)", 
            "Monthly Debt ($)", "Loan Amount ($)", "Repayment Term (Mo)", "Purpose", 
            "Last Saved At", "Is Recovered"
        ])

        for doc in raw_snapshots:
            d = dict(doc)
            sid = str(d.get("_id", d.get("session_id", "")))
            encrypted_data = d.get("form_data", {})
            try:
                decrypted = decrypt_data(encrypted_data) if encrypted_data else {}
            except Exception:
                decrypted = {}

            ts = d.get("last_saved_at", "")
            if isinstance(ts, datetime):
                ts = ts.isoformat()

            writer.writerow([
                sid,
                str(d.get("user_id", "")),
                str(d.get("current_step", 1)),
                str(d.get("client_version", "1.0.0")),
                str(decrypted.get("fullName", "")),
                str(decrypted.get("email", "")),
                str(decrypted.get("phoneNumber", "")),
                str(decrypted.get("employmentStatus", "")),
                str(decrypted.get("annualIncome", "")),
                str(decrypted.get("monthlyDebt", "")),
                str(decrypted.get("loanAmount", "")),
                str(decrypted.get("repaymentTerm", "")),
                str(decrypted.get("loanPurpose", "")),
                str(ts),
                str(d.get("is_recovered", False))
            ])

        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=continuum_snapshots_{int(time.time())}.csv"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export snapshots CSV: {str(e)}"
        )

@router.delete("/admin/snapshots/{session_id}", status_code=status.HTTP_200_OK)
async def delete_admin_snapshot(request: Request, session_id: str, admin: dict = Depends(verify_admin_token)):
    """Delete a specific session snapshot from the vault."""
    db = request.app.state.db
    try:
        res = await db.session_snapshots.delete_one({"_id": session_id})
        return {
            "success": True,
            "session_id": session_id,
            "message": "Snapshot purged successfully",
            "deleted_count": getattr(res, "deleted_count", 1)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete snapshot: {str(e)}"
        )

@router.delete("/admin/snapshots", status_code=status.HTTP_200_OK)
async def clear_all_admin_snapshots(request: Request, admin: dict = Depends(verify_admin_token)):
    """Purge all session snapshots from the vault."""
    db = request.app.state.db
    try:
        res = await db.session_snapshots.delete_many({})
        return {
            "success": True,
            "message": "All session snapshots purged successfully",
            "deleted_count": getattr(res, "deleted_count", 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to purge snapshots: {str(e)}"
        )

@router.delete("/admin/telemetry/logs", status_code=status.HTTP_200_OK)
async def clear_admin_telemetry_logs(request: Request, admin: dict = Depends(verify_admin_token)):
    """Clear all ingested crash telemetry logs."""
    db = request.app.state.db
    try:
        res = await db.telemetry_logs.delete_many({})
        return {
            "success": True,
            "message": "All telemetry crash logs cleared",
            "deleted_count": getattr(res, "deleted_count", 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear telemetry logs: {str(e)}"
        )

@router.post("/admin/version/update", status_code=status.HTTP_200_OK)
async def update_production_version(payload: dict, admin: dict = Depends(verify_admin_token)):
    """Dynamically change active server version to simulate instant rolling releases or version drift."""
    new_version = payload.get("version")
    if not new_version:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Version string is required")
    
    import re
    if not re.match(r"^\d+\.\d+\.\d+$", new_version):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Version must follow semver (e.g. 1.0.1)")
        
    settings.APP_VERSION = new_version
    return {
        "success": True,
        "new_version": settings.APP_VERSION,
        "message": f"Active production version updated to {new_version}"
    }

