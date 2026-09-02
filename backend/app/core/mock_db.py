class MockUpdateResult:
    def __init__(self, matched_count: int, modified_count: int):
        self.matched_count = matched_count
        self.modified_count = modified_count

class MockInsertOneResult:
    def __init__(self, inserted_id: str):
        self.inserted_id = inserted_id

class MockDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count

class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self.documents = {}

    async def update_one(self, filter: dict, update: dict, upsert: bool = False) -> MockUpdateResult:
        doc_id = filter.get("_id")
        if not doc_id:
            raise ValueError("Mock database only supports updates filtered by '_id'")

        set_data = update.get("$set", {})
        
        if doc_id not in self.documents:
            if not upsert:
                return MockUpdateResult(matched_count=0, modified_count=0)
            self.documents[doc_id] = {"_id": doc_id}

        self.documents[doc_id].update(set_data)
        # Ensure ID remains consistent
        if "_id" not in self.documents[doc_id]:
            self.documents[doc_id]["_id"] = doc_id
            
        return MockUpdateResult(matched_count=1, modified_count=1)

    async def find_one(self, filter: dict) -> dict | None:
        doc_id = filter.get("_id")
        if not doc_id:
            raise ValueError("Mock database only supports find_one filtered by '_id'")

        doc = self.documents.get(doc_id)
        if doc is not None:
            return dict(doc) # return a copy to prevent mutation
        return None

    async def insert_one(self, doc: dict) -> MockInsertOneResult:
        doc_copy = dict(doc)
        doc_id = doc_copy.get("_id")
        if not doc_id:
            import uuid
            doc_id = str(uuid.uuid4())
            doc_copy["_id"] = doc_id
        
        self.documents[doc_id] = doc_copy
        return MockInsertOneResult(inserted_id=doc_id)

    async def delete_one(self, filter: dict) -> MockDeleteResult:
        doc_id = filter.get("_id")
        if doc_id and doc_id in self.documents:
            del self.documents[doc_id]
            return MockDeleteResult(deleted_count=1)
        return MockDeleteResult(deleted_count=0)

    async def delete_many(self, filter: dict) -> MockDeleteResult:
        count = len(self.documents)
        self.documents.clear()
        return MockDeleteResult(deleted_count=count)

    async def count_documents(self, filter: dict = None) -> int:
        return len(self.documents)

class MockDatabase:
    def __init__(self):
        self.session_snapshots = MockCollection("session_snapshots")
        self.telemetry_logs = MockCollection("telemetry_logs")
