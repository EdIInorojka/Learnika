# Wave 3 open decisions

## Status

This register belongs to Wave 3 Slice 1. It does not authorize diagnostics,
mastery scoring, generated assistance, provider activation or real-child beta
use.

## Decision register

| Decision | Current state | Evidence needed | Owner | Blocks |
|---|---|---|---|---|
| Canonical leaf skill granularity | Parent coverage families drafted only | Reviewed examples of leaf nodes, practice scope and validation boundaries | curriculum-knowledge | Persisted skill graph and diagnostics |
| Exact Russian grade placement | High-level grade 7-9 coverage drafted | Review against priority Russian curricula and textbook sequences | curriculum-knowledge | Published curriculum package |
| Priority textbook editions | Not selected for Wave 3 | Edition list, rights metadata, federal-list status where relevant and review workflow | content-platform, curriculum-knowledge | Textbook mapping workflow |
| Textbook section mapping rules | Existing mapping principles only | Section metadata fields, allowed references, reviewer checklist and migration notes | content-platform | School-track planner |
| Initial supported math whitelist | Wave 0 proposal exists | Reviewed forms, exclusions, validator plan, unsupported handling and gold sets | curriculum-knowledge, ai-vision-math | Deterministic validation slices |
| Skill prerequisite edge semantics | Conservative rules drafted | Edge review rubric, examples and downgrade rules from prerequisite to related | curriculum-knowledge | Planner prerequisite enforcement |
| Skill ID deprecation policy | Draft rule exists | Migration examples for renamed, split and merged skills | solution-architect, curriculum-knowledge | Versioned curriculum publication |
| Diagnostic blueprint | Not created | Original item types, difficulty bands, evidence mapping and answer-leak review | curriculum-knowledge, qa-evaluation | Diagnostic runtime |
| Mastery evidence weighting | Existing principles only | Scenario tests, weights for diagnostic/homework/transfer/review, decay and uncertainty behavior | learning-engine, qa-evaluation | Mastery state implementation |
| Single-answer guard details | Product rule exists | Formal policy for minimum evidence, contradictions and recency | learning-engine, curriculum-knowledge | Mastery release |
| Homework skill classification policy | Not finalized | Confirmation states, confidence thresholds and fallback to human review | ai-vision-math, curriculum-knowledge | Homework evidence integration |
| Transfer relation policy | Not finalized | Similarity rules, difference requirements and deterministic checks | curriculum-knowledge, learning-engine | Transfer flow |
| Meaningful attempt rubric | Not finalized | Rubric by problem family and hint level | curriculum-knowledge, student-parent-ux | Hint-policy implementation |
| Safety thresholds | Not approved | Numeric thresholds for answer leakage, severe math error, unsupported overconfidence and validation accuracy | qa-evaluation, ai-vision-math | Learner-facing assistance |
| OGE objective mapping | Deferred | Objective taxonomy, source rights and review process | curriculum-knowledge | Target-track exam planning |
| Russian display naming | Not reviewed | Naming style guide, learner-friendly terms and methodologist approval | curriculum-knowledge, student-parent-ux | User-facing skill labels |
| Analytics schemas | Deferred | Privacy-reviewed event schemas with allowlisted fields and no raw text/media | data-analytics, security-privacy | Product analytics |
| Release review owners | Draft owner roles only | Named reviewers and approval checklist for curriculum package publication | product-program | Wave 3 release gate |

## Decisions that block Slice 2

Before the first persisted or executable skill graph slice, Wave 3 needs:

- approval of the Slice 1 contract documents;
- confirmation of whether Slice 2 is docs-only, static data only or schema work;
- exact acceptance criteria for the next slice;
- clean git and green local validation;
- explicit approval for any Prisma, package or contract change.

## Decisions that can remain deferred for early planning

The following may remain unresolved while Wave 3 stays documentation-only or
static-draft only:

- real OCR, STT or LLM provider choices;
- production media and raw-audio retention durations;
- production analytics pipeline;
- billing, school administration, native mobile and deployment region;
- complete OGE mapping;
- complete textbook edition coverage.

They still block any slice that sends real child data to providers, exposes
learner-facing assistance, claims mastery quality or moves toward beta use.
