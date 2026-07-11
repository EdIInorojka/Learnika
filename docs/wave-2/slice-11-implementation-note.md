# Wave 2 Slice 11 Implementation Note

## Scope

Slice 11 adds an authenticated API for homework media asset metadata. It activates no media transfer or provider behavior.

Approved routes:

- `POST /homework/sessions/{homeworkSessionId}/media-assets`
- `GET /homework/sessions/{homeworkSessionId}/media-assets`
- `GET /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}`
- `PATCH /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/retention`

The retention route records a deletion request in metadata only. It does not delete an object.

## Implemented Boundary

- Parent authentication and existing family authorization are required.
- Homework sessions and media assets are resolved inside the authorized family boundary.
- Cross-family and mismatched session/asset access returns the tenant-safe not-found response and records the existing denied-access audit event.
- The client supplies only asset kind, MIME type, byte size and an optional SHA-256 checksum.
- Family, child, homework session and creator identifiers are derived by the server.
- The existing media-storage helper validates the approved homework image/PDF kinds, MIME combinations and configured size limit.
- The existing helper generates an opaque, tenant-scoped storage key without an original filename or child nickname.
- New metadata starts as `TEMPORARY` with a local 24-hour retention deadline.
- The only accepted retention transition is a metadata-only request to `DELETION_REQUESTED`.

## Explicit Non-Goals

This slice adds no upload, download, signed URL, binary, base64, object-storage read/write, OCR, STT, LLM, provider SDK, network provider call, hint, answer-checking, solution-generation, web UI or voice UI behavior. It adds no Prisma schema change, migration, dependency or environment variable.

Original filenames, raw media, OCR/STT text, prompts, completions, provider payloads, answers, solutions and generated hint text are rejected as request fields and are absent from the response contract.

## Test Evidence

The Slice 11 API test covers authentication, malformed input, MIME/type/size validation, forbidden-field rejection, server-derived ownership, PII-safe storage keys, list/read behavior, metadata-only deletion requests, tenant-safe not-found responses, denied-access audit evidence, OpenAPI bearer protection and absence of sensitive/provider fields.

Existing homework and safety tests were updated only to recognize the exact approved nested metadata paths. Contract and data-foundation validation continue to reject every other future homework route and standalone media/provider route.

## Rollback And Block Conditions

Rollback is limited to removing the media-assets module, its generated OpenAPI paths/schemas, the Slice 11 test registration and the exact validator allowlist entries. No database rollback is needed because this slice introduces no schema or migration.

Block later media-transfer work if retention policy remains unapproved, storage authorization cannot be made single-use and tenant-scoped, object deletion cannot be verified, or any route would expose raw media, original filenames, provider payloads or child PII.
