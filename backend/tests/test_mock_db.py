import pytest
from app.core.mock_db import MockDatabase

@pytest.mark.anyio
async def test_mock_db_operations():
    db = MockDatabase()
    
    # 1. Test find_one on empty collection
    doc = await db.session_snapshots.find_one({"_id": "non-existent"})
    assert doc is None

    # 2. Test update_one with upsert=True
    update_res = await db.session_snapshots.update_one(
        {"_id": "session-1"},
        {"$set": {"fullName": "Alice", "current_step": 1}},
        upsert=True
    )
    assert update_res.matched_count == 1
    assert update_res.modified_count == 1

    # 3. Test find_one returning the inserted document
    doc = await db.session_snapshots.find_one({"_id": "session-1"})
    assert doc is not None
    assert doc["_id"] == "session-1"
    assert doc["fullName"] == "Alice"
    assert doc["current_step"] == 1

    # 4. Test update_one with upsert=False on existing doc
    update_res = await db.session_snapshots.update_one(
        {"_id": "session-1"},
        {"$set": {"current_step": 2}},
        upsert=False
    )
    assert update_res.matched_count == 1
    assert update_res.modified_count == 1

    # Verify update
    doc = await db.session_snapshots.find_one({"_id": "session-1"})
    assert doc["current_step"] == 2

    # 5. Test update_one with upsert=False on non-existent doc
    update_res = await db.session_snapshots.update_one(
        {"_id": "session-2"},
        {"$set": {"current_step": 3}},
        upsert=False
    )
    assert update_res.matched_count == 0
    assert update_res.modified_count == 0

    # 6. Test insert_one on telemetry_logs
    insert_res = await db.telemetry_logs.insert_one({
        "session_id": "session-1",
        "error_message": "Error 1"
    })
    assert insert_res.inserted_id is not None

    # Verify telemetry log retrieval/insertion
    log_doc = await db.telemetry_logs.find_one({"_id": insert_res.inserted_id})
    assert log_doc is not None
    assert log_doc["session_id"] == "session-1"
    assert log_doc["error_message"] == "Error 1"
