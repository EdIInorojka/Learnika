# Voice input

 

## 1. Purpose

Voice input provides learners with a faster and more accessible alternative to typing. It is an input interface, not an independent voice tutor.

 

The function converts a short recording into editable text. Only the learner-confirmed text is submitted to the homework helper or another approved learning flow.

 

## 2. Product principles

- voice is optional;

- text input and mathematical keyboard remain available;

- explicit user action starts recording;

- no continuous or background listening;

- the recording state is visible;

- the learner can stop or cancel at any time;

- transcription is not treated as authoritative until confirmed;

- voice follows the same no-answer and attempt rules as typed input;

- raw audio is temporary sensitive data;

- voice biometrics, emotion recognition and advertising profiling are prohibited.

 

## 3. MVP use cases

A learner may:

 

- ask what is unclear in a homework task;

- explain an attempted solution;

- dictate one intermediate step;

- answer a learning prompt;

- add context to an uploaded task;

- search for a mathematical topic.

 

## 4. MVP limits

- Russian language;

- one recording up to 60 seconds;

- foreground web recording only;

- asynchronous transcription;

- editable transcript;

- basic mathematical speech normalization;

- explicit confirmation;

- temporary audio storage;

- automatic deletion.

 

## 5. Recording flow

1. Learner opens a supported input field.

2. Learner taps the microphone button.

3. Permission is requested only when needed.

4. Application displays recording state and duration.

5. Learner records, stops or cancels.

6. Client validates duration and format.

7. Backend creates `VoiceInputSession` and a signed upload URL.

8. Client uploads the recording.

9. Backend creates a transcription job.

10. Worker validates and transcodes when required.

11. Speech-to-Text adapter returns transcript and confidence.

12. Mathematical speech normalizer proposes notation.

13. Application displays editable text and uncertain fragments.

14. Learner edits and confirms.

15. Confirmed text enters the educational workflow.

16. Raw audio is deleted according to retention policy.

 

## 6. Mathematical speech normalization

Examples:

 

- “икс в квадрате” → `x²`;

- “два икс” → `2x`;

- “икс в третьей степени” → `x³`;

- “корень из девяти” → `√9`;

- “одна вторая” → `1/2`;

- “три четвертых” → `3/4`;

- “открываем скобку” → `(`;

- “закрываем скобку” → `)`;

- “не равно” → `≠`;

- “больше или равно” → `≥`;

- “меньше или равно” → `≤`;

- “модуль икс” → `|x|`;

- “пять икс минус три равно семь” → `5x - 3 = 7`.

 

Normalization never bypasses confirmation. For ambiguous fractions, signs, indices, roots and brackets, the UI highlights uncertainty.

 

## 7. Confidence policy

### High confidence

Show transcript for normal review and confirmation.

 

### Medium confidence

Highlight uncertain fragments and require review.

 

### Low confidence

Do not submit automatically. Offer repeat recording, manual edit or text input.

 

## 8. Error handling

Supported states:

 

- microphone permission denied;

- no microphone;

- unsupported browser recording API;

- no speech detected;

- recording too short or too long;

- unsupported or corrupt format;

- upload interrupted;

- transcription timeout or provider limit;

- low-confidence transcript;

- cleanup failure.

 

Every error keeps the learning context and offers a clear recovery action.

 

## 9. Privacy and retention

- raw audio is temporary by default;

- public audio URLs are prohibited;

- signed URLs are short-lived;

- audio is encrypted in transit and at rest;

- raw audio is excluded from analytics and ordinary logs;

- transcript may be stored as learning input after confirmation;

- retention deadline is stored per session;

- cleanup is retried and monitored;

- privileged access requires a documented support reason and audit event;

- raw audio is not used for model training without separate explicit consent.

 

## 10. Accessibility

The complete flow remains usable without voice. Controls require keyboard support, screen-reader labels, visible status, understandable errors and sufficient contrast.

 

## 11. Analytics

Measure:

 

- microphone permission conversion;

- recording start and completion;

- upload success;

- transcription success and latency;

- transcript edit rate;

- normalization correction rate;

- low-confidence rate;

- fallback-to-text rate;

- repeated voice use;

- cost per audio minute and per completed homework session;

- raw-audio deletion compliance;

- impact on session completion and transfer.

 

Do not send raw transcript or audio in analytics events.

 

## 12. Explicit non-goals for MVP

- realtime voice dialogue;

- always-on microphone;

- background recording;

- speech synthesis;

- full voice navigation;

- long-form or complex formula dictation;

- speaker identification;

- emotion or personality inference;

- voice-only grading;

- long-term raw-audio archive.

 

## 13. Future development

After validation:

 

- native mobile recording;

- text-to-speech for approved age groups;

- mental arithmetic mode;

- accessibility voice controls;

- teacher voice comments;

- pronunciation and language practice;

- controlled realtime dialogue with separate safety, cost and privacy gates;

- voice-first preschool interaction.