# python-framework

FastAPI + Strawberry GraphQL + async SQLAlchemy on the
backend, Astro + React + Relay on the frontend. One query (`messages`), one
mutation (`postMessage`), one subscription (`messagePosted`), and one demo
component (`frontend/src/components/Demo.tsx`) that uses all three.

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:4321. `npm run dev` dumps the schema from the backend
and runs the Relay compiler first. After changing a `graphql` tag, run
`npm run relay:compile` (or `npm run relay:watch`, which needs watchman).
