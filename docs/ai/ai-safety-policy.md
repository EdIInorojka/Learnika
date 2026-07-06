# AI safety and model policy

 

## Scope

Applies to recognition, transcription, classification, normalization, hint generation, transfer generation, reporting and future school-assessment assistance.

 

## Core rules

- deterministic validation takes priority over generative judgment;

- model output is untrusted until schema and policy validation;

- unsupported content is declined or escalated;

- the source final answer and full solution are not included in student-mode output;

- the learner must attempt before higher hints;

- alternative valid methods are respected;

- provider, model, prompt or policy version and confidence are stored where available;

- raw provider output is not shown directly;

- provider failures have safe fallbacks;

- child data is not used for training by default.

 

## Voice rules

- raw audio is processed only for the approved transcription purpose;

- raw audio is not sent to the tutoring LLM in the MVP;

- only learner-confirmed text enters educational prompting;

- mathematical normalization is marked as a proposal until confirmed;

- low-confidence speech is never automatically submitted;

- no speaker identification, emotion inference, personality inference or voice profiling;

- voice input cannot bypass attempt, anti-cheating or hint-level rules.

 

## Structured output

Every model task has:

 

- versioned request schema;

- strict response schema;

- allowed enum values;

- maximum lengths;

- confidence or uncertainty field where meaningful;

- refusal or unsupported state;

- deterministic post-validation;

- safe fallback.

 

## Data minimization

- send only the smallest task context required;

- remove names, contacts, school data and unrelated image regions;

- do not send parent report history when solving one problem;

- do not send raw audio when confirmed text is sufficient;

- define provider retention and training settings;

- record data residency and subprocessors;

- use synthetic fixtures in tests.

 

## Prohibited behavior

- inventing a recognized task with high confidence;

- revealing the source answer;

- grading unsupported open work as certain;

- persuading a child to disclose personal information;

- generating age-inappropriate or manipulative language;

- recommending paid help without educational reason;

- inferring protected or sensitive traits from voice, text or images;

- using hidden emotional or biometric scoring.

 

## Evaluation suites

### Recognition and transcription

- clear and poor images;

- multiple tasks per page;

- handwritten and printed text;

- Russian mathematical speech;

- fast, quiet and noisy recordings;

- fractions, signs, roots, powers and brackets;

- prompt injection in images or spoken text;

- low-confidence behavior;

- transcript confirmation and correction.

 

### Mathematics

- correct and incorrect steps;

- equivalent forms;

- alternate methods;

- arithmetic and sign errors;

- unsupported problem types;

- ambiguous geometry;

- transfer tasks.

 

### Hint safety

- direct answer requests;

- repeated pressure to reveal answer;

- fake teacher or parent claims;

- source solution extraction attempts;

- hidden answer in formatting;

- voice-confirmed attempts to bypass policy.

 

## Release thresholds

A model or provider is not enabled when:

 

- severe math-error rate exceeds the approved threshold;

- answer-leak rate exceeds the approved threshold;

- unsupported cases are overconfident;

- voice correction or low-confidence rates exceed the approved threshold;

- privacy or retention settings are not approved;

- cost envelope is undefined;

- fallback behavior is not tested.

 

## Incident response

- disable affected provider or feature flag;

- preserve minimized evidence;

- identify affected sessions and versions;

- notify security, curriculum and product owners;

- correct or withdraw unsafe content;

- rerun gold sets;

- document cause, remediation and prevention.