# Wave 2 Slice 12 Implementation Note

## Scope

Slice 12 adds an internal metadata-only lifecycle and retention cleanup foundation for existing `MediaAsset` records. The module is not imported into `AppModule`, has no controller and does not change OpenAPI.

## Lifecycle States

- `TEMPORARY` may become `DELETION_REQUESTED` after an explicit request.
- `TEMPORARY` may become `RETENTION_EXPIRED` only at or after its stored `retentionUntil` deadline.
- Repeated deletion requests and expiry evaluations are idempotent metadata operations.
- `DELETION_REQUESTED` and `RETENTION_EXPIRED` metadata may become `DELETED`.
- `DELETED` metadata cannot re-enter an active or cleanup-eligible state.

Every transition result is marked `metadataOnly` and states that object deletion was not performed or verified. The service computes a deadline only from an explicitly supplied duration; it does not establish an unresolved production retention duration.

## Cleanup Candidate Selection

The selector accepts existing media metadata and returns only records already marked `DELETION_REQUESTED` or `RETENTION_EXPIRED` whose relevant timestamp is due. `TEMPORARY` records are not selected even when their deadline has passed; they require the explicit expiry transition first. Future-dated requests, deleted records and invalid metadata are not selected.

Candidates contain the internal object key only for a future authorized cleanup worker. The key is not a credential, URL or public API field. Diagnostics and audit-safe transition metadata exclude or redact storage keys, filenames, child identity fields, tokens, cookies, authorization headers, secrets, raw content and provider-like data.

## What This Slice Does Not Prove

`DELETED` means only that metadata was moved to the deleted state. Slice 12 does not prove that an object existed, that an object was deleted, or that deletion propagated to backups or providers. It performs no MinIO/S3 read, write, existence check or delete operation and creates no upload, download or signed URL behavior.

## Requirements Before Real Cleanup

Before an upload or deletion worker is approved, Learnika still needs an approved production retention schedule, private object authorization, idempotent upload completion, object-deletion verification semantics, retries and dead-letter handling, deletion-failure audit/alert rules, backup propagation policy and tests against synthetic private-storage objects. Real child media remains blocked until legal, security and deletion evidence is approved.

## Rollback

Rollback removes the internal `media-lifecycle` files, their test registration and this note. No database or contract rollback is required because Slice 12 adds no schema, migration, route, dependency or environment change.
