# AI-Marketplace

Fully autonomous AI service marketplace powered by AGI agents.

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables (Stripe API keys).
3. Run development server: `npm run dev`

## CI/CD
GitHub Actions pipeline runs tests and builds Docker images on every push.

## Scaling
Kubernetes manifests are located in `/k8s`. Use `kubectl apply -f k8s/` to deploy.

## API Documentation
OpenAPI spec available at `/docs/openapi.yaml`. Interactive docs rendered via Redocly.