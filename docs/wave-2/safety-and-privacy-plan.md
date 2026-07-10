# Wave 2 safety and privacy plan

## Status

This is a planning document. It does not implement homework, media, AI, voice,
analytics, retention or provider behavior.

## Safety goals

Wave 2 must help a learner make progress without turning the platform into an
answer service. The core safety goals are:

- prevent direct answer leakage;
- enforce meaningful attempts before higher hints;
- prefer deterministic validation for supported mathematics;
- make uncertainty visible and safe;
- minimize child data collection and exposure;
- keep raw media private and temporary;
- keep provider output untrusted until schema and policy validation;
- preserve voice input as optional, foreground-only and confirmation-based.

## No direct answer leakage

Student mode must never expose:

- the final answer to the original homework problem;
- the complete source solution;
- hidden solution model fields;
- raw provider output;
- a "similar example" with identical data or a trivially copied answer;
- debug, trace, schema or metadata fields that contain the answer.

Required controls for implementation slices:

- student-facing response schemas exclude source answer and full solution
  fields;
- internal solution models, when introduced, stay server-side and protected by
  policy checks;
- hint responses use structured hint intents and reviewed templates or
  constrained generation;
- direct answer requests are refused or redirected to an attempt prompt;
- answer-leak tests cover text, recognized image text, voice-confirmed text,
  prompt injection and repeated pressure;
- raw provider output is never sent directly to the learner.

## Attempt-gated hints

A higher hint level requires a new meaningful learner attempt. A meaningful
attempt must contain content relevant to the next solution action, such as:

- an equation transformation;
- a selected rule;
- a short explanation of the intended next step;
- a structured numeric or algebraic step;
- learner-confirmed text produced from a voice transcript.

Voice does not weaken the rule. A recording, transcript or low-confidence
recognition result is not a meaningful attempt until the learner confirms text
and that text passes the attempt rubric.

Implementation must store:

- current hint level;
- last meaningful attempt identifier;
- hint policy version;
- validation or refusal result;
- assistance level for later learning evidence.

## Hint levels

Wave 2 uses the ladder from the homework helper specification:

1. Restate the goal or ask a focusing question.
2. Remind a prerequisite or relevant rule.
3. Identify the error location or next subgoal.
4. Show a similar example with different data.
5. Give a more explicit scaffold without revealing the source answer.
6. Recommend prerequisite practice or escalation.

Rules:

- levels must advance one step at a time;
- each next level requires a new meaningful attempt;
- level 4 examples must differ in data and surface form;
- level 5 still cannot reveal the source answer;
- repeated failure goes to prerequisite practice or escalation, not answer
  disclosure.

## Refusal and fallback behavior

The safe outcome for uncertain or unsupported content is to slow down, ask for
confirmation or escalate. It is never acceptable to guess confidently.

Fallback states include:

- ask the learner to confirm or correct recognized task text;
- request another attempt;
- ask the learner to edit the transcript;
- offer typed input when voice fails;
- mark the problem unsupported;
- create a human-review or escalation case when approved;
- stop provider-backed processing when policy, schema or confidence checks fail.

Child-facing copy should be age-appropriate and should not expose internal error
details.

## Child PII minimization

Wave 2 data collection should use:

- internal IDs rather than names in services, logs and analytics;
- grade, subject and approved learning context only when required;
- no unnecessary exact birth date, school name, contact details or address;
- no raw task text, transcript body, image, PDF, audio or signed URL in ordinary
  logs or analytics;
- synthetic data and rights-cleared fixtures in tests;
- allowlisted analytics properties such as confidence bucket, error category,
  duration bucket and latency bucket.

Confirmed transcript text is child learning data only when the learner confirms
it and it is needed for the homework or learning record. Raw transcript before
confirmation remains restricted temporary processing data.

## Media retention

Temporary media includes:

- homework images;
- screenshots;
- PDFs;
- handwriting crops;
- raw audio;
- raw transcript and normalization proposals before confirmation when stored for
  review.

Implementation must store:

- retention class;
- `retentionUntil`;
- `deletedAt`;
- deletion status;
- cleanup attempts and error category;
- audit record for sensitive deletion failures or support access.

Exact production retention durations remain an open decision and must be
approved before beta with real users. Local implementation slices may use short
synthetic-test retention values only after they are documented and tested.

## Logging and audit rules

Ordinary logs may contain:

- internal IDs;
- request and correlation IDs;
- event type;
- status and error category;
- provider or mock version;
- policy version;
- duration, size, latency and cost buckets.

Ordinary logs must not contain:

- names, contacts or school identifiers;
- complete homework statements;
- raw chat, attempt or transcript bodies;
- raw images, PDFs or audio;
- signed URLs;
- secrets, tokens or auth headers;
- payment details.

Audit should cover:

- authorization denials;
- sensitive media lifecycle actions;
- voice session confirmation and cancellation by internal ID;
- support access with reason code when support access is later approved;
- deletion failures and retries;
- provider activation or kill-switch events when real providers are approved.

Audit records must still minimize personal data.

## Provider data handling

Provider adapters must enforce purpose limitation and minimization:

- OCR receives only sanitized images or extracted regions required for
  recognition;
- STT receives only the temporary audio required for transcription;
- LLM receives only confirmed, minimized text and policy context required for
  the approved task;
- raw audio is never sent to the tutoring LLM;
- provider responses are schema-validated and policy-validated before use;
- provider, model, schema and policy versions are stored;
- child data is not used for provider training by default;
- real providers require documented residency, retention, subprocessors,
  deletion mechanism, security controls, cost limits, fallback behavior and kill
  switch before activation.

Default local behavior must use deterministic mocks and make external calls
impossible without explicit configuration.

## Transcript confirmation

Voice-derived text enters homework only through this sequence:

1. Learner explicitly starts a foreground recording.
2. Learner stops or cancels, or recording reaches the configured limit.
3. Raw audio is uploaded to private temporary storage.
4. STT returns transcript candidates, confidence and uncertain fragments through
   the provider boundary.
5. Mathematical normalization proposes notation but does not become
   authoritative.
6. UI shows editable transcript and highlighted uncertainty.
7. Learner edits and confirms.
8. Only confirmed text is submitted as learner input.
9. Raw audio is deleted according to retention policy.

Low-confidence fragments must never submit automatically. Microphone denial,
unsupported browser APIs or transcription failure must leave typed input
available.

## Copyrighted textbook constraints

Wave 2 may store textbook metadata, section references and reviewed mappings.
It must not copy protected textbook statements, images, answer keys or exercise
sets without documented rights.

Tests and gold sets must use:

- synthetic tasks;
- original Learnika-authored tasks;
- public-domain or licensed material with recorded rights;
- minimal metadata references when rights are not available.

Recognition of a learner-uploaded homework image is processing of user-provided
content for the learner's session. It does not authorize copying the source
exercise into fixtures, content libraries, prompt examples or documentation.

## Release blockers

Wave 2 implementation or release must block on:

- answer leakage above the approved threshold;
- severe math-error regression above the approved threshold;
- unsupported content classified as certain;
- hint progression without meaningful attempts;
- transcript confirmation bypass;
- raw audio, images or transcript bodies in logs or analytics;
- temporary media deletion not proven;
- provider policy evidence missing for any real provider;
- real provider configuration enabled by default;
- unclear textbook rights for fixtures or content;
- tenant-isolation failure.
