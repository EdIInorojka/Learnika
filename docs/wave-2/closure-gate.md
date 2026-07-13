# Wave 2 Closure Gate

## Verdict

Wave 2 foundation verdict: `APPROVE WAVE 2 CLOSURE`.

This verdict closes the approved local-development, metadata, mock-provider and web-foundation slices
through Slice 23. It is not approval for a public beta, real child media, production storage, real
OCR/STT/LLM providers, generated assistance, voice capture or Wave 3 implementation.

Closure evidence was reviewed on 2026-07-13 against the committed repository. The worktree was clean
at gate start. Node.js was `v24.18.0`, pnpm was `11.7.0`, PostgreSQL, Redis and MinIO were reachable,
the three committed migrations were applied, OpenAPI was current and contract privacy validation
passed.

## Capability Summary

| Capability | Closure status | Evidence |
|---|---|---|
| Parent auth and web API client | Complete for local foundation | Slice 17; `apps/web/lib/auth-session.server.ts`; auth web tests |
| Family and tenant authorization | Complete for current parent routes | Wave 1 foundation; homework/media API E2E cross-family tests |
| Homework metadata API | Complete | Five protected session and attempt operations from Slice 10 |
| Homework web UI | Complete for parent metadata | Create/list/view session metadata and list attempts from Slice 18 |
| Attempt web UI | Complete for metadata only | Slice 23 fixed `CREATED` action and four-field display projection |
| Media metadata API | Complete | Protected create/list/get/retention-metadata operations from Slice 11 |
| Media metadata web UI | Complete | Slice 19 safe projection and metadata registration |
| Local media upload | Complete for synthetic local development | Slice 13 API and Slice 20 server-action UI; local MinIO `putObject` only |
| Media lifecycle foundation | Complete as metadata policy only | Slice 12; no object deletion claim |
| OCR boundary and orchestration | Complete as deterministic mock foundation | Slices 6, 14 and 15 |
| Mock OCR candidate API and UI | Complete | Protected Slice 16 route and Slice 21 review panel |
| Learner OCR confirmation | Complete as local UI state only | Slice 22; editable, non-persistent and downstream-disabled |
| STT boundary | Complete as internal deterministic mock only | Slice 7; no route, audio upload or voice UI |
| LLM boundary | Complete as internal deterministic mock metadata only | Slice 8; no learner-facing generation or public route |
| No-answer safety harness | Complete for current structural boundaries | Slice 9 cross-boundary regression suite |

## Public API Audit

The generated OpenAPI artifact contains only these approved route groups:

- health: `GET /health/live`, `GET /health/ready`;
- parent auth: register, login, refresh, logout and `GET /auth/me`;
- family setup: family, children, consent, learning-context and status operations;
- homework metadata: create/list/get sessions and create/list attempt metadata;
- media metadata: create/list/get assets and request retention deletion metadata;
- local upload: the one nested media-asset upload route;
- mock OCR: the one nested mock-candidate route.

There is no public STT, LLM, provider, voice, hint, answer-checking, solution, download, object-read,
signed URL, public URL, billing, school, mobile, analytics or deployment route. Controller discovery
matches the generated OpenAPI inventory. `contracts:check` proves the artifact is current and
`contracts:validate` proves the route and schema privacy allowlists still pass.

OpenAPI contains no answer, solution, generated hint, provider payload, LLM prompt/completion, raw
media, base64 or original-filename property. The authenticated media metadata response still contains
an opaque internal `storageKey`. It is not a credential or URL and no object-read route accepts it.
The web parser validates its nullable shape and deliberately drops it before React receives the
display model. Removing the locator from a future production public DTO remains a minimization item.

## Safety And No-Answer Audit

Status: `PASS` for the implemented Wave 2 surface.

- `HomeworkAttempt` stores only ownership, number, status and timestamps. It stores no learner answer.
- The attempt web action has no learner input field and constructs only `{ status: "CREATED" }`.
- Assistance contracts reject answer, final-answer, full-solution, generated-hint, correctness,
  provider-payload and copied-textbook shapes.
