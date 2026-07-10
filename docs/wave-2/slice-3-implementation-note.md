# Wave 2 Slice 3 implementation note

## Status

Wave 2 Slice 3 adds an internal secure media storage foundation only. It does
not add public upload, download or signed URL endpoints, generated route
contracts, web UI, OCR, Speech-to-Text, LLM, voice recording, hint generation,
answer checking, billing, school, teacher/admin, mobile, analytics or
deployment behavior.

## Internal foundation

Added internal API media storage helpers under `apps/api/src/media-storage/`:

- `MediaStorageService`
- `MediaStorageModule`
- media storage type definitions

The module is not imported into `AppModule` and has no controller. It is ready
for later internal use by approved Wave 2 slices.

## Safety behavior

The foundation provides:

- family and child scoped storage key generation;
- storage key validation;
- MIME allowlist validation for MVP homework image/PDF types only;
- file size validation with a local default limit;
- SHA-256 checksum helper;
- metadata-only mapping compatible with the existing `MediaAsset` model;
- diagnostic redaction for filenames, storage keys, raw content, credentials,
  tokens and identity-like fields.

Storage keys use opaque IDs only. They do not use child nicknames, parent email
addresses or original filenames.

## Explicit exclusions

This slice does not:

- create public API routes;
- create upload/download/signing URLs;
- call MinIO or any cloud object storage API;
- add S3/MinIO client dependencies;
- add Prisma models or migrations;
- accept voice audio assets;
- store raw media content;
- store answers, solutions, hints, transcripts, OCR/STT/LLM output or provider
  payloads.

## Validation coverage

`apps/api/test/media-storage.test.mjs` covers:

- tenant-scoped storage keys;
- PII-safe key generation;
- MIME validation;
- size validation;
- unsupported asset kind rejection;
- redaction of sensitive diagnostic values;
- metadata-only behavior;
- absence of public media/homework/voice routes and controllers.
