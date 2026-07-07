# Domain model

 

This document defines conceptual entities. Physical tables may differ but must preserve ownership, tenant boundaries, PII class, retention and audit requirements.

 

## Identity and family

 

### User

Adult or child authentication identity.

 

Key fields:

- id;

- account type;

- status;

- verified contacts for adults;

- locale;

- created and disabled timestamps.

 

### RoleAssignment

Role in a specific scope: platform, family, organization or class.

 

### Family

Primary B2C tenant.

 

### ChildProfile

Learning profile linked to a family and optionally to separate login credentials.

 

### ParentChildLink

Relationship and permissions between an adult and child profile.

 

### Consent

Versioned legal consent, document version, purpose, actor and timestamps.

 

### Session

Revocable authentication session with device and risk metadata.

 

## School tenancy — future gate

 

### Organization

Legal or operational school customer boundary.

 

### SchoolClass

Class or learning group for an academic year.

 

### Enrollment

Learner membership in a class.

 

### TeacherAssignment

Teacher permissions for class, subject and period.

 

## Curriculum

 

### Subject

Mathematics, Russian language and later subjects.

 

### AgeBand and Grade

Age-appropriate product and school grade descriptors.

 

### SkillNode

Atomic measurable skill with version, description and mastery criteria.

 

### SkillEdge

Prerequisite, decomposition or related-skill relationship.

 

### LearningObjective

Curriculum- or exam-specific objective mapped to skills.

 

### CurriculumVersion

Published package with validity and migration notes.

 

### ExamFramework

Versioned OGE, EGE, VPR or other blueprint.

 

## Textbooks

 

### TextbookEdition

Title metadata, authors, publisher, year, ISBN, grade, level and rights metadata.

 

### TextbookSection

Section or paragraph metadata without unauthorized full content.

 

### TextbookSkillMap

Versioned mapping from section to skills, objectives and exercise types.

 

### SchoolPace

Class or learner sequence with dates and current position.

 

### RightsMetadata

Source, permitted use, license, restrictions and expiry.

 

## Content

 

### Explanation

Original explanation mapped to skill and age band.

 

### ExerciseTemplate

Parameterized reviewed task definition.

 

### ExerciseInstance

Concrete generated or authored task.

 

### SolutionModel

Internal complete solution used for checking; never directly exposed in student mode for source homework.

 

### HintScript

Versioned hint levels and prerequisites.

 

### Rubric

Structured grading criteria for open solutions.

 

### PublicationVersion

Review, publication and rollback metadata.

 

## Learning

 

### LearningGoal

Selected purpose, target date and expected outcome.

 

### Diagnostic

Versioned assessment and result state.

 

### Attempt

Learner interaction with an exercise or homework task.

 

### AttemptStep

Learner-provided intermediate step and validation result.

 

### MasteryState

Skill evidence summary with uncertainty, recency and version.

 

### ReviewSchedule

Spaced-review state.

 

### LearningTrack

School, restorative or target track.

 

### WeeklyPlan and PlanItem

Prioritized learning actions with estimated duration and status.

 

## Homework

 

### HomeworkUpload

Workflow root and state.

 

### HomeworkAsset

Workflow reference to an original or sanitized file with storage and retention metadata.

 

### Asset

File metadata, storage key, checksum, content type, size, retention class and deletion status.

 

### VoiceInputSession

One user-initiated voice recording and its processing lifecycle. Fields include owner, child, purpose, status, locale, asset reference, MIME type, duration, raw transcript, normalized text, confidence, confirmed text, provider metadata, error code, retention deadline and deletion timestamp.

 

Purposes:

 

- `HOMEWORK_QUESTION`;

- `SOLUTION_STEP`;

- `TOPIC_SEARCH`;

- `LESSON_RESPONSE`;

- `SUPPORT_MESSAGE`;

- `NAVIGATION_COMMAND`.

 

Statuses:

 

- `CREATED`;

- `UPLOADING`;

- `UPLOADED`;

- `QUEUED`;

- `PROCESSING`;

- `REVIEW_REQUIRED`;

- `CONFIRMED`;

- `FAILED`;

- `CANCELLED`;

- `DELETED`.

 

Invariants:

 

- only an authorized owner or linked role can access the session;

- `CONFIRMED` requires `confirmedText`;

- only confirmed text can enter a learning flow;

- raw audio is inaccessible after `DELETED`;

- retention and deletion events are auditable.

 

### RecognizedProblem

Candidate task region and recognized content.

 

### RecognitionCandidate

Alternative parse with confidence.

 

### NormalizedProblem

Validated structured representation.

 

### HintEvent

Hint request, level, policy version and outcome.

 

### ValidationResult

Deterministic and AI-assisted validation evidence.

 

### TransferProblem

Related reviewed problem linked to source skills.

 

### EscalationCase

Human-review case with reason, priority and assignment.

 

## Assessment — future gate

 

### Assessment and Blueprint

Teacher-defined purpose and skill composition.

 

### Variant

Equivalent task set generated from blueprint.

 

### Delivery

Online or print administration configuration.

 

### Submission and Answer

Learner response state.

 

### AnswerSheet and OMRResult

Paper recognition entities.

 

### GradeResult

Automatic proposal and teacher-confirmed result.

 

## Commercial

 

### Product and Plan

Commercial offering and price configuration.

 

### Subscription

Family or organization subscription state.

 

### Entitlement

Feature and usage rights.

 

### UsageLimit

Upload, AI, mentor or assessment limit and period.

 

### PaymentReference

External-provider identifiers without storing sensitive payment data.

 

## Reporting and analytics

 

### ProgressSnapshot

Versioned learner summary.

 

### ParentReport and TeacherReport

Rendered and structured report state.

 

### RiskSignal

Learning, safety or engagement signal with policy version.

 

### Recommendation

Action recommendation and explanation.

 

### AnalyticsEvent

PII-free product event using the approved taxonomy.

 

## Universal entity metadata

Every sensitive entity must define:

 

- owner module;

- tenant scope;

- PII class;

- retention and deletion rule;

- audit requirement;

- versioning policy;

- authorization policy;

- idempotency needs.
