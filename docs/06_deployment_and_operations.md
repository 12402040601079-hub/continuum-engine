# 🚀 06. Deployment & Operations Runbook

This document details Docker containerization, Render cloud deployment, continuous integration, monitoring, and operational incident response for **Continuum Engine**.

---

## 1. Docker Containerization

The production Dockerfile uses a multi-stage Python 3.14 slim image:

```dockerfile
FROM python:3.14-slim

WORKDIR /app

# Prevent Python from writing .pyc files & enable unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 2. Render Cloud Configuration (`render.yaml`)

```yaml
services:
  - type: web
    name: continuum-engine
    env: docker
    dockerfilePath: ./Dockerfile
    plan: free
    region: oregon
    healthCheckPath: /api/v1/health
    envVars:
      - key: APP_VERSION
        value: 1.0.1
```

---

## 3. Zero-Downtime Deployment & Health Checks

1. Render spins up the new container instance from the `main` branch.
2. The health check probe polls `GET /api/v1/health` until returning HTTP 200 OK.
3. Traffic transitions to the new container.
4. Old container terminates gracefully.
5. In-flight client sessions that hit chunk 404s automatically execute the Continuum recovery flow with zero data loss.

---

## 4. Operational Incident Response Runbook

| Alert / Symptom | Potential Root Cause | Recommended Action |
| :--- | :--- | :--- |
| **Spike in `/telemetry/log` 404s** | New frontend deployment occurred; older clients catching up. | Expected behavior. Verify that `/session/rehydrate` success rate remains > 99.8%. |
| **High Latency (> 500ms) on `/session/vault`** | MongoDB connection saturation or network throttle. | Engine automatically switches to in-memory / local fallback. Check MongoDB cluster metrics. |
| **Rate Limit 429 Errors** | Client IP exceeding 120 req/min limit. | Normal DDOS protection. Adjust `RATE_LIMIT_STORE` threshold in `main.py` if scaling enterprise load. |
