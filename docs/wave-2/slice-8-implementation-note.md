# Wave 2 Slice 8 implementation note

## Status

Wave 2 Slice 8 adds an internal LLM boundary and deterministic local mock only.
It does not add public LLM, homework, hint, upload, download or signing
endpoints; web UI; OpenAPI route changes; real LLM providers; external calls;
OCR/STT adapters beyond existing internal mocks; voice behavior; answer
checking; solution generation; database prompt or completion persistence;
billing; school; teacher/admin; mobile; analytics or deployment behavior.

## Internal foundation

Added internal API LLM boundary helpers under `apps/api/src/llm-boundary/`:

- `LlmBoundaryService`;
- `LocalMockLlmProvider`;
- `LlmBoundaryModule`;
- provider-neutral LLM request, result, confidence, refusal and failure types;
- policy guard for Slice 5 assistance contracts;
- policy guard for Slice 4/Slice 5 attempt eligibility;
- unconfirmed OCR/STT input rejection;
- redacted LLM diagnostic helper.

The module is not imported into `AppModule` and has no controller. It is ready
only for later internal use by an explicitly approved assistance policy slice.

## Boundary rules

The boundary accepts metadata only. It does not accept prompt text, completion
text, provider payloads, raw OCR output, raw STT transcript candidates, source
answers, source solutions, generated help text or copied textbook content.

Every request must pass:

- a valid Slice 5 no-answer assistance contract;
- an attempt gate that is eligible through the Slice 5 assistance eligibility
  check;
- a safe request kind such as safe assistance intent or safe refusal
  classification;
- a source trust marker of learner-confirmed text or internal-policy-only.

The boundary rejects:

- direct-answer requests;
- full-solution and step-by-step source-solution requests;
- answer checking or correctness scoring;
- prompt, completion and provider payload fields;
- unconfirmed OCR candidates;
- unconfirmed STT transcript candidates;
- copied textbook-content fields.

## Mock behavior

The local mock uses stable synthetic fixture IDs:

- `safe-concept-reminder` returns structured safe intent metadata only;
- `safe-refusal` returns a structured refusal state;
- `provider-failure` returns a safe typed failure.

The mock does not generate learner-facing prose, hints, answers, solutions or
step-by-step work. It does not call a provider SDK, use network access, require
secrets, add dependencies, stream output, use tool calling or use real homework,
photo, audio, transcript or textbook fixtures.

## Safety boundaries

LLM output is strict metadata, not child-facing text. Results include provider
or mock name, mock version, schema version, policy version and confidence or
refusal status. Results also explicitly declare that there is no learner-facing
text and that later post-validation is required.

Slice 8 does not store prompts, completions, provider payloads, answers,
solutions, generated hints, transcripts or OCR output in the database. It does
not evaluate correctness, generate hints, solve math or call any external
provider.

OCR and STT outputs remain untrusted until learner confirmation. Unconfirmed
recognition or transcription candidates are refused before provider evaluation.

Diagnostics redact prompt-like, completion-like, provider-payload, answer,
solution, help-text, transcript, OCR/STT, raw media, textbook, credential,
cookie, token, child identity and email values.

## Real provider activation evidence

Before any real LLM provider receives child, homework, voice or learning data,
an approved future slice must document:

- provider choice and purpose;
- exact minimized data fields sent;
- residency, retention and training-use settings;
- subprocessors and security controls;
- deletion mechanism and provider request identifiers;
- structured output reliability and invalid-schema behavior;
- answer-leak, prompt-injection and policy-bypass evaluation;
- fallback behavior;
- cost, rate and concurrency limits;
- kill-switch owner and disabled-by-default environment behavior;
- security, privacy, curriculum and QA review verdicts.

Without this evidence, the LLM boundary remains mock-only.

## Validation coverage

`apps/api/test/llm-boundary.test.mjs` covers:

- deterministic safe-intent mock output through an allowed contract;
- deterministic safe refusal output without generated text;
- invalid assistance contract rejection;
- missing attempt eligibility rejection;
- unconfirmed OCR and STT candidate rejection;
- direct answer, full solution and answer-checking request rejection;
- solution, prompt, completion, provider payload, transcript, OCR/STT and
  copied textbook field rejection;
- safe provider failure behavior without provider payloads;
- absence of answer, solution, generated help text, prompt, completion,
  provider payload, transcript and OCR/STT output in results;
- redaction of sensitive diagnostic values;
- absence of public LLM/homework/hint/media/voice routes, controllers,
  AppModule imports, Prisma LLM persistence fields, SDK usage and network
  calls.

## Explicit exclusions

This slice does not:

- create API controllers or routes;
- change generated OpenAPI contracts;
- add Prisma models or migrations;
- integrate a real LLM provider;
- add OpenAI, Anthropic, Gemini or other AI SDKs;
- store prompts, completions, provider payloads or generated help;
- generate hints, answers, solutions or correctness scores;
- create web homework UI, voice behavior, OCR/STT provider integrations,
  billing, school, teacher/admin, mobile, analytics or deployment behavior.
