# Wave 2 Slice 10 implementation note

## Status

Wave 2 Slice 10 adds the first authenticated homework metadata API foundation.
It does not add upload, download or signing endpoints; media binary handling;
OCR, STT or LLM endpoints; provider SDKs or external calls; voice recording or
transcription UI; hint generation; answer checking; solution generation; web
homework UI; billing; school; teacher/admin; mobile; analytics or deployment
behavior.

## Routes added

All routes require parent bearer authentication:

- `POST /homework/sessions`;
- `GET /homework/sessions`;
- `GET /homework/sessions/{homeworkSessionId}`;
- `POST /homework/sessions/{homeworkSessionId}/attempts`;
- `GET /homework/sessions/{homeworkSessionId}/attempts`.

These routes expose metadata only and are documented in
`packages/contracts/openapi.json`.

## Metadata-only boundary

Homework session responses contain only:

- internal session, family, child and creator identifiers;
- subject `math`;
- grade level;
- source type metadata;
- session status;
- timestamps and archival timestamp.

Homework attempt responses contain only:

- internal attempt, family, session, child and creator identifiers;
- monotonic attempt number;
- attempt status;
- timestamps.

The API does not accept or return learner answer text, task text, transcript
bodies, OCR output, STT output, prompts, completions, provider payloads,
generated hints, raw media, uploaded files, signed URLs or copied textbook
content.

## Tenant authorization behavior

The controller authenticates the parent through the existing authorization
foundation. The service:

- verifies the child profile belongs to the authenticated parent's family before
  creating a homework session;
- derives `familyId` from the authorized family context and rejects
  client-provided `familyId`;
- lists only sessions for the authenticated family;
- optionally filters by child only after child access is verified;
- resolves homework sessions by `id` plus authorized `familyId`;
- creates and lists attempts only after the parent can access the session;
- returns safe `404` for cross-family session and attempt access.

Cross-family denied homework lookups are recorded through the existing
authorization audit path with internal identifiers only.

## Forbidden fields

Validation rejects forbidden or unsupported request fields including:

- `answer`, `finalAnswer`, `solution`, `fullSolution`, `exactSolution`;
- `generatedHint`, `hintText`;
- `transcript`, `ocrResult`, `sttResult`;
- `llmPrompt`, `llmCompletion`, `providerPayload`, `modelOutput`;
- `rawMedia`, uploaded-file and media-binary fields;
- `textbookContent`;
- client-provided `familyId`.

OpenAPI validation now allows exactly the approved homework metadata paths and
continues to forbid future-scope asset, media, OCR, STT, LLM, hint, voice,
billing, school, teacher/admin and upload paths.

## Tests

`apps/api/test/homework-api.e2e.mjs` covers:

- unauthenticated homework routes rejected;
- authenticated parent creates homework session metadata;
- authenticated parent lists and gets own homework sessions;
- authenticated parent creates and lists attempt metadata;
- attempt numbers are monotonic;
- malformed and forbidden fields are rejected safely;
- parent A cannot access parent B's homework session or attempts;
- responses contain no answer, solution, hint, OCR/STT/LLM, provider or raw
  media fields;
- OpenAPI documents only metadata fields for the new routes;
- server logs omit child nicknames, parent emails, tokens, auth headers,
  cookies, secrets and unsafe payload values.

Existing boundary tests were updated so they allow the approved homework
metadata routes while continuing to block upload, media, provider, hint and
voice expansion.

## Deferred work

Still deferred to later explicitly approved slices:

- media upload/download/signing endpoints;
- asset storage writes or MinIO reads/writes;
- OCR/STT/LLM public endpoints or real provider activation;
- recognition, transcription, answer checking, deterministic math validation or
  solution generation;
- hint generation or learner-facing assistance responses;
- web homework UI and voice recording/transcript UI;
- media cleanup workers;
- billing, school, teacher/admin, mobile, analytics and deployment expansion.
