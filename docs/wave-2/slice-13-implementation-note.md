# Wave 2 Slice 13 Implementation Note

## Scope

Slice 13 adds one authenticated local-development upload route:

- `POST /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/upload`

The route accepts exactly one multipart `file` field for an existing `MediaAsset` metadata record. It returns the existing metadata-only media asset response.

## Local MinIO Boundary

The upload adapter accepts only loopback HTTP endpoints from the existing `S3_*` local configuration. It may check or create the configured private local bucket and may call `putObject`. The adapter exposes no object read, download, list, stat, delete, public URL or signed URL operation.

The upload uses the existing server-generated PII-safe storage key. The multipart filename is ignored and is never stored or returned. Bytes are buffered only up to the configured 10 MiB local limit so size, MIME, checksum and file signature can be validated before the first storage write.

Dependencies added at exact versions:

- `@fastify/multipart@10.1.0`
- `minio@8.0.7`

## Authorization And Safety

Parent bearer authentication is required. The homework session and media asset are selected by authenticated family, homework session and media asset IDs. Cross-family or mismatched lookups return the existing tenant-safe not-found response and record the existing denied-authorization audit metadata.

Upload is allowed only while metadata is `TEMPORARY`, before `retentionUntil`, with no deletion request or deletion timestamp. The uploaded MIME type must be supported and equal the stored MIME type, its size must equal stored metadata, its signature must match the MIME type, and its SHA-256 checksum must match stored metadata when one already exists. A successful write stores the computed checksum in the existing field.

Responses and ordinary logs contain no multipart filename, raw bytes, base64, provider output, OCR/STT/LLM data, prompt, completion, answer, solution or generated hint. Storage keys remain metadata and are never logged as upload diagnostics.

## Deferred Work

Slice 13 adds no download, object-read, list, delete, public URL or signed URL behavior. Deletion workers, OCR/STT processing, provider calls, web or voice UI, production storage policy, production credentials, malware scanning and full image/PDF sanitization remain deferred to separately approved slices.

## Rollback And Risks

Rollback removes the upload controller/service/validation, local object adapter, route contract, tests, two exact dependencies and this note. No database rollback is required.

The current schema has no upload-completion timestamp or object version. Repeated uploads are constrained by size and checksum but can rewrite identical content at the same key. Object storage and database checksum update are not one transaction; production-grade upload state and reconciliation remain required before real child media use.
