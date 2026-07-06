# ADR-004: asynchronous confirmed voice-input pipeline

 

## Status

Accepted for the initial product.

 

## Context

Learners may need a faster way to ask a question or explain a solution step on mobile devices. Direct realtime voice tutoring would add latency, cost, moderation, privacy and accidental-recording risk. Mathematical speech is also ambiguous and cannot be treated as authoritative without review.

 

## Decision

Implement voice as an optional asynchronous input channel:

 

1. learner explicitly records up to 60 seconds;

2. client uploads audio to private temporary storage through a signed URL;

3. BullMQ job invokes a media worker and provider-neutral Speech-to-Text adapter;

4. mathematical speech normalizer proposes structured text;

5. learner edits and confirms the transcript;

6. only confirmed text enters the homework or learning flow;

7. cleanup worker deletes raw audio by the retention deadline.

 

The MVP prohibits continuous listening, background recording, raw-audio delivery to the tutoring LLM, voice biometrics, emotion recognition and long-term audio storage.

 

## Consequences

### Positive

- lower typing friction;

- explicit confirmation reduces mathematical transcription errors;

- provider can be replaced;

- raw audio remains outside the learning domain;

- typed fallback protects reliability and accessibility.

 

### Negative

- additional queue, storage and deletion complexity;

- transcription cost and latency;

- mathematical normalization requires gold-set evaluation;

- microphone permissions and browser support need testing.

 

## Alternatives rejected

### Browser-only Web Speech API

Rejected as the primary production solution because browser and provider behavior are inconsistent and difficult to govern.

 

### Realtime voice tutor

Rejected for the MVP because it increases privacy, safety, interruption and cost complexity before basic demand is validated.

 

### Permanent audio archive

Rejected because the educational value does not justify the privacy and operational burden.

 

## Review triggers

Review this ADR when:

 

- native mobile voice is introduced;

- realtime dialogue is proposed;

- a self-hosted Speech-to-Text model becomes justified;

- retention or legal requirements change;

- repeated use and unit economics fail the approved thresholds.