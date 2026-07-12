# Wave 2 Slice 16 Implementation Note

## Scope

Slice 16 exposes exactly one authenticated parent-only mock OCR candidate route:

- `POST /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/mock-ocr-candidate`

The route is nested under the existing homework media API, uses the committed Slice 15
orchestration service and returns a candidate for immediate learner review. It creates no OCR result
record and performs no media transfer.

## Authentication And Tenant Boundary

The existing bearer authentication and parent-family authorization services are required. The
service resolves an active homework session by authenticated family ID and session ID, then resolves
the media asset by the same family and session plus media ID. Missing, cross-family and mismatched
resources return the existing tenant-safe `404` and record denied-access audit metadata using only
internal identifiers.

## Request And Readiness Boundary

The optional JSON body accepts only `mockFixtureId`. The allowed public synthetic fixtures are:

- `clear-linear-equation`;
- `low-confidence-equation`;
- `provider-failure`.

No body defaults to `clear-linear-equation`. Prompt-injection fixtures and arbitrary fields are not
publicly selectable. Slice 14 readiness runs before the mock boundary. Unsupported media, unsafe or
expired retention, and missing checksum or storage-key metadata return the generic
`MOCK_OCR_MEDIA_NOT_READY` conflict response without exposing internal readiness details.

## Candidate Trust And Response Safety

A successful response contains synthetic candidate text marked `UNTRUSTED_OCR_CANDIDATE`.
`learnerConfirmationRequired` is always `true`, `downstreamUseAllowed` is always `false`, and object
existence remains `UNKNOWN_NOT_VERIFIED`.

Low-confidence output returns `NEEDS_REVIEW` without candidate text. Mock failure returns safe
failure metadata without a candidate or provider payload. The public mapping omits storage keys,
original filenames, raw media, base64, provider names and payloads, prompts, completions, answers,
solutions and generated hints. Candidate text is neither logged nor persisted.

## Storage, Provider And Database Boundaries

The API reads only `HomeworkSession` and `MediaAsset` metadata. It performs no MinIO read, stat,
list, download, delete or signed/public URL operation. It calls no real OCR provider, SDK or network
service and performs no STT or LLM work.

The route makes no database write for successful, review or failure output. Prisma schema and
migrations remain unchanged. The only audit write is the existing minimized denied-authorization
event for cross-tenant attempts.

## Contract And Test Evidence

OpenAPI documents only the exact nested `POST` route, optional allowlisted mock request and safe
response union. Contract and data-foundation validators explicitly allow this path while continuing
to reject standalone OCR, provider, download, signing and future-scope routes.

E2E coverage verifies authentication, image/screenshot/PDF candidates, cross-family denial,
unsupported and unsafe metadata rejection, low-confidence and failure behavior, confirmation and
downstream-use gates, no candidate persistence, response/log privacy, no object access and the exact
OpenAPI surface.

## Risks And Rollback

The mock candidate is selected from a synthetic fixture and does not represent the uploaded object.
Object existence, byte/checksum consistency, malware and content sanitization, real OCR quality,
worker idempotency, retries, rate limits and production mock-route policy remain unresolved before
real media processing or beta use.

Rollback removes the controller method, read-only API service and types, validation and DTO additions,
exact validator allowlist entries, generated contract path, tests and this note. No database,
dependency or environment rollback is required.
