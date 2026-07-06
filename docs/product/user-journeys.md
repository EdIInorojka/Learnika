# User journeys

 

## 1. Parent onboarding

### Goal

Create a safe family account and configure the child's first learning context.

 

### Flow

1. Adult registers and verifies contact details.

2. Adult accepts current legal documents and records consent.

3. Adult creates a child profile with minimum required information.

4. Adult selects grade, subject, textbook edition and primary goal.

5. Platform explains how homework support and voice input work and what they will not do.

6. Parent invites the child or opens the child experience.

 

### Success

The family reaches the first supported task without needing support staff.

 

## 2. Learner completes homework with support

### Goal

Solve a real supported homework task independently.

 

### Flow

1. Learner uploads an image, screenshot or PDF, or enters the task manually.

2. Platform sanitizes and analyzes the asset.

3. Learner confirms the correct task boundary and text.

4. Platform asks what the task requires or where the learner is stuck.

5. Learner types, records a voice question or enters the first step.

6. System validates the confirmed input.

7. If the step is wrong, the platform explains the error category without showing the final answer.

8. Learner makes another attempt.

9. The next hint becomes available only after a meaningful attempt.

10. Learner completes the source problem.

11. Learner solves a related transfer problem.

12. Evidence updates the skill profile and next plan.

 

### Failure-safe states

- unsupported problem type;

- low recognition confidence;

- low transcription confidence;

- inconsistent task statement;

- ambiguous alternative method;

- suspected active test;

- repeated failure requiring prerequisite practice;

- specialist escalation.

 

## 3. Learner submits a voice question

### Goal

Use speech as a faster optional input method without weakening learning integrity.

 

### Preconditions

- learner is authenticated;

- a supported homework or learning screen is open;

- text input remains available.

 

### Flow

1. Learner taps the microphone button.

2. Application requests permission if needed.

3. Visible recording state and timer appear.

4. Learner records up to 60 seconds.

5. Learner stops or cancels.

6. Client validates and uploads audio through a signed URL.

7. Backend queues transcription.

8. Speech-to-Text adapter returns text and confidence.

9. Mathematical speech normalizer proposes structured notation.

10. Application displays editable transcript and highlights uncertain fragments.

11. Learner corrects and confirms the transcript.

12. Only confirmed text enters the homework helper.

13. Raw audio is deleted according to retention policy.

 

### Alternative flows

- permission denied: keep typed input active;

- no speech: ask to retry or type;

- low confidence: require edit, repeat or cancel;

- provider unavailable: preserve context and allow retry or text;

- upload interrupted: retry idempotently;

- deletion failed: retry and alert operations.

 

### Success

The learner receives the same safe educational response as for typed input, and raw audio follows the deletion policy.

 

## 4. Learner follows a weekly plan

### Goal

Complete a balanced set of school, restorative and target activities.

 

### Flow

1. Learner sees a short weekly objective.

2. Each plan item explains why it is present.

3. Learner completes original exercises and review.

4. Planner reacts to evidence without overreacting to one answer.

5. Completed items update progress and internal achievements.

6. Missed items are rescheduled within load limits.

 

## 5. Parent reviews progress

### Goal

Understand the week without reading every interaction.

 

### Report answers

- what was completed;

- which skills improved;

- where the main gap remains;

- how independently the learner worked;

- whether voice or hints were used without exposing unnecessary transcript content;

- what happens next;

- whether specialist help is recommended and why.

 

## 6. Mentor handles escalation

### Goal

Resolve ambiguity or a persistent learning block efficiently.

 

### Flow

1. System creates an escalation with minimized context.

2. Assigned specialist sees task, attempts, confidence and relevant skill evidence.

3. Specialist comments, requests clarification or schedules a consultation.

4. Outcome is recorded as human-reviewed evidence.

5. Parent sees a concise recommendation.

 

## 7. Teacher creates a school assessment — future gate

### Goal

Create, conduct and analyze a class assessment.

 

### Flow

1. Teacher chooses skills, textbook sections or blueprint.

2. System creates equivalent variants.

3. Teacher reviews and edits.

4. Work is delivered online or exported to PDF.

5. Online responses are checked automatically where supported.

6. Printed answer sheets are scanned and recognized with confidence.

7. Ambiguous or open responses enter teacher review.

8. Class skill map and remediation recommendations are produced.

 

## Journey quality rules

- every automated decision has a user-safe fallback;

- the learner always knows what the system understood;

- uncertainty is visible and actionable;

- typed input remains available when voice is unavailable;

- parent and teacher summaries minimize private content;

- no journey depends on a future gated feature.