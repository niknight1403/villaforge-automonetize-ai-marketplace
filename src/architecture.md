# AI‑Marketplace Architektur

## 1. Komponenten

| Layer | Komponente | Verantwortlichkeit | Schnittstellen |
|-------|------------|--------------------|----------------|
| **API Gateway** | FastAPI | Authentifizierung, Rate‑Limiting, API‑Billing | Stripe Webhooks, Agent‑Control‑API |
| **Agent‑Control‑API** | Flask (or FastAPI) | Verwaltung des Agenten‑Swarm, Job‑Queue | Kubernetes API, Stripe API |
| **Service‑Registry** | Consul | Entdeckung von generierten KI‑Services | Agent‑Control‑API |
| **Observability** | Prometheus + Grafana | Metriken, Logs, Traces | All Services |
| **CI/CD** | GitHub Actions | Build, Test, Deploy | GitHub, Docker Hub |
| **Deployment** | Helm Charts | Kubernetes‑Manifeste | Kubernetes Cluster |

## 2. Datenmodell (JSON‑Schema)

```json
{
  "service": {
    "id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "status": "enum: created, training, deployed, retired",
    "metadata": {
      "tags": ["string"],
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    },
    "pricing": {
      "plan": "enum: free, starter, pro",
      "price_cents": 999,
      "currency": "EUR"
    },
    "endpoint": "string"
  },
  "agent_job": {
    "job_id": "string",
    "service_id": "string",
    "task": "enum: generate, test, optimize",
    "status": "enum: pending, running, succeeded, failed",
    "logs": ["string"],
    "metrics": {
      "latency_ms": 123,
      "accuracy": 0.92
    }
  }
}
```

## 3. Deployment

* Dockerfile per Service
* Helm Chart: `ai-marketplace/helm/ai-marketplace/`
* Kubernetes: Deployments, Services, Ingress, Prometheus Operator, Grafana.

## 4. Observability

* Prometheus scrape config in `ai-marketplace/helm/ai-marketplace/values.yaml`
* Grafana dashboards: `dashboard/ai_marketplace.json`

## 5. CI/CD

* `.github/workflows/ci.yml` – lint, test, build images
* `.github/workflows/deploy.yml` – push to Docker Hub, helm upgrade

---

Dieses Dokument bildet die Basis für die Implementierung der jeweiligen Komponenten.
```