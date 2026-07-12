# Wave 2 Slice 15 Implementation Note

## Scope

Slice 15 adds an internal mock OCR processing orchestration foundation under
`apps/api/src/mock-ocr-processing/`. The module is not imported into `AppModule`, has no controller
and does not change OpenAPI.

The coordinator accepts an existing `MediaAsset` metadata record, a deterministic synthetic mock
fixture ID and an evaluation time. It performs no database lookup or write and receives no object
bytes, base64, original filename, URL or learner-facing request.

## Orchestration Rules

The coordinator always evaluates the committed Slice 14 readiness policy first. Unsupported media,
unsafe or expired retention, missing or unsafe storage keys, missing or malformed checksums and
invalid tenant or homework-session scope return a typed blocked result before the OCR boundary is
called.

Only ready `HOMEWORK_IMAGE`, `HOMEWORK_SCREENSHOT` and `HOMEWORK_PDF` metadata is mapped to the
existing Slice 6 OCR boundary allowlist. The request contains only opaque IDs, media kind, MIME type,
size, checksum, tenant-scoped internal storage key and synthetic fixture metadata. Voice audio stays
deferred through the readiness policy.

## Candidate Trust And Failure Behavior

The existing deterministic local mock remains the only recognition implementation. A successful
candidate keeps `UNTRUSTED_OCR_CANDIDATE` trust and requires learner confirmation. The orchestration
result also sets `downstreamUseAllowed` to `false`; this slice adds no confirmation or downstream
submission path.

Low-confidence recognition returns `NEEDS_REVIEW` without candidate text. The mock provider failure
fixture returns the existing safe `FAILED` result. An invalid boundary request is converted to a
redacted orchestration failure without exposing boundary details. No result is persisted.

Provider/mock name, model version, schema version, policy version and confidence remain safe boundary
metadata. Results exclude storage keys, raw media, base64, original filenames, provider payloads,
prompts, completions, answers, solutions and generated hints.

## Object And Provider Boundary

Object existence remains `UNKNOWN_NOT_VERIFIED`. This slice does not read, stat, list, download,
delete or sign MinIO objects. The mock fixture produces synthetic candidate text without inspecting
the uploaded object, so this slice proves orchestration and safety behavior rather than recognition
quality or upload/object consistency.

No real OCR provider, provider SDK, network call, STT processing, LLM call, prompt, completion,
answer checking, hint generation or learner-facing text generation is introduced.

## Tests, Risks And Rollback

Tests cover ready image, screenshot and PDF metadata; readiness rejection before boundary invocation;
unsafe retention; untrusted candidate confirmation; low-confidence review; mock failure; safe output
fields; and absence of persistence, object access, public routes, contract changes and schema changes.

Before a real processing worker is approved, Learnika still needs private object-read authorization,
existence and checksum verification, malware and content sanitization, idempotency, retry and
reconciliation behavior, retention coordination, job audit rules and explicit real-provider review.

Rollback removes the internal module, service, types, test registration and this note. No database,
contract, dependency or environment rollback is required.
