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
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_auth_google_login():
    response = client.post("/api/v1/auth/google", json={
        "email": "test.user@gmail.com",
        "name": "Test Google User",
        "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=test"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "test.user@gmail.com"
    assert data["user"]["is_verified"] is True
    assert data["user"]["reward_credits"] == 100


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

def test_admin_overview_success(mock_db):
    mock_db.session_snapshots.count_documents = AsyncMock(return_value=5)
    mock_db.telemetry_logs.count_documents = AsyncMock(return_value=3)
    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    response = client.get(
        "/api/v1/admin/overview",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "encryption_algorithm" in data
    assert "active_nodes" in data

def test_admin_snapshots_management(mock_db):
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=[
        {
            "_id": "sess-test-1",
            "client_version": "1.0.0",
            "current_step": 2,
            "form_data": {}
        }
    ])
    mock_db.session_snapshots.find = MagicMock(return_value=mock_cursor)
    mock_db.session_snapshots.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
    mock_db.session_snapshots.delete_many = AsyncMock(return_value=MagicMock(deleted_count=1))

    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    # 1. Fetch snapshots
    res_list = client.get("/api/v1/admin/snapshots", headers={"Authorization": f"Bearer {token}"})
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 2. Delete single snapshot
    res_del = client.delete("/api/v1/admin/snapshots/sess-test-1", headers={"Authorization": f"Bearer {token}"})
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True

    # 3. Clear all snapshots
    res_clear = client.delete("/api/v1/admin/snapshots", headers={"Authorization": f"Bearer {token}"})
    assert res_clear.status_code == 200
    assert res_clear.json()["success"] is True

def test_admin_version_update_and_telemetry_clear(mock_db):
    mock_db.telemetry_logs.delete_many = AsyncMock(return_value=MagicMock(deleted_count=2))
    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    # 1. Clear telemetry logs
    res_clear = client.delete("/api/v1/admin/telemetry/logs", headers={"Authorization": f"Bearer {token}"})
    assert res_clear.status_code == 200
    assert res_clear.json()["success"] is True

    # 2. Update production version
    res_ver = client.post(
        "/api/v1/admin/version/update",
        json={"version": "1.0.2"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_ver.status_code == 200
    assert res_ver.json()["new_version"] == "1.0.2"

def test_health_check_diagnostics():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime_seconds" in data
    assert "system" in data
    assert data["system"]["encryption_standard"] == "AES-256-CBC (PKCS7)"

def test_telemetry_logs_filtering_and_pagination(mock_db):
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=[
        {
            "_id": "log-1",
            "session_id": "sess-alpha-123",
            "client_version": "1.0.0",
            "target_asset_url": "https://cdn.example.com/main.part.js",
            "error_message": "ChunkLoadError",
            "user_agent": "Mozilla"
        },
        {
            "_id": "log-2",
            "session_id": "sess-beta-456",
            "client_version": "1.0.1",
            "target_asset_url": "https://cdn.example.com/step4.chunk.js",
            "error_message": "404 Not Found",
            "user_agent": "Chrome"
        }
    ])
    mock_db.telemetry_logs.find = MagicMock(return_value=mock_cursor)
    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    # Test search filter
    res_search = client.get("/api/v1/telemetry/logs?search=beta", headers={"Authorization": f"Bearer {token}"})
    assert res_search.status_code == 200
    logs = res_search.json()
    assert len(logs) == 1
    assert logs[0]["session_id"] == "sess-beta-456"

    # Test version filter
    res_ver = client.get("/api/v1/telemetry/logs?version=1.0.0", headers={"Authorization": f"Bearer {token}"})
    assert res_ver.status_code == 200
    assert len(res_ver.json()) == 1

def test_export_telemetry_csv(mock_db):
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=[
        {
            "session_id": "sess-csv-1",
            "client_version": "1.0.0",
            "target_asset_url": "https://cdn.example.com/chunk.js",
            "error_message": "ChunkLoadError",
            "user_agent": "TestBrowser"
        }
    ])
    mock_db.telemetry_logs.find = MagicMock(return_value=mock_cursor)
    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    res = client.get("/api/v1/telemetry/export/csv", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "sess-csv-1" in res.text
    assert "Timestamp,Session ID,Client Version" in res.text

def test_export_admin_snapshots_csv(mock_db):
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=[
        {
            "_id": "sess-snap-1",
            "user_id": "user-1",
            "client_version": "1.0.0",
            "current_step": 3,
            "form_data": {},
            "is_recovered": False
        }
    ])
    mock_db.session_snapshots.find = MagicMock(return_value=mock_cursor)
    token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "admin"})

    res = client.get("/api/v1/admin/snapshots/export/csv", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "sess-snap-1" in res.text
    assert "Session ID,User ID,Step,Version" in res.text

