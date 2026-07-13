# Diagnostic response and evidence contract

## Status

This is the Wave 3 Slice 5 static contract foundation for future diagnostic
responses and evidence in grades 7-9 mathematics. It defines synthetic fixture
shapes and non-scoring state transitions only. It is not runtime persistence,
an attempt model, checking behavior, a mastery model, an API contract or a
learner-facing feature.

## Contract goals

The static contract must:

- make every response reference an existing diagnostic item and blueprint slot;
- make every evidence record reference an existing canonical skill;
- preserve the evidence category declared by the item and blueprint slot;
- use only synthetic, placeholder-safe response content;
- keep response and evidence records explicitly non-production;
- represent observation availability without correctness, score, proficiency or
  mastery claims;
- define conservative transitions between the Slice 3 non-scoring states;
- reject runtime attempt, session, result and student PII fields;
- defer all checking, aggregation and learning-profile behavior.

## Contract layers

| Layer | Purpose | Slice 5 status |
|---|---|---|
| Diagnostic item fixture | Original non-production stem and curriculum references | Existing static artifact |
| Response fixture | Synthetic placeholder linked to an item and slot | Static draft allowed |
| Evidence fixture | Structural observation reference linked to one canonical skill | Static draft allowed |
| Runtime attempt and evidence event | Learner interaction, validation output and persistence | Forbidden |

The terms response and evidence in this contract name static fixture records.
They do not imply that a learner interaction occurred.

## Response ID format

Response fixture IDs use:

```text
dresponse.math.<strand>.<topic>.fixture-<nn>.v<major>
```

Validation pattern:

```text
^dresponse\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$
```

The strand, topic, fixture ordinal and major version must align with the
referenced diagnostic item fixture. Grade, learner identity and runtime
identifiers never enter the ID.

## Evidence ID format

Evidence fixture IDs use:

```text
devidence.math.<strand>.<topic>.fixture-<nn>.v<major>
```

Validation pattern:

```text
^devidence\.math\.(number|algebra|functions|geometry|data)\.[a-z0-9]+(?:-[a-z0-9]+)*\.fixture-[0-9]{2}\.v[1-9][0-9]*$
```

An evidence fixture is linked to exactly one response fixture in the Slice 5
artifact. It cannot aggregate multiple interactions or establish a learning
state.

## Fixture set metadata

The static artifact contains:

| Field | Meaning |
|---|---|
| `schemaVersion` | Version of the response/evidence fixture shape. |
| `fixtureSetVersion` | Immutable version of this tiny fixture set. |
| `status` | `draft_synthetic_non_production_fixture_set` only. |
| `artifactKind` | Explicit response/evidence fixture-set marker. |
| `subject` | `math` only. |
| `locale` | Russian MVP context, currently `ru-RU`. |
| `canonicalSkillGraphVersion` | Pinned Slice 2 graph version. |
| `diagnosticBlueprintVersion` | Pinned Slice 3 blueprint version. |
| `diagnosticItemFixtureSetVersion` | Pinned Slice 4 item fixture version. |
| `syntheticOnly` | Must be `true`. |
| `productionUseAllowed` | Must be `false`. |
| `sourceContract` | This document. |
| `openDecisionRefs` | Unresolved response, evidence and transition decisions. |

## Response record shape

Each response fixture contains only:

| Field | Meaning |
|---|---|
| `id` | Stable synthetic response fixture ID. |
| `status` | `draft_synthetic_non_production_fixture` only. |
| `gradeBand` | Provisional range within grades 7-9. |
| `strand` | Canonical strand aligned with the item. |
| `diagnosticItemId` | Existing Slice 4 item fixture ID. |
| `blueprintSlotId` | Existing Slice 3 slot equal to the item's slot. |
| `primarySkillId` | Existing canonical skill equal to the item's primary skill. |
| `evidenceCategory` | Category equal to the item and slot category. |
| `observationState` | One Slice 3 non-scoring state. |
| `contentMode` | `placeholder_only` in Slice 5. |
| `content` | Short synthetic Russian placeholder with no mathematical assertion. |
| `syntheticOnly` | Must be `true`. |
| `productionUseAllowed` | Must be `false`. |
| `evaluationMode` | Must be `none`. |
| `safetyNotes` | Explicit internal-use constraints. |

