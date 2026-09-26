# 📡 04. API Reference & Contracts

This document contains the complete REST API catalog and WebSocket specifications for **Continuum Engine Core API**.

---

## 1. Base URL & Common Headers

- **Base URL:** `http://127.0.0.1:8000/api/v1` (Production: `https://continuum-engine.onrender.com/api/v1`)
- **Rate Limit:** 120 requests/minute per client IP.
- **Common Response Headers:**
  - `Content-Type: application/json`
  - `X-Continuum-Version: 1.0.1`

---

## 2. Endpoints Catalog

### 2.1. System Health & Probes
- **`GET /api/v1/health`**
  - **Description:** Verifies service availability, database connectivity, and runtime metrics.
  - **Response (200 OK):**
    ```json
    {
      "status": "healthy",
      "version": "1.0.1",
      "timestamp": "2026-09-26T10:30:00.000Z",
      "database": "connected",
      "active_connections": 12
    }
    ```

### 2.2. Version Registry
- **`GET /api/v1/version/check`**
  - **Description:** Returns active production version for drift detection.
  - **Response (200 OK):**
    ```json
    {
      "active_version": "1.0.1",
      "minimum_supported_version": "1.0.0",
      "drift_action": "rehydrate"
    }
    ```

### 2.3. Session Snapshot Vaulting & Rehydration
- **`POST /api/v1/session/vault`**
  - **Description:** Vaults in-flight multi-step form snapshot to persistent store.
  - **Request Body:**
    ```json
    {
      "session_id": "sess_8f93a102-4b21-49fa-9e12-32b49c018274",
      "client_version": "1.0.1",
      "current_step": 3,
      "form_data": {
        "fullName": "Jane Doe",
        "loanAmount": 50000
      }
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "status": "vaulted",
      "session_id": "sess_8f93a102-4b21-49fa-9e12-32b49c018274",
      "timestamp": "2026-09-26T10:30:02.100Z"
    }
    ```

- **`GET /api/v1/session/rehydrate?session_id={id}`**
  - **Description:** Retrieves vaulted session snapshot to restore active user progress.
  - **Response (200 OK):** Returns saved snapshot payload.

### 2.4. Telemetry Log Ingestion
- **`POST /api/v1/telemetry/log`**
  - **Description:** Logs dynamic chunk 404 failure events.
  - **Request Body:**
    ```json
    {
      "session_id": "sess_8f93a102-4b21-49fa-9e12-32b49c018274",
      "client_version": "1.0.0",
      "target_asset_url": "https://cdn.continuum.engine/chunk.part.js",
      "user_agent": "Mozilla/5.0 ...",
      "error_message": "404 Not Found"
    }
    ```

### 2.5. Edge-AI Credit Risk Scoring
- **`POST /api/v1/scoring/evaluate`**
  - **Description:** Runs ONNX / Edge AI rule inference on loan parameters.
  - **Request Body:**
    ```json
    {
      "annual_income": 120000,
      "monthly_debt": 1500,
      "loan_amount": 45000,
      "repayment_term": 36
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "risk_tier": "Low Risk",
      "approval_probability": 0.94,
      "dti_ratio": 0.15,
      "max_recommended_amount": 85000
    }
    ```

---

## 3. WebSocket Telemetry Stream

- **URL:** `ws://127.0.0.1:8000/api/v1/ws/telemetry`
- **Protocol:** JSON message stream with 1.0s heartbeat intervals.
