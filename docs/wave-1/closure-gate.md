# Wave 1 closure gate

## Status

Wave 1 Slice 11 is a documentation and validation closure slice. It does not
add product behavior.

Current independent closure verdict: `APPROVE`, subject to the validation
evidence remaining green at review time.

## Implemented foundation

Wave 1 currently includes:

- pnpm 11.7.0 and Turborepo monorepo baseline with Node.js 24 enforcement;
- minimal Next.js web shell with `/health`;
- minimal NestJS API shell with `/health/live` and `/health/ready`;
- minimal FastAPI math-ai shell with `/health/live` and `/health/ready`;
- Docker Compose local infrastructure for PostgreSQL, Redis and MinIO;
- `.env.example` with local-only placeholder credentials;
- Prisma PostgreSQL schema and migrations for users, auth sessions, family
  tenancy, child profiles, consent records, textbook selections and audit logs;
- parent-only local development auth with Argon2id password hashes and hashed
  opaque session tokens;
- API-only family setup, child profile, consent and learning-context endpoints;
- role and family-tenant authorization foundation with tenant-isolation tests;
- OpenAPI generation and validation for existing health, auth and family setup
  routes;
- PII-safe structured logging, request/correlation IDs and audit foundation for
  auth, family setup and authorization decisions;
- GitHub Actions CI foundation with Node.js 24, pnpm 11.7.0 and CI PostgreSQL;
- local validation scripts for formatting, linting, typechecking, tests, builds,
  database validation, migrations, infrastructure and contracts.

## Explicitly not implemented

Wave 1 does not currently implement:

- homework upload, recognition, task segmentation or solving flows;
- asset upload endpoints or signed media upload APIs;
- OCR, Speech-to-Text, LLM or provider adapters;
- mathematical hints, step validation, transfer tasks or mastery updates;
- voice recording, voice transcription, transcript confirmation or audio
  retention jobs;
- web onboarding screens or student/parent product screens;
- billing, subscriptions, entitlements or payment provider integrations;
- school, teacher/admin, mentor tooling or organization tenancy;
- mobile apps;
- product analytics pipelines;
- production deployment configuration;
- production-approved legal consent text.

These surfaces remain behind later explicit gates. Documentation that describes
them is product or architecture intent, not an implementation claim.

## Local setup

On Windows PowerShell use `.cmd` package-tool shims:

```powershell
corepack.cmd enable
pnpm.cmd install
Copy-Item .env.example .env
pnpm.cmd run infra:up
pnpm.cmd run infra:validate
pnpm.cmd run db:migrate:deploy
pnpm.cmd run db:validate
pnpm.cmd run validate
```

For the Python shell:

```powershell
Set-Location services\math-ai
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-Location ..\..
```

If `python` is unavailable on PATH, set `LEARNIKA_PYTHON` for the current shell
only. Do not commit machine-specific Python paths.

## Validation commands

Wave 1 closure validation uses:

```powershell
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run test
pnpm.cmd run build:web
pnpm.cmd run build:api
pnpm.cmd run validate
pnpm.cmd run contracts:check
pnpm.cmd run contracts:validate
pnpm.cmd run db:validate
pnpm.cmd run db:migrate:deploy
pnpm.cmd run infra:config
pnpm.cmd run infra:check:env
pnpm.cmd run infra:validate
git diff --check
```

## Security and privacy closure

- Local and CI credentials are placeholders for development and tests only.
- Tests use synthetic parent and child data.
- Passwords are hashed with Argon2id.
- Access and refresh tokens are stored only as hashes.
- API responses do not return password hashes or token hashes.
- Ordinary logs redact or omit passwords, tokens, token hashes, auth headers,
  cookies, secrets, emails, names, child nicknames and school identifiers.
- Request and response bodies are not logged by default.
- Audit records are limited to auth, family setup and authorization decisions
  and use internal IDs and policy versions where safe.
- Consent document and policy values in local tests are placeholders and are
  not production-approved legal wording.

## Contracts and CI status

- OpenAPI is generated to `packages/contracts/openapi.json`.
- Contract validation requires existing health, auth and family setup paths.
- Contract validation rejects future-scope homework, voice, billing, school,
  teacher/admin and provider-adapter paths as implemented.
- CI is defined in `.github/workflows/ci.yml`.
- CI installs with a frozen lockfile, runs PostgreSQL-backed migrations and
  executes the project validation suite with local-only test configuration.

## Known risks

- GitHub Actions was configured locally but must still be observed on the remote
  runner after push.
- Docker access in the Codex sandbox may require elevated execution for local
  validation commands.
- Product-scope documents describe future MVP behavior; implementation remains
  foundation-only until later gates.
- Production legal review is still required before any real consent wording,
  real users or shared environments.

## Wave 2 planning readiness

Wave 1 is ready for Wave 2 planning if the closure validation remains green and
review accepts that homework, media, voice, OCR/STT/LLM, analytics, billing,
mobile and school functionality are still deferred.