- The attempt gate denies assistance before a submitted meaningful-attempt placeholder is present.
- The internal LLM mock returns policy metadata only and has no public route or learner-facing prose.
- No production source generates an answer, solution, hint, score or correctness result.
- OCR and STT candidates retain untrusted markers and learner-confirmation requirements.
- Unconfirmed OCR/STT input is rejected before the internal LLM boundary.
- Low-confidence and provider-failure fixtures return review/failure states without candidate text.
- The cross-boundary safety harness covers answer leakage, prompt/provider fields, copied textbook
  fields, unsafe media metadata, redaction and attempt gating.

The meaningful-attempt rubric, hint ladder implementation, deterministic math validation, supported
math whitelist, transfer problems and numeric safety release thresholds are not implemented. Their
absence is intentional and prevents any claim that Wave 2 delivers tutoring or homework solving.

## OCR And Provider Audit

- OCR, STT and LLM implementations are deterministic `LocalMock*Provider` classes using synthetic
  fixture identifiers.
- No OpenAI, Anthropic, Gemini, Whisper, Azure AI, Google Cloud AI or equivalent provider SDK appears
  in package manifests or the lockfile.
- API production source contains no external provider `fetch` or HTTP client call.
- The public mock OCR route uses synthetic candidate text and does not inspect the uploaded object.
- A successful OCR candidate is `UNTRUSTED_OCR_CANDIDATE`, requires learner confirmation and keeps
  `downstreamUseAllowed=false`.
- The learner editor stores draft and confirmation only in React reducer state. It has no form,
  server action, fetch, URL, cookie, browser storage or database path.
- Confirmed OCR text is not persisted and is not connected to attempt creation.

Real provider choice, activation configuration, legal/privacy evidence, training-use controls,
residency, retention, deletion, cost controls and kill switches remain unresolved. No real child data
may be sent to any provider.

## Media And Storage Audit

The local upload route is parent-authenticated and tenant-scoped. It accepts one bounded file for an
existing safe metadata record, verifies MIME, size, signature and checksum rules, ignores the browser
filename and uses a server-generated family/child/media-scoped key.

The MinIO adapter is restricted to a loopback HTTP endpoint and exposes only `bucketExists`,
`makeBucket` and `putObject`. There is no object read, stat, list, download, delete, signed URL or
public URL operation. Web production source imports no MinIO, S3 or AWS SDK and receives no storage
credential.

Raw bytes pass only from the web server action to the existing API upload route. They are not returned
to React, encoded as base64, written to logs or stored in Prisma. Original filenames are replaced by
the constant outbound multipart name and are not stored or rendered.

Media deletion remains metadata-only. No cleanup worker proves object or backup deletion. Production
retention durations, malware scanning, image metadata stripping, PDF sanitization, object
reconciliation and upload idempotency/versioning remain release blockers for real child media.

## Privacy, Tenant And Auth Audit

- Homework and media routes require parent bearer authentication.
- Services derive family ownership server-side and use family-scoped lookups.
- Cross-family homework, attempt, media, upload and mock-OCR requests receive tenant-safe not-found
  behavior and are covered by E2E tests.
- Web access and refresh tokens remain in separate `HttpOnly`, `SameSite=Strict` cookies, with
  `Secure` enabled in production.
- Bearer headers are created only in the server-side API wrapper.
- Web production source contains no `localStorage` or `sessionStorage` use.
- API errors are reduced to fixed safe messages; response bodies and auth headers are not logged.
- Web projections discard family, child and creator identifiers where the UI does not need them.
- Media projections discard the storage key, checksum value and deletion internals before React.
- Ordinary logging and safety tests cover child nickname, parent email, token, cookie, auth-header,
  secret, storage-key, filename, transcript and provider-like redaction.

No raw media, base64, original filename, storage key, answer, solution, hint, STT/LLM or provider
payload is rendered by the web UI.

