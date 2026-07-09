# Local development runbook

 

This runbook is updated one Wave 1 slice at a time. Slice 6 covers parent-only auth and API-only family setup foundation; web onboarding, provider mocks and product flows are still deferred.

 

## Prerequisites

- Git;

- Node.js LTS selected by the repository;

- pnpm via Corepack;

- Python 3.12+;

- Docker and Docker Compose;

- FFmpeg for local media-worker tests or the provided container image;

- optional Make or task runner used by the repository.

 

## First setup

```powershell
git clone <repository-url>
cd <repository>
corepack.cmd enable
pnpm.cmd install
Copy-Item .env.example .env
pnpm.cmd run infra:up
pnpm.cmd run infra:validate
pnpm.cmd run db:migrate:deploy
pnpm.cmd run db:validate
Set-Location services\math-ai
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-Location ..\..
pnpm.cmd run validate
```

If `python` is not on PATH, set `LEARNIKA_PYTHON` to a Python 3.12 executable for the current shell before running math-ai scripts. Do not commit machine-specific Python paths.

`pnpm.cmd run bootstrap` is currently an alias for `pnpm.cmd run infra:validate`. It starts and validates PostgreSQL, Redis and MinIO only.

 

## Start

```powershell
pnpm.cmd run infra:up
pnpm.cmd run dev:web
pnpm.cmd run dev:api
pnpm.cmd run dev:math-ai
```

Expected local infrastructure:

- PostgreSQL on `127.0.0.1:5432`;
- Redis on `127.0.0.1:6379`;
- MinIO API on `127.0.0.1:9000`;
- MinIO console on `127.0.0.1:9001`.

Expected Slice 3 shells:

- Web on `127.0.0.1:3000`, health route `/health`;
- API on `127.0.0.1:3001`, health routes `/health/live` and `/health/ready`;
- Math AI on `127.0.0.1:8000`, health routes `/health/live` and `/health/ready`.

 

## Checks

```powershell
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run validate
pnpm.cmd run infra:config
pnpm.cmd run infra:check:env
pnpm.cmd run infra:validate
pnpm.cmd run build:web
pnpm.cmd run build:api
pnpm.cmd run db:generate
pnpm.cmd run db:validate
pnpm.cmd run db:migrate:deploy
```

Later slices will add real integration, E2E, contract, AI, voice and retention checks when those surfaces exist.

 

## Voice development

- use synthetic or adult-created non-identifying recordings;

- deterministic transcription mock is the default;

- production provider is disabled unless explicitly configured;

- local audio objects use a short test retention;

- cleanup worker can be triggered manually;

- do not commit recordings or transcripts containing personal information.

 

## Test accounts

Use generated synthetic accounts. Never commit real contacts or child data.

 

## Environment variables

- `.env.example` contains names and safe defaults;

- local `.env` is ignored by Git;

- no production key is required for basic development;

- auth token secrets in `.env.example` are local-only placeholders;

- AI, OCR and Speech-to-Text use deterministic mocks unless explicitly enabled;

- secrets are never pasted into Codex prompts or issue text.

 

## Database

Slice 4 adds Prisma schema and migrations for the local PostgreSQL database foundation. The schema currently covers only account, family tenant, child profile, consent, textbook-selection metadata and audit-log foundation.
Slice 5 adds parent password hashes and revocable auth sessions. Slice 6 uses the existing Slice 4 family, child profile, consent, textbook-selection and audit-log models for an authenticated parent family setup API foundation. It does not add a new migration.

Create a new development migration after changing `apps/api/prisma/schema.prisma`:

```powershell
pnpm.cmd run db:migrate:dev -- --name <migration_name>
```

Apply committed migrations to the local database:

```powershell
pnpm.cmd run db:migrate:deploy
```

Validate the schema and Slice 4 tenant guard checks:

```powershell
pnpm.cmd run db:validate
```

Open Prisma Studio locally:

```powershell
pnpm.cmd run db:studio
```

Reset and recreate the local PostgreSQL schema from migrations:

```powershell
pnpm.cmd run db:reset -- --yes
```

`db:reset` refuses to run without `--yes` and only targets the documented local `learnika_local` database. Slices 4 and 5 do not add a seed script.

## Parent auth API

Slice 5 exposes parent-only auth foundation routes on the API service:

```text
POST /auth/register-parent
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me
```

Run the auth test against local PostgreSQL:

```powershell
pnpm.cmd --filter @learnika/api test
```

Passwords are hashed with Argon2id. Access and refresh tokens are opaque bearer tokens and are stored only as hashes. Do not paste real passwords, tokens, cookies or auth headers into logs, prompts or issue text.

## Family setup API

Slice 6 exposes API-only family setup foundation routes for an authenticated parent:

```text
GET /family-setup/family
POST /family-setup/family
GET /family-setup/children
POST /family-setup/children
POST /family-setup/consents
GET /family-setup/consent-status
PUT /family-setup/children/:childProfileId/learning-context
GET /family-setup/status
```

The same API test command covers parent auth and Slice 6 family setup:

```powershell
pnpm.cmd --filter @learnika/api test
```

Use synthetic local-only parent and child data. Consent document and policy versions in local tests are placeholders and are not legally approved wording. Slice 6 does not add homework, voice, billing, school, mobile or Wave 2 routes.

## Infrastructure reset

To remove local infrastructure containers and named volumes:

```powershell
pnpm.cmd run infra:clean -- --yes
```

`infra:clean` refuses to run without `--yes` because it deletes local Docker volumes.

 

## Troubleshooting

### Services do not start

- check Docker status;

- inspect health endpoints;

- verify ports;

- run `pnpm doctor` when implemented.

 

### Migration failure

- stop feature work;

- preserve logs without PII;

- follow migration recovery notes;

- do not manually alter production-like data without documenting the change.

 

### AI, OCR or Speech-to-Text provider unavailable

- use deterministic mock;

- confirm safe fallback behavior;

- keep typed input active;

- never bypass validation or transcript confirmation.

 

### Audio cleanup failure

- run the cleanup job in dry-run mode;

- inspect object and database states by internal ID only;

- retry idempotently;

- never make the bucket public to diagnose access.

 

## Documentation update

Any change to setup, command names, ports, media formats or retention behavior must update this file in the same pull request.