No learner response body is represented. The `content` field exists only to
prove that a future field can be constrained to placeholder-safe data.

## Evidence record shape

Each evidence fixture contains only:

| Field | Meaning |
|---|---|
| `id` | Stable synthetic evidence fixture ID. |
| `status` | `draft_synthetic_non_production_fixture` only. |
| `responseId` | Existing response fixture ID. |
| `gradeBand` | Same provisional band as the response. |
| `strand` | Same canonical strand as the response, item, slot and skill. |
| `diagnosticItemId` | Existing item fixture ID equal to the response reference. |
| `blueprintSlotId` | Existing slot ID equal to the response reference. |
| `canonicalSkillId` | Existing primary canonical skill for the referenced item. |
| `evidenceCategory` | Same category as the response, item and slot. |
| `observationState` | Same non-scoring state as the response fixture. |
| `syntheticOnly` | Must be `true`. |
| `productionUseAllowed` | Must be `false`. |
| `aggregationMode` | Must be `none`. |
| `safetyNotes` | Explicit internal-use constraints. |

An evidence fixture records only the structural existence and interpretability
of a synthetic observation. It carries no correctness boolean, numeric value,
weight, mastery contribution or proficiency label.

## Reference alignment

- Fixture metadata must match the exact graph, blueprint and item fixture
  versions loaded by validation.
- Every response `diagnosticItemId` must exist in the Slice 4 artifact.
- Every response slot, primary skill and evidence category must match that item.
- Every evidence `responseId` must exist in the same fixture set.
- Every evidence item, slot, skill, strand, category, grade band and observation
  state must match its response and the upstream contracts.
- Every evidence fixture references the item's primary canonical skill only.
- Each Slice 5 response has exactly one corresponding evidence fixture.
- Validation does not promote any upstream `open_decision` coverage state.

## Non-scoring states

Slice 5 reuses the Slice 3 states:

- `not_collected`;
- `observed`;
- `uncertain`;
- `not_reached`;
- `invalidated`.

These states describe availability and interpretability only. In particular,
`observed` means that a structural observation exists, not that it is correct,
successful or evidence of proficiency.

## Allowed transitions

The static contract allows only:

| From | To | Meaning |
|---|---|---|
| `not_collected` | `observed` | A usable structural observation becomes available. |
| `not_collected` | `uncertain` | Material exists but cannot be interpreted confidently. |
| `not_collected` | `not_reached` | A future selection policy does not reach the item. |
| `observed` | `uncertain` | A prior observation becomes ambiguous. |
| `observed` | `invalidated` | A prior observation is excluded from use. |
| `uncertain` | `observed` | Uncertainty is resolved into a structural observation. |
| `uncertain` | `invalidated` | Uncertain material is excluded from use. |

`invalidated` and `not_reached` are terminal within one immutable fixture record.
A later runtime contract must define whether a new record may supersede them.
No transition changes mastery, proficiency or a numeric score.

## Safety and forbidden fields

Response/evidence fixtures must not contain:

- final or correct answers;
- solutions, worked solutions or hints;
- correct options, scoring keys or correctness booleans;
- numeric scores, mastery or proficiency claims;
- provider payloads, prompts or completions;
- textbook content or copied text;
- real learner content or student PII;
- attempt, session, result, family, child, user or submission identifiers;
- timestamps, analytics fields or runtime state.

Exact field allowlists and forbidden-term scanning apply to the entire static
artifact. Synthetic placeholders must be short, Russian-language and contain
no mathematical assertion.

## Deferred decisions

Deferred until later explicitly approved slices:

- actual learner response representation and retention;
- response input modes and confirmation provenance;
- deterministic checking contracts and supported forms;
- correctness semantics and invalidation policy;
- evidence independence, assistance and difficulty metadata;
- evidence weighting, aggregation, decay and contradiction handling;
- mastery and proficiency calculations or labels;
- runtime transition concurrency and supersession rules;
- persistence, Prisma, API, OpenAPI and web contracts;
- authorization, tenant isolation and deletion behavior for real records;
- analytics, reports, diagnostic runtime and real-child use.