## Database And Migration Audit

The committed migration inventory is:

1. `20260708173051_initial_data_foundation`;
2. `20260708181231_auth_session_foundation`;
3. `20260710082038_homework_media_domain_foundation`.

`db:validate` passes the Prisma schema and repository data-foundation guard. `db:migrate:deploy`
reports all three migrations applied with none pending. Prisma contains metadata-only
`HomeworkSession`, `HomeworkAttempt` and `MediaAsset` models and no persisted answer, solution, hint,
OCR result, transcript, prompt, completion, provider payload, raw media, base64 or original filename.

## CI Assumptions

GitHub Actions uses an Ubuntu runner, Node.js 24, Corepack pnpm 11.7.0, a frozen lockfile install and
Prisma client generation before validation. `infra:validate` starts the checked-in Docker Compose
stack and waits for PostgreSQL, Redis and MinIO before database migrations and the full suite.

CI relies on:

- Docker and Docker Compose being available on the hosted runner;
- loopback ports 5432, 6379, 9000 and 9001 being free;
- Docker Hub availability for the pinned PostgreSQL, Redis and MinIO images;
- `.env.example` local-only placeholder credentials and Compose defaults matching test configuration;
- no real provider credentials, calls or production child data;
- the `pnpm.cmd` compatibility shim remaining available to repository scripts on Linux.

The workflow keeps read-only repository permissions and runs `db:validate`, migration deploy and full
`validate`. CI is green at this gate according to the approved Slice 23 handoff. Hosted runner image
and action tags are external moving inputs; future release hardening should pin and review them.

## Closure Validation

The following commands pass against the final documentation-only worktree:

- `pnpm.cmd run format:check`;
- `pnpm.cmd run lint`;
- `pnpm.cmd run typecheck`;
- `pnpm.cmd run test`;
- `pnpm.cmd run build:web`;
- `pnpm.cmd run build:api`;
- `pnpm.cmd run contracts:check`;
- `pnpm.cmd run contracts:validate`;
- `pnpm.cmd run validate`;
- `pnpm.cmd run db:validate`;
- `pnpm.cmd run db:migrate:deploy`;
- `pnpm.cmd run infra:validate`;
- `git diff --check`.

The full tests include 32 web tests, 103 API tests and the math-service syntax check. OpenAPI remains
current, contract privacy validation passes, both production builds pass and local infrastructure is
reachable.

## Deferred Work And Risks

Wave 2 closure does not resolve:

- production media and raw-audio retention durations or verified object deletion;
- production storage authorization, malware scanning, EXIF/PDF sanitization and reconciliation;
- real OCR/STT/LLM provider selection or activation evidence;
- browser voice recording, typed fallback integration, transcript persistence or audio cleanup;
- learner-answer persistence, deterministic answer checking, hints, solutions or transfer problems;
- the meaningful-attempt rubric, initial supported-math whitelist and numeric safety thresholds;
- legal consent wording, textbook rights, support-media access or production deployment region;
- rate, abuse, concurrency, cost and provider kill-switch controls;
- production analytics, monitoring, backup/restore and incident response.

These items block real-child beta use and any future feature that depends on them. They do not block
closure of the explicitly approved local, metadata-only and mock-only Wave 2 foundation.

## Recommended Wave 3 Starting Point

Recommended first slice: `Wave 3 / Slice 1 - readiness and canonical skill-graph contract`.

The smallest safe next step is a documentation/schema-boundary slice that versions the initial
grade 7-9 mathematics skill identifiers and defines how future diagnostic, homework and mastery
evidence reference the same canonical skills. It should add no mastery updates, diagnostic UI,
planner, report or analytics behavior until curriculum review approves the initial whitelist and
evidence semantics. Wave 3 requires a new explicit gate before implementation.

## Independent Closure Decision

`APPROVE WAVE 2 CLOSURE` for the committed foundation through Slice 23.

Do not start Wave 3, activate real providers or process real child media without a separately
approved gate.
