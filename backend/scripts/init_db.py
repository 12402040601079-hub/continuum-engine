import sys
import os
from pymongo import MongoClient, ASCENDING, DESCENDING

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

def init_db():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
        client.server_info()
        db = client[settings.DATABASE_NAME]
    except Exception as e:
        print(f"MongoDB is not running or unreachable: {e}")
        print("Skipping DB initialization. The backend will run with an in-memory database fallback.")
        return

    # session_snapshots validator
    session_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["_id", "client_version", "current_step", "form_data", "last_saved_at", "expires_at", "is_recovered"],
            "properties": {
                "_id": {
                    "bsonType": "string",
                    "description": "Must be a unique string (UUID v4) session token."
                },
                "user_id": {
                    "bsonType": ["string", "null"],
                    "description": "Optional authenticated user identifier."
                },
                "client_version": {
                    "bsonType": "string",
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
                    "description": "Semantic version format (e.g. 1.0.0)."
                },
                "current_step": {
                    "bsonType": "int",
                    "minimum": 1,
                    "maximum": 4,
                    "description": "Must be an integer between 1 and 4 inclusive."
                },
                "form_data": {
                    "bsonType": "object",
                    "description": "Dynamic key-value inputs mapped by step fields."
                },
                "last_saved_at": {
                    "bsonType": "date",
                    "description": "Must be a datetime date object representing last update."
                },
                "expires_at": {
                    "bsonType": "date",
                    "description": "Must be a datetime date object for TTL index."
                },
                "is_recovered": {
                    "bsonType": "bool",
                    "description": "Indicates if the snapshot has been successfully rehydrated."
                }
            }
        }
    }

    # telemetry_logs validator
    telemetry_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["session_id", "client_version", "target_asset_url", "user_agent", "timestamp", "error_message"],
            "properties": {
                "session_id": {
                    "bsonType": "string",
                    "description": "Reference session ID."
                },
                "client_version": {
                    "bsonType": "string",
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
                    "description": "Semantic version format (e.g. 1.0.0)."
                },
                "target_asset_url": {
                    "bsonType": "string",
                    "description": "URL of the dynamic JS chunk that returned 404."
                },
                "user_agent": {
                    "bsonType": "string",
                    "description": "Client browser user agent."
                },
                "timestamp": {
                    "bsonType": "date",
                    "description": "Datetime representing error occurrence."
                },
                "error_message": {
                    "bsonType": "string",
                    "description": "Descriptive message of the failure."
                },
                "stack_trace": {
                    "bsonType": ["string", "null"],
                    "description": "Stack trace snippet."
                }
            }
        }
    }

    # Create session_snapshots
    if "session_snapshots" not in db.list_collection_names():
        db.create_collection("session_snapshots", validator=session_validator)
        print("Created collection 'session_snapshots' with schema validation.")
    else:
        db.command("collMod", "session_snapshots", validator=session_validator)
        print("Updated validation rules for 'session_snapshots'.")

    # Create telemetry_logs
    if "telemetry_logs" not in db.list_collection_names():
        db.create_collection("telemetry_logs", validator=telemetry_validator)
        print("Created collection 'telemetry_logs' with schema validation.")
    else:
        db.command("collMod", "telemetry_logs", validator=telemetry_validator)
        print("Updated validation rules for 'telemetry_logs'.")

    # Create indexes on session_snapshots
    print("Creating indexes on 'session_snapshots'...")
    # TTL Index (24 hours auto-expiry, i.e., expireAfterSeconds=0 relative to expires_at timestamp)
    db.session_snapshots.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    db.session_snapshots.create_index([("user_id", ASCENDING)])
    print("Session snapshots indexes created.")

    # Create indexes on telemetry_logs
    print("Creating indexes on 'telemetry_logs'...")
    db.telemetry_logs.create_index([("timestamp", DESCENDING)])
    db.telemetry_logs.create_index([("client_version", ASCENDING), ("timestamp", DESCENDING)])
    print("Telemetry logs indexes created.")

    print("Database initialization completed successfully.")

if __name__ == "__main__":
    init_db()
