# Wave 0 prototype plan

## Purpose

Wave 0 may plan a clickable or coded prototype for homework upload, hints, and voice transcript confirmation. This repository change does not create production frontend screens, application scaffolding, or dependencies.

## Prototype status

- Clickable prototype: `NOT YET COLLECTED`
- Learner usability findings: `NOT YET COLLECTED`
- Parent report comprehension findings: `NOT YET COLLECTED`
- Voice discoverability and transcript-confirmation findings: `NOT YET COLLECTED`
- Accessibility findings at 360 px viewport: `NOT YET COLLECTED`

## Source documents

- `docs/product/user-journeys.md`
- `docs/product/mvp.md`
- `docs/product/voice-input.md`
- `docs/ai/homework-helper.md`
- `docs/testing/test-strategy.md`

## Prototype scope

Prototype only the Wave 0 planning surface:

1. Parent onboarding summary and consent explanation.
2. Grade and textbook selection.
3. Learner homework upload entry point.
4. Task recognition confirmation.
5. Attempt-required prompt.
6. Hint ladder that never reveals the original final answer.
7. Optional voice recording entry point.
8. Editable transcript confirmation with low-confidence highlighting.
9. Transfer problem handoff.
10. Parent report summary.

## Prototype non-goals

- No production web application.
- No `apps/` directory.
- No dependency installation.
- No real file upload.
- No real audio recording.
- No Speech-to-Text provider.
- No LLM integration.
- No production UI component library.
- No generated final answer or complete source solution.

## UX principles to test

- Learners understand that Learnika helps them solve, not copy an answer.
- A meaningful attempt is required before the next hint.
- The learner can see and correct what the system understood.
- Voice is optional and typed input remains available.
- Transcript confirmation is explicit.
- Low confidence is visible and actionable.
- Parent reports are short and action-oriented.

## Proposed prototype artifacts outside production code

Acceptable Wave 0 artifacts:

- Figma or equivalent clickable prototype: `NOT YET COLLECTED`
- Static storyboard exported as images or PDF: `NOT YET COLLECTED`
- Research script for learner and parent sessions: `NOT YET COLLECTED`
- Usability findings summary: `NOT YET COLLECTED`

If a coded spike is later approved, it must be clearly disposable, isolated from production application structure, and separately reviewed before entering the repository.

## Usability test plan

Minimum test questions:

- Can the learner explain what Learnika will and will not do?
- Can the learner make a first attempt without looking for an answer button?
- Does the hint ladder feel helpful without revealing the solution?
- Does the learner understand task confirmation after upload?
- Does the learner understand transcript editing and confirmation?
- Does typed fallback remain obvious when voice fails?
- Does the parent understand progress, gap, independence, and next action?

Evidence from these tests is `NOT YET COLLECTED`.

