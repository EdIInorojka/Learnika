# Wave 2 Slice 9 implementation note

## Status

Wave 2 Slice 9 adds an internal safety evaluation and no-answer regression
harness only. It does not add public homework, hint, media, OCR, STT, LLM,
upload, download or signing endpoints; web UI; OpenAPI route changes; Prisma
schema changes; migrations; provider SDKs; external calls; voice implementation;
hint generation; answer checking; solution generation; billing; school;
teacher/admin; mobile; analytics or deployment behavior.

## Safety harness purpose

The harness is an API test-only safety layer in
`apps/api/test/safety-harness.test.mjs`. It exercises the already approved
internal Wave 2 modules together:

- `homework-state`;
- `assistance-contract`;
- `media-storage`;
- `ocr-boundary`;
- `stt-boundary`;
- `llm-boundary`.

It uses deterministic synthetic fixtures only. It does not process real child
data, real homework photos or audio, real textbook content, provider payloads,
prompts or completions.

## No-answer regression categories

The harness checks that unsafe payloads are rejected or kept out of safe outputs
for:

- direct final answers;
- full source solutions;
- step-by-step exact source solutions;
- answer-checking and solution-generation request kinds;
- generated hint text;
- prompt fields;
- completion fields;
- provider payload fields;
- copied textbook content fields;
- raw media fields.

Safe fallback and refusal outputs are verified to contain only policy, category,
reason, provider/mock metadata and validation flags. They must not contain
answers, solutions, generated hint text, prompts, completions or provider
payloads.

## Cross-boundary checks

The harness confirms:

- homework attempt gates still deny assistance before a submitted meaningful
  attempt;
- assistance contracts reject answer, solution, generated hint, provider,
  prompt-like and copied-textbook fields;
- OCR candidates remain untrusted and require learner confirmation;
- STT transcript candidates remain untrusted, editable and learner-confirmed
  before use;
- LLM requests reject unconfirmed OCR and STT source markers before evaluation;
- media storage metadata uses server-generated scoped keys and does not carry
  original filenames;
- diagnostics from all internal modules redact child nicknames, parent emails,
  tokens, cookies, authorization headers, secrets, storage keys, filenames,
  transcripts, raw media and provider-like values.

## Scope guards

Slice 9 also asserts that the safety harness has not widened product scope:

- no public API routes were created for homework, media, OCR, STT, LLM, voice,
  hints or assistance;
- the existing OpenAPI artifact remains limited to already approved routes;
- no controller files were added under the internal Wave 2 boundary modules;
- `AppModule` does not import the internal Wave 2 modules;
- Prisma schema still has no prompt, completion, provider payload, transcript,
  OCR result, generated hint, source-answer or solution persistence;
- the migration set remains the approved Wave 1 plus Wave 2 domain foundation
  migrations;
- no OpenAI, Anthropic, Gemini, Whisper or provider SDK dependency was added.

## Deferred work

This slice does not create learner-facing assistance. Still deferred to later
explicitly approved slices:

- public homework or media endpoints;
- upload/download/signing routes;
- OCR/STT/LLM real provider activation;
- browser voice recording or transcript UI;
- hint generation or reviewed hint rendering;
- answer checking or deterministic math validation integration;
- temporary media cleanup workers;
- beta safety thresholds and closure-gate evaluation.

## Precondition for learner-facing homework assistance

Before any learner-facing homework assistance UI or endpoint is created, the
Slice 9 harness must remain green together with contract, database, infra and
full repository validation. Any new route, schema, provider or UI slice must
extend the harness instead of bypassing it.
