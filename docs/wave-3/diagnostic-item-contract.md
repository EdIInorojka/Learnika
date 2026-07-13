# Diagnostic item contract

## Status

This is the Wave 3 Slice 4 static contract for diagnostic item fixtures in
grades 7-9 mathematics. It defines safe internal fixture content and structural
validation only. It is not a production item bank, diagnostic runtime, scoring
policy, checking engine, API contract or learner-facing feature.

## Contract goals

A diagnostic item fixture must:

- use an original, minimal Russian-language stem;
- identify one existing diagnostic blueprint slot;
- reference existing canonical skill IDs only;
- use the evidence category already declared by its blueprint slot;
- remain explicitly marked as a non-production draft fixture;
- contain no final answer, worked solution, hint or revealing scoring rubric;
- contain no provider prompt, completion or payload;
- contain no runtime attempt, result or student data;
- defer all checking, correctness and mastery behavior.

## Contract layers

| Layer | Purpose | Slice 4 status |
|---|---|---|
| Blueprint slot | Defines intended coverage, skill references and evidence category | Existing static contract |
| Item fixture | Provides a tiny original stem for structural contract validation | Static draft allowed |
| Reviewed diagnostic item | Adds approved content, response form and deterministic validation policy | Deferred |
| Runtime attempt | Assigns content and records learner interaction or evidence | Forbidden |

An item fixture does not become reviewed content merely because its structure
passes automated validation.

## Item ID format

Diagnostic item IDs use lowercase ASCII tokens:

```text
ditem.math.<strand>.<topic>.<variant>.v<major>
```

The Slice 4 fixture subset uses:

```text
ditem.math.<strand>.<topic>.fixture-<nn>.v<major>
```

Validation pattern:

```text
^ditem\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$
```

Rules:

- the ID is independent of textbook edition and section order;
- grade is metadata because exact placement can change after review;
- the strand token must match the referenced blueprint slot and primary skill;
- `fixture-<nn>` marks the Slice 4 artifact as internal and non-production;
- `v<major>` changes when the intended item boundary or stem meaning changes;
- source page numbers, learner identifiers and expected values never enter the
  ID.

## Fixture set metadata

The static fixture set contains:

| Field | Meaning |
|---|---|
| `schemaVersion` | Version of the fixture artifact shape. |
| `fixtureSetVersion` | Immutable version of this tiny fixture set. |
| `status` | Must remain `draft_non_production_fixture_set` in Slice 4. |
| `artifactKind` | Explicit diagnostic item fixture-set marker. |
| `subject` | `math` only. |
| `locale` | Russian MVP context, currently `ru-RU`. |
| `canonicalSkillGraphVersion` | Exact canonical graph version used by references. |
| `diagnosticBlueprintVersion` | Exact blueprint version used by slot references. |
| `productionUseAllowed` | Must be `false`. |
| `sourceContract` | This document. |
| `openDecisionRefs` | Unresolved curriculum and validation decisions. |

## Safe item structure

Each item fixture contains only:

| Field | Meaning |
|---|---|
| `id` | Stable item fixture ID. |
| `status` | `draft_non_production_fixture` only. |
| `gradeBand` | Provisional grade range within 7-9. |
| `strand` | Canonical strand. |
| `blueprintSlotId` | Existing Slice 3 blueprint slot. |
| `primarySkillId` | Existing canonical skill equal to the slot's primary skill. |
| `supportingSkillIds` | Optional existing canonical skills already allowed by the slot. |
| `evidenceCategory` | Existing category equal to the slot's category. |
| `stem` | Minimal original Russian fixture text. |
| `contentOrigin` | `original_minimal_fixture` only. |
| `coverageStatus` | `open_decision` until curriculum review. |
| `productionUseAllowed` | Must be `false`. |
| `evaluationPlaceholder` | Explicit declaration that evaluation behavior is deferred. |
| `safetyNotes` | Internal-use and review constraints. |

Unexpected fields are rejected. The allowlist intentionally excludes response
options, expected values, scoring keys, learner records and provider data.

## Stem policy

Fixture stems may contain only enough original text to exercise static
validation:

- Russian-language wording suitable for grades 7-9 mathematics;
- no copied textbook statement, distinctive passage, image or source metadata;
- no final answer or embedded expected response;
- no worked solution, generated hint or learner-facing help;
- no scoring rubric that exposes the expected response;
- no provider prompt or completion;
- no real learner, family, school or account data;
- no claim that the stem has passed curriculum, psychometric or production
  review.

Slice 4 limits the artifact to five short stems. They are synthetic fixture
content, not a diagnostic release set.

## Skill and blueprint references

- Fixture metadata pins both the graph version and blueprint version.
- Every `blueprintSlotId` must exist in the pinned blueprint.
- Every skill reference must exist in the pinned graph.
- `primarySkillId`, `strand` and `evidenceCategory` must match the blueprint
  slot.
- Supporting skills must be unique and already listed by the blueprint slot.
- The grade band must stay within grades 7-9 and within both the primary skill
  and blueprint slot bands.
- Uncertain mapping remains `open_decision`; validation does not upgrade its
  review status.

## Evidence category references

The item fixture reuses one of the Slice 3 categories:

- `concept_recognition`;
- `procedure_selection`;
- `representation_interpretation`;
- `reasoning_justification`;
- `multi_step_organization`.

The category describes intended future observation only. It does not define a
response format, score, proficiency label or mastery update.

## Evaluation placeholder

Every fixture has an `evaluationPlaceholder` with:

- `status: deferred`;
- `mode: none`;
- a policy note stating that expected values, evaluators and runtime behavior
  are outside this artifact.

The placeholder cannot contain a key, expected value, accepted option, rubric,
validator implementation or correctness state. It exists to make the deferral
machine-checkable.

## Forbidden content and fields

The static artifact rejects fields or values containing:

- `answer` or `finalAnswer`;
- `solution` or `workedSolution`;
- `hint`;
- `promptCompletion` or `providerPayload`;
- `textbookContent` or `copiedText`;
- `correctOption` or `scoringKey`.

It also rejects runtime attempt, result, learner-response, student, child and
submission fields. Exact allowlists provide an additional boundary.

## Deferred decisions

Deferred until later explicitly approved slices:

- curriculum review of the five fixture stems;
- reviewed leaf-skill measurement units;
- production item authoring and rights workflow;
- response type and accessibility design;
- deterministic validator whitelist and versions;
- expected values, checking and correctness semantics;
- scoring rubrics, difficulty calibration and psychometric review;
- attempt, result, evidence and mastery persistence;
- diagnostic selection, timing and stop rules;
- API, OpenAPI, Prisma and web contracts;
- learner-facing diagnostics and real-child use.
