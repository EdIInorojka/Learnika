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
| Diagnostic blueprint | Static contract and structural draft created in Slice 3; no item content or runtime behavior | Original item types, reviewed leaf-skill mapping, difficulty calibration and answer-leak review | curriculum-knowledge, qa-evaluation | Diagnostic runtime |
| Diagnostic item contract and fixtures | Static contract and five original non-production stems created in Slice 4 | Curriculum and safety review, production authoring workflow, response forms, deterministic validator plan and rights evidence | curriculum-knowledge, qa-evaluation, content-platform | Reviewed item bank and diagnostic runtime |
| Diagnostic response and evidence contract | Static contract and three synthetic non-production response/evidence pairs created in Slice 5; no runtime records | Reviewed response representation, confirmation provenance, transition and supersession rules, evidence independence and weighting, and retention/privacy design | learning-engine, curriculum-knowledge, security-privacy, qa-evaluation | Diagnostic evidence runtime and mastery implementation |
| Diagnostic session lifecycle | Static contract and three synthetic non-production lifecycle fixtures created in Slice 6; no runtime sessions or persistence | Reviewed production identity, authorization, idempotency, transition concurrency, interruption recovery, retention and deletion policy | learning-engine, solution-architect, security-privacy, qa-evaluation | Diagnostic runtime and persistence |
| Diagnostic length and selection | Not finalized; Slice 3 defines coverage slots only | Grade-specific length, stop rules, fixed versus adaptive selection, timing and accessibility review | curriculum-knowledge, learning-engine, qa-evaluation | Diagnostic runtime |
| Diagnostic result semantics | Slice 3 states and Slice 5 static transitions drafted; no runtime semantics | Runtime transition rules, invalidation policy, repeated-evidence scenarios and contradiction handling | learning-engine, curriculum-knowledge, qa-evaluation | Evidence and mastery implementation |
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

## Decisions that block runtime diagnostics

Before any persisted or executable diagnostic slice, Wave 3 needs:

- approval of the Slice 6 contract, static artifact and validation evidence;
- reviewed leaf-skill granularity for selected diagnostic coverage;
- reviewed production diagnostic content and review workflow; Slice 4 fixtures do
  not satisfy release content requirements;
- reviewed runtime selection, invalidation, supersession and repeated-evidence
  semantics;
- reviewed session identity, authorization, interruption recovery, retention
  and deletion semantics;
- exact acceptance criteria and an explicit gate for any runtime slice;
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
