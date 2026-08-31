import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from app.main import app
from app.core.security import create_access_token
from app.core.config import settings

client = TestClient(app)

@pytest.fixture
def mock_db(monkeypatch):
    mock_db_instance = MagicMock()
    mock_db_instance.session_snapshots = MagicMock()
    mock_db_instance.telemetry_logs = MagicMock()
    
    # Inject mocked database into application state
    app.state.db = mock_db_instance
    return mock_db_instance

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Continuum Engine API"
    assert "version" in data

def test_web_app_serving():
    response = client.get("/app")
    assert response.status_code == 200
    assert "Continuum Engine" in response.text

def test_static_assets_serving():
    response_css = client.get("/static/styles.css")
    assert response_css.status_code == 200
    response_js = client.get("/static/app.js")
    assert response_js.status_code == 200
    response_three = client.get("/static/three_core.js")
    assert response_three.status_code == 200
    response_audio = client.get("/static/cyber_audio.js")
    assert response_audio.status_code == 200

def test_websocket_telemetry_stream():
    with client.websocket_connect("/api/v1/ws/telemetry") as websocket:
        data = websocket.receive_json()
        assert "latency_ms" in data
        assert "node" in data
        assert "vault_integrity_score" in data

def test_version_check():
    response = client.get("/api/v1/version/check")
    assert response.status_code == 200
    assert "active_version" in response.json()

def test_auth_login_success():
    payload = {
        "username": settings.ADMIN_USERNAME,
        "password": settings.ADMIN_PASSWORD
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_auth_login_failure():
    payload = {
        "username": "wronguser",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"

def test_session_token_generation():
    payload = {
        "session_id": "session-12345"
    }
    response = client.post("/api/v1/session/token", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_vault_session_unauthorized(mock_db):
    payload = {
        "session_id": "test-session-uuid-12345",
        "user_id": "user-999",
        "client_version": "1.0.0",
        "current_step": 3,
        "form_data": {"fullName": "Jane Doe"}
    }
    response = client.post("/api/v1/session/vault", json=payload)
    assert response.status_code == 401 # HTTPBearer credentials missing returns 401 automatically

def test_vault_session_success(mock_db):
    mock_db.session_snapshots.update_one = AsyncMock()

    session_id = "test-session-uuid-12345"
    token = create_access_token({"session_id": session_id, "role": "user"})

    payload = {
        "session_id": session_id,
        "user_id": "user-999",
        "client_version": "1.0.0",
        "current_step": 3,
        "form_data": {
            "fullName": "Jane Doe",
            "employmentStatus": "Employed",
            "annualIncome": 75000.0
        }
    }
    response = client.post(
        "/api/v1/session/vault",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["session_id"] == session_id

    # Verify data encryption before database write
    called_args = mock_db.session_snapshots.update_one.call_args
    assert called_args is not None
    saved_doc = called_args[0][1]["$set"]
    assert saved_doc["form_data"]["fullName"] != "Jane Doe"
    assert saved_doc["form_data"]["employmentStatus"] != "Employed"

def test_rehydrate_session_found_and_decrypted(mock_db):
    # Vault pre-encrypted values
    from app.core.encryption import encrypt_data
    encrypted_form = encrypt_data({
        "fullName": "Jane Doe",
        "employmentStatus": "Employed"
    })

    session_id = "test-session-uuid-12345"
    mock_snapshot = {
        "_id": session_id,
        "user_id": "user-999",
        "client_version": "1.0.0",
        "current_step": 3,
        "form_data": encrypted_form,
        "is_recovered": False
    }
    mock_db.session_snapshots.find_one = AsyncMock(return_value=mock_snapshot)
    mock_db.session_snapshots.update_one = AsyncMock()

    token = create_access_token({"session_id": session_id, "role": "user"})

    response = client.get(
        f"/api/v1/session/rehydrate/{session_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert data["current_step"] == 3
    # Check that data is decrypted correctly
    assert data["form_data"]["fullName"] == "Jane Doe"
    assert data["form_data"]["employmentStatus"] == "Employed"

def test_rehydrate_session_not_found(mock_db):
    mock_db.session_snapshots.find_one = AsyncMock(return_value=None)

    session_id = "non-existent-id"
    token = create_access_token({"session_id": session_id, "role": "user"})

    response = client.get(
        f"/api/v1/session/rehydrate/{session_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "No session snapshot found for the given session ID"

def test_log_telemetry(mock_db):
    mock_db.telemetry_logs.insert_one = AsyncMock()

    payload = {
        "session_id": "test-session-uuid-12345",
        "client_version": "1.0.0",
        "target_asset_url": "https://cdn.example.com/assets/main.part.js",
        "user_agent": "Mozilla/5.0",
        "error_message": "ChunkLoadError: Loading chunk 3 failed.",
        "stack_trace": "Error at https://cdn.example.com/assets/main.part.js:12:34"
    }
    response = client.post("/api/v1/telemetry/log", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True

def test_get_telemetry_metrics_forbidden():
    response = client.get("/api/v1/telemetry/metrics")
    assert response.status_code == 401 # Missing token returns 401 Unauthorized

def test_get_telemetry_metrics_success(mock_db):
    # Mock find().to_list() on session_snapshots and telemetry_logs
    mock_snapshots_cursor = MagicMock()
    mock_snapshots_cursor.to_list = AsyncMock(return_value=[
        {"client_version": "1.0.0"},
        {"client_version": "1.0.1"}
    ])
    mock_db.session_snapshots.find = MagicMock(return_value=mock_snapshots_cursor)

    mock_telemetry_cursor = MagicMock()
    mock_telemetry_cursor.to_list = AsyncMock(return_value=[
        {"session_id": "session-1", "client_version": "1.0.0"},
        {"session_id": "session-1", "client_version": "1.0.0"}
    ])
    mock_db.telemetry_logs.find = MagicMock(return_value=mock_telemetry_cursor)

    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    response = client.get(
        "/api/v1/telemetry/metrics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_crashes"] == 2
    assert data["drifted_sessions"] == 1 # session-1 is running 1.0.0, production is 1.0.1
    assert data["impacted_sessions"] == 1
    assert data["version_crashes"]["1.0.0"] == 2
