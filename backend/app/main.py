import os
import time
import asyncio
import json
import random
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.api.v1.endpoints import router as api_v1_router

def seed_mock_telemetry(db):
    """Seed instant demonstration telemetry crash logs and session snapshots into MockDatabase."""
    if hasattr(db, "telemetry_logs") and len(db.telemetry_logs.documents) == 0:
        sample_logs = [
            {
                "_id": "log_seed_01",
                "session_id": "sess-9842a1-prod",
                "client_version": "1.0.0",
                "target_asset_url": "https://cdn.continuum.engine/assets/chunk.bundle.js",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "error_message": "ChunkLoadError: Loading dynamic chunk 'chunk.bundle.js' failed (404 Not Found).",
                "stack_trace": "Error: ChunkLoadError\n  at loadRoute (bundle.js:1425)",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "log_seed_02",
                "session_id": "sess-4412c9-demo",
                "client_version": "1.0.0",
                "target_asset_url": "https://cdn.continuum.engine/assets/three_render.part.js",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "error_message": "ChunkLoadError: Failed to fetch WebGL asset slice 'three_render.part.js'.",
                "stack_trace": "Error: Failed to fetch asset\n  at renderEngine (three_core.js:88)",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        for log in sample_logs:
            db.telemetry_logs.documents[log["_id"]] = log

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize motor client with ultra-fast 300ms server selection timeout
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=300, connectTimeoutMS=300)
    try:
        # Check connection availability with fast timeout
        await asyncio.wait_for(client.server_info(), timeout=0.3)
        app.state.mongodb_client = client
        app.state.db = client[settings.DATABASE_NAME]
        print("Connected to MongoDB successfully.")

        # Create MongoDB production compound indexes & TTL auto-expiry
        try:
            await app.state.db.session_snapshots.create_index([("last_saved_at", -1), ("user_id", 1)])
            await app.state.db.telemetry_logs.create_index([("timestamp", -1), ("session_id", 1)])
            await app.state.db.session_snapshots.create_index("expires_at", expireAfterSeconds=0)
            print("MongoDB compound indexes and 30-day TTL auto-expiry initialized.")
        except Exception as idx_err:
            print(f"Index creation notice: {idx_err}")
    except Exception as e:
        print(f"MongoDB connection skipped ({e}). Falling back to instant in-memory MockDatabase.")
        from app.core.mock_db import MockDatabase
        app.state.mongodb_client = None
        mock_db_inst = MockDatabase()
        seed_mock_telemetry(mock_db_inst)
        app.state.db = mock_db_inst
    yield
    # Shutdown: Close connection client
    if app.state.mongodb_client:
        print("Closing MongoDB connection...")
        app.state.mongodb_client.close()

app = FastAPI(
    title="Continuum Engine Core API",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Rate Limiting & DDOS Protection Middleware
RATE_LIMIT_STORE = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    path = request.url.path
    
    # Rate limit sensitive authentication and vaulting routes
    if path.startswith("/api/v1/auth") or path.startswith("/api/v1/session/vault"):
        now = time.time()
        window = 60 # 60 seconds
        max_requests = 120 # 120 requests per minute
        
        history = RATE_LIMIT_STORE.get(client_ip, [])
        history = [t for t in history if now - t < window]
        
        if len(history) >= max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Rate limit exceeded (120 req/min). Please try again shortly."}
            )
        
        history.append(now)
        RATE_LIMIT_STORE[client_ip] = history
        
    response = await call_next(request)
    return response

# GZip Compression Middleware - compresses static assets & JSON payloads for fast page loads
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Configuration - essential for Flutter web & browser SPA requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directory
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Ingest v1 endpoints
app.include_router(api_v1_router, prefix="/api/v1")

@app.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    """High-frequency real-time telemetry, latency ping, and node metrics WebSocket stream."""
    await websocket.accept()
    try:
        while True:
            # Generate live high-tech simulated telemetry node pulse
            nodes = ["us-east-core", "eu-central-vault", "ap-southeast-mesh", "sa-east-node"]
            payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "node": random.choice(nodes),
                "latency_ms": round(random.uniform(12.4, 45.8), 2),
                "throughput_mbps": round(random.uniform(780.0, 1250.0), 1),
                "vault_integrity_score": 99.99,
                "active_sessions": random.randint(1420, 1680),
                "cpu_load_percent": round(random.uniform(14.0, 32.5), 1),
                "quantum_entropy": hex(random.randint(0x100000, 0xFFFFFF))
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket telemetry error: {e}")

@app.get("/", status_code=200)
def read_root(request: Request):
    accept_header = request.headers.get("accept", "")
    index_path = os.path.join(static_dir, "index.html")
    # If accessed directly via browser HTML navigation, return web app interface
    if "text/html" in accept_header and os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "online",
        "service": "Continuum Engine API",
        "version": settings.APP_VERSION
    }

@app.get("/app", status_code=200)
def read_app():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Web application interface not found."}


