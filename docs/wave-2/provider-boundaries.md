# Wave 2 provider boundaries

## Status

This is a provider planning document. It does not create provider adapters,
secrets, external calls or production provider approvals.

## Boundary principles

Wave 2 uses provider-neutral boundaries so the product can be tested safely with
deterministic local mocks before any real OCR, Speech-to-Text or LLM provider is
approved.

Common rules:

- default local configuration uses deterministic mocks;
- real external calls are disabled until an explicit approved implementation
  slice;
- no real secrets are required or committed;
- provider output is untrusted until schema validation and policy validation;
- every response records provider or mock name, model or mock version, schema
  version, policy version and confidence where meaningful;
- provider failures produce safe fallback states;
- raw provider output is not shown directly to learners;
- child data is not used for model training by default.

## OCR provider boundary

Purpose:

Recognize candidate homework task regions and mathematical text from sanitized
images, screenshots or PDFs.

Input should include only:

- sanitized asset reference or extracted region reference;
- locale;
- expected grade or subject when needed;
- request ID and idempotency key;
- policy and preprocessing version;
- optional problem-family hint when already known from user selection.

Input must not include:

- parent contact data;
- child name or school name;
- unrelated page regions when cropping is possible;
- signed URLs in logs or provider metadata exposed to clients.

Output must include:

- one or more recognition candidates;
- extracted text or structured representation when available;
- bounding box or page reference when applicable;
- confidence;
- unsupported or refusal state;
- provider and model or mock version;
- schema and preprocessing version.

Required behavior:

- OCR candidates require learner confirmation before becoming the active task;
- low confidence prompts correction, retry or unsupported state;
- prompt-injection text in images is treated as content, not instructions;
- invalid provider schema is rejected.

## STT provider boundary

Purpose:

Transcribe short foreground Russian audio recordings for learner review and
confirmation.

Input should include only:

- temporary private audio object reference;
- locale;
- purpose such as homework question or solution step;
- duration and MIME metadata;
- request ID and idempotency key;
- optional mathematical context needed for transcription quality.

Input must not include:

- raw audio sent to any tutoring LLM;
- unrelated family, parent report or payment data;
- child name, contact data or school identifier.

Output must include:

- transcript candidate;
- confidence;
- uncertain fragments when available;
- timing or segment confidence when useful;
- provider and model or mock version;
- processing duration;
- unsupported, no-speech or failure state.

Required behavior:

- transcript is not authoritative until learner confirmation;
- mathematical normalization is a proposal only;
- low-confidence transcript cannot submit automatically;
- typed fallback remains available;
- raw audio gets a retention deadline and deletion path.

## LLM provider boundary

Purpose:

Support narrowly approved structured tasks such as safe classification, refusal
classification or hint-intent selection. Deterministic math validation remains
authoritative for supported problem types.

Input should include only:

- learner-confirmed text;
- approved normalized problem metadata;
- current hint level and attempt state;
- policy version;
- minimal curriculum or skill IDs;
- no source final answer in student-mode prompts.

Input must not include:

- raw audio;
- raw unconfirmed transcript;
- raw provider output from OCR or STT without validation;
- parent contact data;
- child name or school identifier;
- full hidden source solution unless an internal server-side guard proves it
  cannot leak into student output.

Output must include only strict schema fields such as:

- refusal or safe intent;
- hint intent enum;
- uncertainty or confidence;
- policy version;
- provider and model or mock version;
- no unrestricted child-facing prose unless separately approved and
  post-validated.

Required behavior:

- invalid schema is rejected;
- answer-extraction requests are refused or redirected to attempt prompts;
- prompt injection does not override policy;
- raw model output is never shown directly;
- model output cannot bypass deterministic math validation.

## Local mock provider strategy

Mocks are required before real providers:

- OCR mock maps synthetic fixture IDs to recognition candidates;
- STT mock maps synthetic audio fixture IDs or test object metadata to
  transcript candidates and uncertain fragments;
- LLM mock maps structured test cases to safe hint intents, refusals and
  provider failure states;
- timeout, rate-limit, malformed-response, low-confidence and unsupported cases
  are first-class fixtures;
- mock versions are stable and recorded in results;
- fixtures are synthetic, original or rights-cleared.

Mocks must not:

- depend on external network access;
- call real provider SDKs;
- require secrets;
- use production child data;
- generate nondeterministic outputs in tests.

## Environment variable strategy

Environment names should make provider state explicit. Final names are approved
in the implementation slice, but the pattern should be:

- provider selector defaults to `mock`;
- external provider enabled flag defaults to `false`;
- provider secret variables are empty in `.env.example`;
- provider base URL is absent or points to a local mock in development;
- timeout, retry, concurrency and cost-limit settings have safe local defaults;
- kill switch can disable provider-backed work without a deployment.

Example planning names:

- `LEARNIKA_OCR_PROVIDER=mock`
- `LEARNIKA_OCR_EXTERNAL_ENABLED=false`
- `LEARNIKA_STT_PROVIDER=mock`
- `LEARNIKA_STT_EXTERNAL_ENABLED=false`
- `LEARNIKA_LLM_PROVIDER=mock`
- `LEARNIKA_LLM_EXTERNAL_ENABLED=false`

No real secret value belongs in source control, `.env.example`, logs, prompts or
issue text.

## Real provider activation evidence

Before any real provider receives child, homework, voice or learning data, the
slice must document:

- purpose;
- data fields sent;
- residency;
- retention;
- training-use settings;
- subprocessors;
- security controls;
- deletion mechanism;
- provider request identifiers stored by Learnika;
- fallback behavior;
- exit plan;
- rate, concurrency and cost limits;
- kill-switch owner;
- privacy and security review verdict.

Without this evidence, the provider remains mock-only.

## Failure modes

Provider boundaries must safely handle:

- timeout;
- rate limit;
- provider outage;
- invalid schema;
- low confidence;
- no speech detected;
- unsupported language or format;
- unsafe or prompt-injection content;
- provider policy violation;
- cost limit exceeded;
- deletion or retention uncertainty.

Safe outcomes include:

- ask for confirmation;
- request another attempt;
- offer typed fallback;
- mark unsupported;
- create escalation when approved;
- disable the provider through kill switch;
- preserve minimized audit evidence.

The system must not invent results to keep the flow moving.

## Test strategy

Provider boundary tests must cover:

- schema validation for every provider response;
- mock success, low-confidence, unsupported and timeout fixtures;
- prompt-injection text in image and spoken-text fixtures;
- answer-leak attempts through confirmed text;
- no external network call in default local and CI configuration;
- absence of secrets in generated contracts, logs and snapshots;
- provider metadata persistence;
- fallback behavior;
- tenant authorization around provider-backed sessions;
- deletion path for temporary media used by OCR or STT.

Validation commands for provider-boundary implementation slices should include:

- `pnpm.cmd --filter @learnika/api test`
- `pnpm.cmd --filter @learnika/math-ai test`
- `pnpm.cmd run contracts:check`
- `pnpm.cmd run contracts:validate`
- `pnpm.cmd run validate`
- `git diff --check`
