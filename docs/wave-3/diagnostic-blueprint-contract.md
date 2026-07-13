# Diagnostic blueprint contract

## Status

This is the Wave 3 Slice 3 static contract foundation for future mathematics
diagnostics in grades 7-9. It defines reviewed structure and validation rules
only. It is not a diagnostic engine, item bank, scoring policy, mastery model,
API contract or learner-facing workflow.

## Contract goals

A diagnostic blueprint must:

- pin the canonical skill graph version it references;
- use existing canonical skill IDs only;
- describe high-level coverage without embedding executable task content;
- distinguish the intended evidence category from any future learner result;
- keep grade placement and difficulty calibration visibly provisional;
- cover the canonical number, algebra, functions, geometry and data strands;
- preserve the no-answer, no-solution and rights constraints;
- remain free of learner data and runtime diagnostic attempts.

## Contract layers

The diagnostic domain is split into three layers. Slice 3 creates only the
first layer.

| Layer | Purpose | Slice 3 status |
|---|---|---|
| Blueprint | Versioned coverage slots, canonical skill references and review metadata | Static draft allowed |
| Reviewed item content | Original or rights-cleared task material and deterministic validation metadata | Deferred |
| Runtime attempt | Learner assignment, response, timestamps, validation output and evidence event | Forbidden in this slice |

A blueprint item is therefore a structural slot, not a question presented to a
learner. Its identifier must never be used as proof that reviewed item content
or runtime behavior exists.

## Blueprint metadata

A machine-readable blueprint contains:

| Field | Meaning |
|---|---|
| `schemaVersion` | Version of this static blueprint shape. |
| `blueprintVersion` | Immutable version of the coverage draft. |
| `status` | Draft or later reviewed publication state. |
| `artifactKind` | Explicit marker that this is a diagnostic blueprint. |
| `subject` | `math` for the current MVP. |
| `locale` | Russian MVP context, currently `ru-RU`. |
| `audienceGrades` | Grades 7, 8 and 9 only. |
| `canonicalSkillGraphVersion` | Exact seed or published graph version used for references. |
| `coverageReviewState` | Review state for uncertain grade and skill placement. |
| `safetyPolicyVersion` | Versioned reference for diagnostic safety constraints. |
| `openDecisionRefs` | Decisions that remain unresolved. |

## Diagnostic item slot IDs

Static item slots use lowercase ASCII identifiers:

```text
diag.math.g7-9.<strand>.<slot>.v<major>
```

The first draft validates them with:

```text
^diag\.math\.g7-9\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.v[1-9][0-9]*$
```

Rules:

- the ID identifies a structural coverage slot, not authored task content;
- the strand token must match the primary canonical skill namespace;
- grade remains metadata and does not change the canonical skill ID;
- `v<major>` changes when the slot's intended evidence boundary changes;
- item wording, source references and learner identifiers never enter the ID;
- duplicate item slot IDs are invalid within one blueprint version.

## Item slot structure

Each slot contains:

| Field | Meaning |
|---|---|
| `id` | Stable diagnostic item slot ID. |
| `status` | Static review state; Slice 3 uses draft slots only. |
| `gradeBand` | Intended grades, constrained to 7-9. |
| `strand` | Canonical high-level strand. |
| `primarySkillId` | The one canonical skill primarily observed by the slot. |
| `supportingSkillIds` | Optional canonical skills needed to interpret future evidence. |
| `evidenceCategory` | Intended kind of mathematical evidence. |
| `difficultyBand` | Provisional authoring band, not a calibrated score. |
| `coverageStatus` | Explicit curriculum placement review state. |
| `sourcePolicy` | Requirement for original or rights-cleared future material. |
| `safetyNotes` | Structural constraints without task text. |

The static draft uses parent skills from the Slice 2 seed. It does not imply
that those parent skills are final diagnostic measurement units. Leaf-skill
granularity remains an open decision.

## Canonical skill references

- `canonicalSkillGraphVersion` must match the loaded graph artifact.
- Every primary and supporting skill ID must exist in that graph version.
- The item strand must match the primary skill strand.
- The item grade band must stay inside the primary skill grade band.
- A supporting skill cannot repeat the primary skill or another supporting
  reference.
