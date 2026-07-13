# Wave 3 scope and non-goals

## Status

Wave 3 starts after `APPROVE WAVE 2 CLOSURE`. This document is the Wave 3
planning boundary for diagnostics, mastery and the weekly learning loop. Slice 1
is documentation-only and does not approve runtime implementation.

## Wave 3 purpose

Wave 3 turns the Wave 2 homework/media/mock-provider foundation into a reviewed
learning foundation for grades 7-9 mathematics in the Russian MVP context.

Wave 3 must make diagnostic, homework, transfer and plan evidence reference the
same canonical skills. The canonical skill graph remains independent of any
textbook edition so that changing a textbook preserves mastery history.

## Slice 1 scope

Slice 1 creates the contract foundation only:

- define the Wave 3 scope and explicit non-goals;
- define the canonical skill ID format;
- define high-level grade 7-9 mathematics topic coverage;
- define conservative prerequisite relationship rules;
- define safety constraints for using skills in diagnostics and homework;
- record open decisions before later Wave 3 slices;
- add a README pointer to the Wave 3 planning docs.

## Wave 3 implementation scope after later approval

Later Wave 3 slices may implement only after an explicit slice gate:

- seed versioned mathematics skill graph data;
- original diagnostic for selected reviewed skills;
- mastery state with uncertainty, recency and evidence weights;
- rules that prevent single-answer mastery changes;
- school, restorative and target learning tracks;
- constrained weekly planner and spaced review;
- first priority textbook mapping workflow;
- concise weekly parent report;
- input-mode and independence summaries without transcript bodies;
- privacy-reviewed metrics and experiment boundaries.

## Product boundaries

Wave 3 remains inside the current MVP boundary:

- geography: Russia;
- language: Russian;
- subject: mathematics only;
- audience: grades 7-9;
- users: parent, child, teacher or mentor, administrator;
- interfaces: mobile-first web foundations, with native mobile deferred.

Selected prerequisite skills from earlier grades may appear only when they are
needed to explain grade 7-9 mathematics gaps. They do not expand the product to
younger grades.

## Non-goals

Slice 1 and Wave 3 planning do not implement or approve:

- Prisma schema changes or migrations;
- API routes, OpenAPI changes or generated contracts;
- web UI changes;
- diagnostics engine runtime behavior;
- mastery scoring or persisted mastery state;
- answer checking;
- hints or hint generation;
- solution generation;
- transfer problem generation;
- real OCR, STT or LLM providers;
- provider prompts, completions or payload storage;
- textbook content copying;
- production analytics;
- production storage policy;
- billing, school administration, teacher/admin expansion, native mobile or
  deployment.

## Safety constraints

Wave 3 skill work must preserve the Wave 2 safety closure:

- no final answer or full solution is exposed in student mode;
- skills cannot be used to unlock hints without a meaningful learner attempt;
- unconfirmed OCR/STT output cannot become learning evidence;
- low-confidence recognition, transcription or classification requires
  confirmation, another attempt or human review;
- deterministic mathematical validation is required whenever the problem family
  is supported;
- unsupported or controversial mapping is marked as an open decision rather
  than guessed;
- mastery does not change from one answer or one homework event;
- assisted homework and independent transfer remain separate evidence;
- no raw media, raw transcript body, task text, answer text, prompt, completion
  or provider payload enters ordinary logs or analytics.

## Slice 1 exit criteria

Slice 1 is complete only when:

- required Wave 3 planning docs exist;
- README points to the Wave 3 planning docs;
- no runtime product behavior changes;
- no dependencies, database, API or OpenAPI contracts change;
- full validation is green or a blocker is reported;
- open decisions are documented for later curriculum, safety and engineering
  review.
