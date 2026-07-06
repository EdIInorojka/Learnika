# Homework helper specification

 

## Purpose

Help the learner solve a real homework problem independently while converting each meaningful action into skill evidence.

 

## Supported inputs

- image;

- screenshot;

- PDF;

- manual task text;

- typed question or solution step;

- learner-confirmed voice transcript;

- photographed handwritten attempt within the approved recognition scope.

 

Raw audio is not itself a mathematical attempt. The confirmed transcript is the learner input.

 

## Workflow states

- `CREATED`;

- `UPLOADING`;

- `PROCESSING`;

- `TASK_CONFIRMATION`;

- `ATTEMPT_REQUIRED`;

- `VALIDATING`;

- `HINT_AVAILABLE`;

- `COMPLETED_ASSISTED`;

- `TRANSFER_REQUIRED`;

- `COMPLETED_TRANSFER`;

- `UNSUPPORTED`;

- `ESCALATED`;

- `FAILED`.

 

Voice input has its own `VoiceInputSession` state machine and joins the homework flow only after confirmation.

 

## 1. Upload and sanitization

- issue signed upload URL;

- validate MIME type, extension, signature, size and page count;

- generate server-controlled storage key;

- strip EXIF and unnecessary metadata;

- scan or isolate unsafe files;

- store private object with retention class;

- create idempotent processing job.

 

## 2. Recognition

Recognition produces candidates, not truth.

 

For each candidate store:

 

- extracted text;

- structured math representation;

- page or bounding box;

- confidence;

- suspected grade and topic;

- provider and model version;

- preprocessing version.

 

Learner confirms task boundary and corrected statement.

 

## 3. Voice question or step

1. Learner explicitly records a short message or uses text.

2. Voice is transcribed asynchronously.

3. Mathematical phrases are normalized.

4. Uncertain fragments are highlighted.

5. Learner edits and confirms.

6. Only confirmed text is attached to the homework session.

7. Raw audio is deleted by policy.

 

Voice does not unlock a higher hint level without a meaningful learner attempt.

 

## 4. Understanding the task

Before solving, ask the learner what is required, which information is known or where they are stuck. A confirmed voice transcript may answer this prompt.

 

## 5. Attempt step

Accepted attempt forms may include:

 

- mathematical expression;

- equation transformation;

- selected rule;

- short explanation;

- confirmed voice transcript;

- structured numeric answer;

- supported image of a handwritten step.

 

A meaningful attempt must contain information relevant to the next solution action.

 

## 6. Validation

Prefer deterministic validation.

 

Validation result schema:

 

- valid;

- mathematically equivalent;

- arithmetic error;

- sign error;

- invalid transformation;

- missing justification;

- strategy valid but unsupported;

- ambiguous;

- unsafe to judge.

 

Store expected and observed skill nodes, confidence and validator version.

 

## 7. Hint policy

Hint ladder:

 

1. restate the goal or ask a focusing question;

2. remind a prerequisite or relevant rule;

3. identify the error location or next subgoal;

4. show a similar example with different data;

5. give a more explicit scaffold without revealing the source answer;

6. recommend prerequisite practice or escalation.

 

Rules:

 

- attempt required between levels;

- source final answer and full source solution remain hidden;

- hint version and level are recorded;

- hints use reviewed content or strict structured generation;

- voice and typed input use the same policy.

 

## 8. Completion

A source problem is completed when the supported validator confirms the final learner step or a specialist confirms an ambiguous case. The student-mode response does not expose the reference full solution.

 

## 9. Transfer

Use a reviewed similar but non-identical problem. Transfer evidence is separate and more valuable than assisted completion.

 

## 10. Skill evidence

Each event includes:

 

- child;

- skill;

- source type;

- assistance level;

- independence;

- correctness;

- confidence;

- timestamp;

- curriculum and policy versions.

 

Input mode may be stored as a low-sensitivity category such as typed, image or confirmed voice. Raw transcript and audio are not analytics properties.

 

## 11. Escalation

Create escalation when:

 

- recognition or transcription cannot be safely confirmed;

- mathematics is ambiguous;

- repeated failures indicate a deeper gap;

- the strategy is valid but unsupported;

- suspected assessment restrictions apply;

- specialist review is required.

 

## 12. Anti-answer-leak controls

- source final answer excluded from student response schema;

- prompt and retrieval filters;

- response classifier and deterministic patterns;

- attempt and hint state enforcement;

- reviewed adversarial tests;

- no raw provider output sent directly to the learner;

- same controls for typed and voice-confirmed text.

 

## 13. Initial success metrics

- supported-session completion;

- transfer success;

- repeated use;

- recognition and transcription confirmation rate;

- voice transcript correction rate;

- answer-leak rate;

- severe math-error rate;

- median processing latency;

- AI, OCR and Speech-to-Text cost per completed session;

- temporary-media deletion compliance.