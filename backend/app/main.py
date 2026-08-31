import os
import asyncio
import json
import random
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.api.v1.endpoints import router as api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize motor client
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
    try:
        # Check connection availability
        await client.server_info()
        app.state.mongodb_client = client
        app.state.db = client[settings.DATABASE_NAME]
        print("Connected to MongoDB successfully.")
    except Exception as e:
        print(f"MongoDB connection failed: {e}. Falling back to in-memory MockDatabase.")
        from app.core.mock_db import MockDatabase
        app.state.mongodb_client = None
        app.state.db = MockDatabase()
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


