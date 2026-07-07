# Wave 0 delivery expectations

## Sources

- `README.md`
- `docs/architecture/technology-stack.md`
- `docs/architecture/system-overview.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/release-checklist.md`

## Wave 0 boundary

Wave 0 does not create executable project infrastructure.

Out of scope:

- `apps/`
- `services/`
- `packages/`
- `package.json`
- `pnpm-workspace.yaml`
- Docker files
- migrations
- CI workflows
- frontend screens
- backend endpoints
- workers
- provider integrations
- dependency installation

## Target local development experience

The target commands in `docs/runbooks/local-development.md` remain aspirational until Wave 1.

Executable local setup commands backed by repository files: `NOT YET COLLECTED`.

## Wave 1 expectations

When Wave 1 is explicitly approved, delivery work should make these real:

- pnpm and Turborepo monorepo;
- Next.js web shell;
- NestJS API shell;
- Python math-AI shell;
- Docker Compose local environment;
- PostgreSQL, Redis, BullMQ, private object storage;
- deterministic OCR, STT, and LLM mocks;
- CI checks;
- `.env.example`;
- health/readiness checks;
- structured logs without PII.

## Release expectations

Future release readiness requires:

- current scope and non-goals reviewed;
- tests and evidence for the active wave;
- tenant-isolation tests;
- answer-leak and math evaluation;
- voice confirmation and temporary media deletion checks;
- provider policy approval;
- monitoring and alerting;
- backup/restore expectations;
- independent review.

## Operational evidence register

| Item | Status |
|---|---|
| Dependency versions and lockfile | NOT YET COLLECTED |
| Docker Compose configuration | NOT YET COLLECTED |
| CI workflow definitions | NOT YET COLLECTED |
| `.env.example` and environment inventory | NOT YET COLLECTED |
| Deployment target and region policy | NOT YET COLLECTED |
| Backup/restore RPO/RTO | NOT YET COLLECTED |
| Restore-test evidence | NOT YET COLLECTED |
| Monitoring dashboards and alerts | NOT YET COLLECTED |
| SLOs and SLIs | NOT YET COLLECTED |
| Queue-depth thresholds | NOT YET COLLECTED |
| Cleanup-failure alerts | NOT YET COLLECTED |
| Cost-abuse thresholds | NOT YET COLLECTED |
| Provider kill-switch procedure | NOT YET COLLECTED |
| Incident owner rotation | NOT YET COLLECTED |
| Migration recovery standard | NOT YET COLLECTED |

