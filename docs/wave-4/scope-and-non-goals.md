# Wave 4 scope and non-goals

## Status

Wave 3 is approved and closed. Wave 4 Slice 1 is a documentation-only
foundation for reviewed diagnostic content coverage in Russian mathematics for
grades 7-9.

The Slice 1 instruction is the active authority for this work. The older
bootstrap prompt in `docs/prompts/04-wave-4.md` describes mobile implementation;
that direction is not activated by this slice and remains outside scope until a
separate roadmap decision reconciles the prompt.

## Slice 1 objective

Define a static, auditable contract for deciding whether a future diagnostic
content candidate has passed:

- methodology review;
- safety and no-answer review;
- rights and copyright review;
- grade-placement review;
- accessibility and readability review;
- production approval.

The slice also defines how Wave 3 blueprint coverage gaps are represented and
why diagnostic readiness remains `NOT_READY`.

## In scope

- review roles, evidence and status semantics at contract level;
- fail-closed rules for missing, stale or invalid review evidence;
- coverage tracking against the 11 version-pinned Wave 3 blueprint slots;
- a current coverage snapshot based on existing Wave 3 artifacts;
- explicit safety, provenance and production-approval boundaries;
- open decisions required before reviewed production content can exist.

All content references remain metadata-only. Slice 1 does not add or revise any
diagnostic item stem.

## Non-goals

This slice does not authorize:

- production diagnostic content or gap-filling items;
- a machine-readable review artifact or review validator;
- a change to the diagnostic readiness policy or a `READY` result;
- diagnostic selection, attempts, responses, checking or interpretation;
- correctness, scoring, mastery, proficiency or recommendations;
- final answers, correct answers, worked solutions, hints or scoring keys;
- copied textbook tasks, excerpts or other content without documented rights;
- Prisma models, migrations, persistence, API routes or OpenAPI changes;
- web or mobile UI, including the legacy mobile Wave 4 bootstrap scope;
- OCR, STT, LLM or other provider integration;
- real learner data, analytics, billing, school, teacher or administrator
  features;
- deployment or production storage policy.

## Current boundary

The Wave 3 blueprint has 11 draft slots across number, algebra, functions,
geometry and data/probability. Five slots have original minimal fixtures marked
for non-production structural validation only. Six slots have no fixture.

Neither a draft fixture nor this review contract closes a production coverage
gap. The existing readiness decision therefore remains `NOT_READY`, with no
policy or runtime change in Slice 1.

## Exit condition

Slice 1 is complete when the review process, coverage states, current snapshot,
deferred decisions and safety boundaries are documented and repository
validation passes. Slice 2 requires explicit approval.
