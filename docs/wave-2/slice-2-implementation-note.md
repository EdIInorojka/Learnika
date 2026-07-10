# Wave 2 Slice 2 implementation note

## Status

Wave 2 Slice 2 adds the homework and media domain model foundation only. It does
not add product endpoints, generated route contracts, upload or storage
implementation, OCR, Speech-to-Text, LLM, voice recording, hint generation,
homework UI, billing, school, teacher/admin, mobile, analytics or deployment
features.

## Database changes

Migration: `20260710082038_homework_media_domain_foundation`.

New metadata-only models:

- `HomeworkSession`
- `HomeworkAttempt`
- `MediaAsset`

New enums:

- `HomeworkSessionStatus`
- `HomeworkSourceType`
- `HomeworkAttemptStatus`
- `MediaAssetKind`
- `MediaRetentionStatus`

## Boundary decisions

- Homework sessions are family-scoped and child-scoped.
- Attempts are metadata-only and scoped to a homework session, family and child.
- Media assets are metadata-only and include retention/deletion metadata.
- `createdByUserId` is optional and uses existing `User` references for audit
  compatibility.
- Media storage uses a placeholder `storageKey` field only; this slice does not
  implement upload, download, signed URLs, MinIO operations or processing.

## Explicit exclusions

The schema intentionally excludes:

- answer or solution fields;
- generated hint fields;
- OCR result fields;
- Speech-to-Text transcript fields;
- LLM prompt or completion fields;
- provider payload fields;
- raw media content fields;
- copied textbook content fields;
- child health, location or sensitive personal data fields.

## Validation coverage

`apps/api/prisma/validate-data-foundation.mjs` now checks that:

- the new homework/media metadata models and enums exist;
- tenant ownership and retention/deletion metadata are represented;
- forbidden answer, solution, hint, transcript, OCR, STT, LLM and provider
  payload fields are absent;
- forbidden future models are absent;
- forbidden future route prefixes are absent from the generated OpenAPI
  artifact.
