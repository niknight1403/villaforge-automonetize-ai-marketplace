# AI-Marketplace

Fully autonomous AI-Marketplace for generating, testing, and optimizing AI services.

## Documentation
API documentation is available via OpenAPI 3.0.0 at `docs/openapi.yaml`. Use Redocly to serve the interactive documentation.

## CI/CD Pipeline
- GitHub Actions workflow defined in `.github/workflows/ci.yml`.
- Ensures 90%+ code coverage using Jest.
- Automated deployment to Kubernetes via Docker images.

## Scaling Guidelines
- Horizontal Pod Autoscaling (HPA) is configured for the backend service.
- Use `kubectl scale` to adjust the agent swarm size based on demand.

## Setup
1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Start server: `npm start`