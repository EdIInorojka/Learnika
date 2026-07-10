# Wave 2 Slice 6 implementation note

## Status

Wave 2 Slice 6 adds an internal OCR boundary and deterministic local mock only.
It does not add public OCR, homework, upload, download, signing or recognition
endpoints; web UI; OpenAPI route changes; real OCR providers; external calls;
STT or LLM adapters; voice behavior; hint generation; answer checking; database
OCR persistence; billing; school; teacher/admin; mobile; analytics or
deployment behavior.

## Internal foundation

Added internal API OCR boundary helpers under `apps/api/src/ocr-boundary/`:

- `OcrBoundaryService`;
- `LocalMockOcrProvider`;
- `OcrBoundaryModule`;
- provider-neutral OCR request, result, confidence, status and failure types;
- redacted OCR diagnostic helper.

The module is not imported into `AppModule` and has no controller. It is ready
only for later internal use by an explicitly approved homework recognition
slice.

## Supported scope

The boundary accepts safe metadata for MVP homework media only:

- `HOMEWORK_IMAGE` with `image/jpeg`, `image/png` or `image/webp`;
- `HOMEWORK_SCREENSHOT` with `image/jpeg`, `image/png` or `image/webp`;
- `HOMEWORK_PDF` with `application/pdf`.

Voice audio remains deferred. Unsupported asset kinds, unsupported MIME types,
invalid IDs, unsafe storage keys, unexpected metadata fields and invalid fixture
IDs are rejected before recognition.

The request type contains metadata only. It does not include raw media bytes,
signed URLs, original filenames, child names, transcript text, provider payloads
or LLM prompts.

## Mock behavior

The local mock uses stable synthetic fixture IDs:

- `clear-linear-equation` returns one untrusted candidate that requires learner
  confirmation;
- `low-confidence-equation` returns a `NEEDS_REVIEW` state without candidate
  text;
- `prompt-injection-equation` returns text only as an untrusted worksheet
  candidate;
- `provider-failure` returns a safe typed failure.

The mock does not read image files, call MinIO, call a provider SDK, use network
access, require secrets or add dependencies.

## Safety boundaries

OCR output is a candidate, not truth. A candidate must be learner-confirmed
before a later approved slice may use it as task text.

Slice 6 does not store OCR output in the database. It does not persist
recognized text, provider payloads, transcripts, prompts, completions, answers,
solutions or generated hints.

OCR results include provider/mock name, model/mock version, schema version,
policy version and confidence/status metadata. Diagnostics redact storage keys,
filenames, raw text, credentials, child identity fields, email addresses, raw
media markers, signed URLs, transcripts and provider payload values.

## Validation coverage

`apps/api/test/ocr-boundary.test.mjs` covers:

- deterministic mock OCR output;
- untrusted candidate status and learner-confirmation requirement;
- low-confidence review behavior without candidate text;
- prompt-injection image text treated as untrusted worksheet content;
- safe provider failure behavior without provider payloads;
- MVP homework image/PDF media scope;
- rejection of voice audio, unsupported MIME types and unsafe metadata;
- absence of answer, solution, generated hint, transcript, prompt, completion
  and provider payload fields in OCR results;
- redaction of sensitive diagnostic values;
- absence of public OCR/homework/media/voice routes, controllers, AppModule
  imports and Prisma OCR persistence fields.

## Explicit exclusions

This slice does not:

- create API controllers or routes;
- change generated OpenAPI contracts;
- add Prisma models or migrations;
- read, upload, download, sign, transform or process media objects;
- integrate a real OCR provider;
- create STT, LLM, voice, hint or answer-checking behavior;
- store OCR candidates or provider data;
- use copyrighted textbook fixtures.