- A prerequisite edge does not automatically require a diagnostic slot.
- Unknown, disputed or overly broad mapping uses `open_decision`; it is not
  promoted to reviewed status by inference.

Historical blueprints must retain their pinned graph version. A later skill
rename, split or merge requires an explicit curriculum migration decision.

## Coverage rules

A future reviewed grade 7-9 blueprint must:

- include at least one structural slot for every canonical strand;
- make every target grade addressable without extending below grade 7 or above
  grade 9;
- state which skill is primary for each slot;
- keep supporting skills conservative and explicit;
- avoid treating textbook order as canonical diagnostic order;
- avoid claiming psychometric balance from a structural coverage count;
- record uncertain grade placement as an open decision;
- receive curriculum, QA, safety and independent review before runtime use.

The Slice 3 JSON is deliberately broad and sparse. It proves reference and
coverage validation, not diagnostic length, balance, adaptivity or readiness.

## Evidence categories

Evidence categories describe what a future reviewed item is intended to
observe. They do not express correctness, mastery or proficiency.

| Category | Intended observation |
|---|---|
| `concept_recognition` | Identifying a mathematical concept or relation. |
| `procedure_selection` | Selecting an applicable mathematical method. |
| `representation_interpretation` | Interpreting symbolic, tabular, graphical or geometric information. |
| `reasoning_justification` | Stating a bounded mathematical reason. |
| `multi_step_organization` | Organizing a bounded sequence of mathematical steps. |

Exact response formats, meaningful-attempt criteria, deterministic validator
coverage and evidence weighting remain deferred.

## Non-scoring result semantics

The blueprint reserves non-scoring placeholder states for a future attempt
contract:

| State | Meaning |
|---|---|
| `not_collected` | No usable observation exists. |
| `observed` | A future flow collected an observation; no quality claim follows. |
| `uncertain` | The observation cannot be interpreted confidently. |
| `not_reached` | The slot was not reached under a future selection policy. |
| `invalidated` | The observation is excluded by a future reviewed validity rule. |

These states do not claim correctness, proficiency or mastery, do not produce a
numeric score and do not update a learner profile. A single response can never
change mastery. Runtime transition rules, repeated-evidence policy and
contradiction handling require later explicit gates and scenario tests.

## Safety and rights constraints

A blueprint and any future reviewed diagnostic must not:

- contain or expose task answers or final answers;
- contain worked solutions or generated hints;
- contain provider prompts, completions or payloads;
- copy textbook tasks, passages or images without documented rights;
- generate questions automatically under this contract;
- infer mastery or proficiency from one response;
- turn uncertain evidence into a correctness claim;
- include real student data, raw homework media or transcript bodies;
- bypass learner confirmation for any future OCR or STT input;
- let probabilistic output override supported deterministic validation.

Future item content must be original or rights-cleared, reviewed for answer
leakage and linked to its content and validator versions. None of that content
exists in the Slice 3 artifact.

## Static validation requirements

The Slice 3 validator must reject:

- unknown canonical skill IDs;
- duplicate diagnostic item slot IDs;
- item IDs outside the agreed pattern;
- grade bands outside grades 7-9;
- a strand that differs from the primary skill namespace;
- forbidden fields or terms;
- missing canonical strand coverage;
- a graph-version mismatch;
- runtime-shaped or otherwise unexpected fields;
- result semantics that claim mastery, proficiency or numeric scoring.

The worktree scope guard must continue to reject API, OpenAPI, Prisma, web and
other out-of-slice changes.

## Deferred decisions

Deferred until later approved slices:

- reviewed leaf skills suitable for diagnostic measurement;
- exact grade-specific blueprint variants;
- diagnostic length, stop rules and adaptive selection;
- original item authoring and review workflow;
- calibrated difficulty bands and psychometric evidence;
- response formats and deterministic validator whitelist;
- meaningful-attempt and invalidation rules;
- scoring, mastery evidence weights and proficiency labels;
- runtime persistence, API, OpenAPI and web contracts;
- accessibility accommodations and operational timing limits;
- real-child beta and production analytics.
