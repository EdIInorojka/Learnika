# Wave 2 Slice 1 readiness report

## Status

Wave 2 Slice 1 is a readiness and boundary confirmation slice only. It does not
implement product behavior.

Readiness verdict: `READY WITH EVIDENCE GAPS`.

The repository is ready to request approval for the first actual Wave 2 coding
slice if the worktree is clean at slice start and the validation suite remains
green. Provider-backed behavior, beta use with real child data and production
media handling remain blocked until the open evidence items are resolved.

## Current foundation status

### Auth

Status: `READY`.

Wave 1 includes parent-only local development authentication with Argon2id
password hashes, opaque bearer tokens stored only as hashes, refresh/logout
support and tests using synthetic local data.

### Family setup

Status: `READY`.

Wave 1 includes authenticated API-only family setup, child profile, consent and
learning-context routes. Consent document and policy values remain local
placeholders and are not production-approved legal wording.

### Tenant authorization

Status: `READY`.

Wave 1 includes family-tenant authorization checks and negative tests showing
that one parent cannot access another family. Future homework, media and voice
resources must reuse this family boundary and add authorization tests before any
route is exposed.

### OpenAPI contracts

Status: `READY`.

Generated OpenAPI currently covers only implemented health, auth and family
setup routes. Contract validation still rejects future-scope homework, voice,
billing, school, teacher/admin and provider-adapter paths as implemented. No
Wave 2 routes or generated contracts were added in this readiness slice.

### Logging and audit

Status: `READY FOR FOUNDATION`, `NEEDS EXTENSION IN FUTURE SLICES`.

Wave 1 logs are structured, use request and correlation IDs and omit request
and response bodies by default. Passwords, tokens, auth headers, cookies,
secrets, emails, names, child nicknames, school identifiers, raw homework text,
transcripts, images and audio remain prohibited in ordinary logs.

Audit currently covers auth, family setup and authorization decisions only.
Future media, homework, voice and provider slices must define additional audit
actions before implementation.

### CI

Status: `READY`.

GitHub Actions CI is present for the Wave 1 foundation with Node.js 24, pnpm
11.7.0, frozen-lockfile install, CI PostgreSQL and local-only synthetic
credentials. The readiness check assumes the remote CI remains green at review
time.

### Local infra

Status: `READY`.

Docker Compose local infrastructure exists for PostgreSQL, Redis and MinIO.
Local validation may require elevated Docker/toolchain access in the Codex
sandbox. Docker reports a user-level config warning locally, but the required
foundation checks pass when the project commands are run with the documented
toolchain.

## Wave 2 implementation boundary

### Allowed in the next coding slice

The next coding slice may define the minimal homework/media domain foundation
only after explicit approval. Allowed work should stay inside the scope of
`Slice 1 - homework and media domain model design` from `slice-plan.md`:

- ADR or design note for Wave 2 entity ownership and state machines;
- minimal Prisma schema draft and reviewed migration for approved domain tables;
- tenant, retention and audit metadata fields;
- internal repository or service interfaces without external behavior;
- schema invariant and tenant ownership tests;
- documentation updates that describe the implemented foundation accurately.

### Still forbidden

The next coding slice must not create:

- public homework or voice endpoints;
- asset upload or signed URL implementation;
- OCR, Speech-to-Text or LLM provider adapters;
- real provider calls, credentials or secrets;
- voice recording, transcription or browser microphone UI;
- homework solving, step validation, hints or transfer logic;
- web homework UI;
- generated contracts for unimplemented routes;
- billing, school, teacher/admin, mobile, analytics or deployment features.

### Requires explicit approval before provider or beta activation

The following remain blocked until separately approved:

- real OCR, Speech-to-Text or LLM provider activation;
- any real provider receiving child, homework, voice or learning data;
- beta use with real child media;
- production legal consent wording;
- exact media and raw-audio retention durations;
- provider residency, retention, deletion, training-use and subprocessor
  evidence;
- safety thresholds for answer leakage, severe math error, unsupported
  overconfidence, speech correction, latency and deletion compliance;
- textbook rights for any copied or stored protected content.

## Readiness checklist status

