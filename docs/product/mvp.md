# Commercial MVP

 

## MVP objective

Prove that a learner in grades 7-9 can use the platform repeatedly to understand mathematics homework, improve independent performance and convert the experience into a paid subscription.

 

## Core hypothesis

Families will pay for a product that:

 

- helps on real homework immediately;

- accepts a photo, typed question or short voice question;

- does not simply show the answer;

- identifies underlying gaps;

- creates a clear personal plan;

- demonstrates progress to the parent;

- involves a specialist only when useful.

 

## Critical journey

1. Parent creates an account and child profile.

2. Parent records required consent and selects grade and textbook.

3. Learner uploads one supported homework task.

4. System recognizes and normalizes the task.

5. Learner types a question, records a short voice question or enters a first solution step.

6. For voice, the system transcribes and normalizes speech, then the learner edits and confirms the text.

7. System validates the step or identifies the missing prerequisite.

8. If needed, the learner receives the minimum sufficient hint.

9. Learner completes the task without seeing the source final answer.

10. Learner solves a transfer problem.

11. Evidence updates the skill profile and plan.

12. Parent sees a concise outcome report.

13. The product offers a trial or subscription based on demonstrated value.

 

## MVP problem whitelist

Initial support should be narrow and reliable. Example sequence:

 

- linear equations;

- systems of two linear equations;

- fractions and rational transformations used by target topics;

- powers and roots at grade-appropriate level;

- basic quadratic equations;

- selected word problems with structured templates;

- basic geometry calculations where input can be normalized safely.

 

The final whitelist is approved by the curriculum and AI/math agents.

 

## Functional acceptance criteria

### Onboarding

- parent can create a family and child profile;

- grade and textbook can be selected;

- consent records are versioned and auditable;

- unauthorized users cannot access another family.

 

### Homework upload

- accepted formats and size limits are documented;

- image metadata is stripped;

- unsafe or unsupported input is rejected safely;

- task boundaries can be confirmed by the learner;

- low confidence triggers clarification.

 

### Voice input

- microphone access begins only after explicit learner action;

- recording state, duration, stop and cancel are visible;

- one recording is limited to 60 seconds;

- Russian speech is transcribed asynchronously;

- mathematical phrases may be normalized;

- uncertain fragments are highlighted;

- transcript is editable;

- only confirmed text enters the educational flow;

- text input remains available at all times;

- raw audio has a tested deletion path;

- no background recording, realtime dialogue or voice profiling exists.

 

### Step validation

- supported algebra steps are checked deterministically;

- the system distinguishes equivalent transformations from arithmetic errors;

- an invalid step receives an actionable explanation;

- no source final answer is exposed.

 

### Hint progression

- the next hint requires an attempt;

- hint level is stored;

- hints are versioned;

- the system can use a similar example without revealing the source solution;

- repeated failure creates an escalation or recommends prerequisite practice.

 

### Transfer

- a related problem is generated or selected from reviewed content;

- it differs in data and surface form;

- its expected solution is deterministically checked;

- transfer result updates evidence separately from assisted performance.

 

### Parent report

- shows completed sessions, main gap, improvement, independence and next recommendation;

- contains no unnecessary chat or voice transcript;

- is understandable on mobile.

 

## Non-functional acceptance criteria

- mobile-first PWA;

- critical screens usable at 360 px width;

- p95 API latency targets documented by endpoint class;

- file and audio upload have rate and cost limits;

- voice transcription latency and correction rate are measured;

- structured logs contain no child PII, raw text, image or audio;

- backup and restore procedure tested;

- temporary media deletion is monitored and tested;

- critical flow E2E test passes;

- answer-leak rate below the approved threshold on the gold set;

- supported math validation accuracy above the approved threshold;

- AI and transcription cost per completed homework session is measured.

 

## Beta success metrics

Targets must be finalized after baseline testing. Initial decision metrics:

 

- at least 70% of activated learners complete a first supported session;

- at least 40% return for a second homework session within seven days;

- at least 30% complete three or more sessions within 14 days;

- transfer success improves after support versus baseline;

- severe incorrect-math rate remains below the release threshold;

- answer leakage remains below 1% on the reviewed test set;

- at least 25% of eligible trial families reach the paywall;

- purchase conversion and 30-day retention are measured by acquisition cohort;

- voice adoption, correction rate, fallback rate and cost are measured separately;

- support burden and AI or media cost remain within the approved unit-economics envelope.

 

## MVP release decision

Release requires APPROVE from:

 

- product-program;

- curriculum-knowledge;

- security-privacy;

- qa-evaluation;

- independent-review.