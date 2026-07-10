# Wave 2 Slice 7 implementation note

## Status

Wave 2 Slice 7 adds an internal Speech-to-Text boundary and deterministic local
mock only. It does not add public STT, voice, homework, upload, download,
signing or transcription endpoints; web voice UI; OpenAPI route changes; real
STT providers; external calls; OCR or LLM adapters beyond existing internal
boundaries; voice recording behavior; hint generation; answer checking;
database transcript persistence; billing; school; teacher/admin; mobile;
analytics or deployment behavior.

## Internal foundation

Added internal API STT boundary helpers under `apps/api/src/stt-boundary/`:

- `SttBoundaryService`;
- `LocalMockSttProvider`;
- `SttBoundaryModule`;
- provider-neutral STT request, result, confidence, status and failure types;
- untrusted transcript candidate and uncertain-fragment types;
- redacted STT diagnostic helper.

The module is not imported into `AppModule` and has no controller. It is ready
only for later internal use by an explicitly approved voice-session slice.

## Supported scope

The boundary accepts safe metadata for short foreground voice audio only:

- `VOICE_AUDIO` with `audio/webm`, `audio/ogg` or `audio/mp4`;
- `ru-RU` locale;
- duration up to 60 seconds;
- metadata-only family, child, voice-session and audio IDs;
- tenant-scoped temporary audio storage key metadata.

The request type does not include raw audio bytes, signed URLs, original
filenames, child names, transcript bodies, provider payloads, prompts,
completions, answers, solutions or generated hints.

The boundary rejects homework images, screenshots, PDFs, OCR text, text MIME
types, invalid IDs, unsafe storage keys, unexpected metadata fields, unsupported
durations and invalid fixture IDs.

## Mock behavior

The local mock uses stable synthetic fixture IDs:

- `clear-russian-step` returns one untrusted transcript candidate that requires
  editable learner review and confirmation;
- `low-confidence-audio` returns a `NEEDS_REVIEW` state without candidate text;
- `prompt-injection-audio` returns spoken text only as an untrusted transcript
  candidate with uncertain fragments;
- `provider-failure` returns a safe typed failure.

The mock does not read audio files, call MinIO, call a provider SDK, use network
access, require secrets, add dependencies or use real child voice fixtures.

## Safety boundaries

STT output is a candidate, not truth. A candidate must be editable and
learner-confirmed before a later approved slice may use it as homework or
learning input.

Slice 7 does not store transcript output in the database. It does not persist
transcript text, provider payloads, prompts, completions, answers, solutions or
generated hints. It also does not send STT output to any LLM provider.

Voice input remains a future optional foreground-only UI flow with typed
fallback, explicit start/stop/cancel, visible recording state and raw-audio
retention/deletion behavior. This slice implements none of that UI or recording
flow.

STT results include provider/mock name, model/mock version, schema version,
policy version and confidence/status metadata. Diagnostics redact storage keys,
filenames, candidate text, raw transcript-like values, credentials, cookies,
child identity fields, email addresses, audio identifiers, raw audio markers,
signed URLs and provider payload values.

## Real provider activation evidence

Before any real STT provider receives child, homework, voice or learning data,
an approved future slice must document:

- provider choice and purpose;
- exact data fields sent;
- residency, retention and training-use settings;
- subprocessors and security controls;
- deletion mechanism and provider request identifiers;
- latency, confidence and Russian math-speech quality evidence;
- fallback behavior and typed-input recovery;
- cost, rate and concurrency limits;
- kill-switch owner and disabled-by-default environment behavior;
- security and privacy review verdict.

Without this evidence, the STT boundary remains mock-only.

## Validation coverage

`apps/api/test/stt-boundary.test.mjs` covers:

- deterministic mock STT output;
- untrusted transcript candidate status and editable learner-confirmation
  requirement;
- low-confidence review behavior without candidate text;
- prompt-injection spoken text treated as untrusted transcript content;
- safe provider failure behavior without provider payloads;
- voice-audio-only metadata scope;
- rejection of OCR text, homework images, screenshots, PDFs, text MIME types
  and unsafe metadata;
- absence of answer, solution, generated hint, prompt, completion and provider
  payload fields in STT results;
- redaction of sensitive diagnostic values, audio identifiers and transcript
  bodies;
- absence of public STT/voice/homework/media routes, controllers, AppModule
  imports, Prisma transcript persistence fields, SDK usage, network calls and
  audio processing.

## Explicit exclusions

This slice does not:

- create API controllers or routes;
- change generated OpenAPI contracts;
- add Prisma models or migrations;
- upload, download, sign, read, transcode or process audio objects;
- integrate a real STT provider;
- create browser voice recording or transcript confirmation UI;
- create OCR, LLM, hint or answer-checking behavior;
- store transcript candidates or provider data;
- use real child audio fixtures.
