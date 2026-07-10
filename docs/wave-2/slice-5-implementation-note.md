# Wave 2 Slice 5 implementation note

## Status

Wave 2 Slice 5 adds an internal no-answer assistance contract foundation only.
It does not add public homework endpoints, hint generation endpoints,
upload/download/signing endpoints, generated route contracts, web UI, OCR,
Speech-to-Text, LLM, voice recording, answer checking, solution generation,
billing, school, teacher/admin, mobile, analytics or deployment behavior.

## Internal foundation

Added internal API assistance contract helpers under
`apps/api/src/assistance-contract/`:

- `AssistanceContractService`
- `AssistanceContractModule`
- assistance contract type definitions

The module is not imported into `AppModule` and has no controller. It is ready
for later internal use by approved Wave 2 assistance and hint-policy slices.

## Contract boundaries

The contract foundation defines structure only. It does not generate, persist or
return learner-facing help text.

Allowed assistance categories are:

- `PROBLEM_RESTATEMENT`;
- `CONCEPT_REMINDER`;
- `NEXT_STEP_QUESTION`;
- `WORKED_SIMILAR_EXAMPLE_DIFFERENT_DATA`;
- `CHECK_YOUR_WORK_PROMPT`;
- `STRATEGY_SUGGESTION`;
- `PREREQUISITE_REVIEW`;
- `SAFE_REFUSAL_FALLBACK`.

Assistance contracts must always enable these constraints:

- no final answer;
- no full solution;
- no generated text persistence;
- no provider payload;
- no raw media.

Similar-example contracts must explicitly require different data.

## Forbidden content

The internal validator rejects forbidden field names including:

- answer and final-answer fields;
- solution fields;
- generated help-text fields;
- OCR/STT transcript fields;
- LLM prompt and completion fields;
- provider payload and model output fields;
- raw media fields;
- copied textbook content fields.

Unsafe categories such as direct final result, complete source work, exact
problem step sequence, persisted generated help text, provider payload,
recognition or transcription payload, copied protected textbook content and
correctness/scoring result are defined as forbidden boundaries.

## No-answer checks

The validator is deterministic and conservative. It checks structure, policy
version, allowed categories, enabled constraints and forbidden field names. It
does not parse mathematics or evaluate correctness.

Failure diagnostics are redacted for answer-like, solution-like, help-text,
transcript, OCR/STT/LLM, provider, raw media, textbook, auth, token, secret,
email and child nickname values.

## Attempt-gating dependency

Slice 5 maps the Slice 4 attempt gate result into assistance eligibility:

- no attempt means assistance is not eligible;
- unsubmitted or cancelled attempts mean assistance is not eligible;
- a submitted attempt still requires the Slice 4 meaningful-attempt placeholder
  to be true;
- structural eligibility is possible only after the attempt gate is satisfied.

This slice does not advance hint levels, generate hints or score learner work.

## Explicit exclusions

This slice does not:

- create public API routes;
- create hint-generation endpoints;
- update OpenAPI for new routes;
- add Prisma models or migrations;
- store generated help text;
- store learner answers or solutions;
- store transcripts, OCR/STT/LLM outputs, prompts, completions, provider
  payloads or raw media content;
- call providers;
- perform answer checking or solution generation.

## Validation coverage

`apps/api/test/assistance-contract.test.mjs` covers:

- allowed assistance contract shapes;
- forbidden answer and solution field rejection;
- generated help-text field rejection;
- OCR/STT/LLM/provider field rejection;
- copied textbook content field rejection;
- unsafe category and disabled-constraint rejection;
- denial before any attempt exists;
- denial when meaningful-attempt placeholder is false;
- structural eligibility after the Slice 4 attempt gate is satisfied;
- safe fallback output without answer, solution or help text;
- redaction of sensitive diagnostic values;
- absence of public assistance/homework/media/voice routes and controllers.
