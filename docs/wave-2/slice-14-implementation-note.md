# Wave 2 Slice 14 Implementation Note

## Scope

Slice 14 adds an internal, metadata-only media processing readiness foundation under
`apps/api/src/media-processing-readiness/`. The module is not imported into `AppModule`, has no
controller and does not change OpenAPI.

The service makes a deterministic decision about whether an existing uploaded `MediaAsset`
metadata record may be handed to a future text-recognition worker. It does not enqueue work,
read object bytes or call any recognition, transcription or language-model boundary.

## Readiness Rules

A record is ready only when all of these conditions hold:

- media, family, child profile and homework session IDs are opaque UUIDs;
- the media belongs to both a family and a homework session;
- the kind is `HOMEWORK_IMAGE`, `HOMEWORK_SCREENSHOT` or `HOMEWORK_PDF`;
- the MIME type matches the kind and the positive size is within the existing upload limit;
- retention is `TEMPORARY`, has not expired and has no deletion request or deletion timestamp;
- the storage key exists, passes the existing tenant-scoped key policy and exactly matches the
  family, child profile, media ID, kind and MIME metadata;
- a lowercase SHA-256 checksum exists and has the expected 64-character form.

Unsafe records return a typed blocked reason without the storage key or sensitive diagnostics.
Voice audio returns `VOICE_MEDIA_DEFERRED`: Slice 13 does not provide an approved voice upload or
audio storage-key path, so this slice does not claim transcription readiness.

## Result Boundary

Ready results are metadata-only and identify the media asset, policy version, disposition,
untrusted-candidate requirement and learner-confirmation requirement. Object existence is always
`UNKNOWN_NOT_VERIFIED`.

Results do not contain storage keys, original filenames, raw media, base64, child identity data,
credentials, provider payloads, prompts, completions, recognized or transcribed text, answers,
solutions or generated hints. Diagnostic redaction covers those fields and values as an additional
defense; the service itself performs no logging.

## Why Object And Content Verification Remain Deferred

Slice 13 computes and stores a checksum after its local object write. Slice 14 treats a valid stored
checksum as upload-completion metadata, but it cannot independently prove that the object still
exists or that its current bytes match the checksum. It intentionally performs no MinIO read, stat,
list, download or delete operation.

A future approved worker needs a private object-access design, existence and checksum verification,
idempotency and reconciliation behavior, malware and content-sanitization policy, retries, audit
rules and deletion coordination before processing real child media.

## Recognition And Transcription Compatibility

The existing deterministic recognition and transcription boundaries remain unchanged. Their
candidates stay untrusted and require learner confirmation; transcript candidates also require
editable review. This readiness service does not import or execute either boundary. No provider,
SDK, network call, prompt or completion is introduced.

## Tests And Rollback

Tests cover supported image, screenshot and PDF metadata; unsupported and voice kinds; kind/MIME
mismatch; unsafe and expired retention; missing, mismatched and unsafe storage keys; missing and
malformed checksums; safe result and diagnostic shapes; candidate trust gates; and repository-level
absence of routes, object reads, contract changes and schema expansion.

Rollback removes the internal module, service, types, test registration and this note. No database,
contract, dependency or environment rollback is required.
