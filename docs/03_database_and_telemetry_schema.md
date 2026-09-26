# 🗄️ 03. Database & Telemetry Schema

This document specifies the MongoDB database collections, document structures, indexing strategies, and WebSocket message schemas for **Continuum Engine**.

---

## 1. MongoDB Collections Overview

| Collection Name | Purpose | Primary Key | Key Indexes |
| :--- | :--- | :--- | :--- |
| `session_snapshots` | Holds uncommitted form state & wizard progress | `_id` (UUID String) | Compound `(last_saved_at: -1, user_id: 1)`, TTL `expires_at: 0` |
| `telemetry_logs` | Stores crash events, 404 chunks, & drift telemetry | `_id` (UUID / ObjectId) | Compound `(timestamp: -1, session_id: 1)` |

---

## 2. Collection: `session_snapshots`

```json
{
  "_id": "sess_8f93a102-4b21-49fa-9e12-32b49c018274",
  "user_id": "usr_test_applicant_01",
  "client_version": "1.0.1",
  "current_step": 3,
  "form_data": {
    "fullName": "Alex Mercer",
    "email": "alex.mercer@cyberfintech.io",
    "phone": "+1 (555) 234-8901",
    "annualIncome": 145000,
    "monthlyDebt": 1200,
    "loanAmount": 75000,
    "repaymentTerm": 36,
    "loanPurpose": "Home Improvement"
  },
  "is_recovered": true,
  "last_saved_at": "2026-09-26T10:15:30.124Z",
  "expires_at": "2026-10-26T10:15:30.124Z"
}
```

### Automatic TTL Index (30-Day Auto Purge)
```python
await db.session_snapshots.create_index("expires_at", expireAfterSeconds=0)
```

---

## 3. Collection: `telemetry_logs`

```json
{
  "_id": "log_a8f9021b-2201-44ca-81bf-1049c8192301",
  "session_id": "sess_8f93a102-4b21-49fa-9e12-32b49c018274",
  "client_version": "1.0.0",
  "target_asset_url": "https://cdn.continuum.engine/assets/chunk.3a81f9.js",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "error_message": "ChunkLoadError: Loading chunk 'chunk.3a81f9.js' failed (404 Not Found)",
  "stack_trace": "Error: ChunkLoadError\n  at loadRoute (app.js:2410)\n  at navigateTo (app.js:812)",
  "timestamp": "2026-09-26T10:15:28.841Z"
}
```

---

## 4. WebSocket Telemetry Feed Protocol

### Endpoint: `ws://127.0.0.1:8000/api/v1/ws/telemetry`

Every 1,000ms, the server broadcasts real-time cluster health and latency telemetry:

```json
{
  "timestamp": "2026-09-26T10:25:01.450Z",
  "node": "us-east-core",
  "latency_ms": 18.42,
  "throughput_mbps": 1042.8,
  "vault_integrity_score": 99.99,
  "active_sessions": 1542,
  "cpu_load_percent": 18.2,
  "quantum_entropy": "0xa4f92d"
}
```