| Area | Status | Notes |
|---|---|---|
| Wave gate approvals | Ready | Wave 0, Wave 1 and Wave 2 Planning Gate are approved. |
| Clean worktree at start | Ready | `git status --short` was clean before this report was created. |
| Toolchain versions | Ready | Node.js 24.x and pnpm 11.7.0 are present. |
| Contracts | Ready | `contracts:check` and `contracts:validate` pass. |
| Database foundation | Ready | `db:validate` passes outside sandbox-sensitive Prisma module resolution. |
| Local infrastructure | Ready | Docker and Compose are installed; local infra exists. |
| Scope controls | Ready | Forbidden future scope remains out of this slice. |
| Security and privacy prerequisites | Ready for next design slice | New resources still need PII class, retention and audit fields during coding. |
| Learning safety prerequisites | Needs evidence | Meaningful-attempt rubric and safety thresholds are still open decisions. |
| Voice prerequisites | Needs evidence | Exact voice UX, raw-audio retention and provider policy remain open. |
| Provider prerequisites | Needs evidence | Real providers remain disabled until provider evidence is approved. |
| Legal and textbook rights | Needs evidence | Legal consent wording and textbook rights remain unresolved. |

No readiness item blocks starting the recommended mock-free, provider-free
domain foundation slice. The open evidence items block provider activation,
student-facing homework release and beta use with real child data.

## Recommended next coding slice

Recommended next slice: `Slice 1 - homework and media domain model design`.

Reason: it is the smallest safe implementation slice in the approved Wave 2
plan. It can establish ownership, tenant scope, retention and audit metadata
without exposing endpoints, uploads, providers, voice, hints or student-facing
homework behavior.

## Acceptance criteria for the next coding slice

### Allowed files

Only files required for the domain foundation should be changed. Expected
allowed areas:

- `docs/architecture/adr/` for a Wave 2 domain/state-machine ADR;
- `docs/wave-2/` for slice evidence and closure notes;
- `apps/api/prisma/schema.prisma` for approved minimal schema additions;
- `apps/api/prisma/migrations/` for the reviewed migration;
- `apps/api/prisma/validate-data-foundation.mjs` only if new schema guard checks
  are required;
- `apps/api/src/` only for internal domain types or repository/service
  interfaces with no route exposure;
- `apps/api/test/` only for schema, invariant and tenant-boundary tests.

### Forbidden files and surfaces

The next slice must not modify or create:

- web homework UI files in `apps/web/`;
- generated OpenAPI output for new routes;
- public controller route handlers for homework, media or voice;
- storage client implementation or signed URL code;
- OCR, Speech-to-Text or LLM provider adapter files;
- math-ai solving, hint or recognition implementation;
- billing, school, teacher/admin, mobile, analytics or deployment files;
- production secrets or real provider configuration.

### Tests required

The next slice must add or update tests for:

- migration/schema validity;
- family ownership on new domain records;
- cross-family denial at repository or service level;
- required retention metadata for temporary media-related records;
- audit metadata expectations for sensitive future actions;
- absence of public homework, media or voice routes from generated contracts.

### Validation commands

The next slice must run:

- `pnpm.cmd run db:validate`
- `pnpm.cmd run typecheck`
- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`

Run the full root validation suite before closure:

- `pnpm.cmd run format:check`
- `pnpm.cmd run lint`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run test`
- `pnpm.cmd run build:web`
- `pnpm.cmd run build:api`
- `pnpm.cmd run validate`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run db:validate`
- `git diff --check`

### Rollback and block conditions

Block or roll back the next slice if:

- any public homework, media or voice endpoint is introduced;
- generated contracts document future routes as implemented;
- schema lacks tenant, PII class, retention or deletion metadata where required;
- cross-family ownership cannot be tested;
- migration is unsafe or lacks a forward-fix plan;
- any response, fixture or log can expose source answers, raw homework text,
  transcripts, images, audio, signed URLs or secrets;
- the schema implies billing, school, teacher/admin, mobile, analytics,
  deployment or real provider scope.

## Slice 1 verdict

Independent Slice 1 readiness verdict: `APPROVE`.

The next slice still requires explicit approval before implementation begins.
