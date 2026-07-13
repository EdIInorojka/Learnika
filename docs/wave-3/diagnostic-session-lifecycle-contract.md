# Diagnostic session lifecycle contract

## Status

This is the Wave 3 Slice 6 static contract foundation for future diagnostic
session lifecycles in grades 7-9 mathematics. It defines synthetic fixture
shapes, structural references and conservative lifecycle transitions only. It
is not a runtime session model, persistence design, diagnostic engine, API
contract or learner-facing feature.

## Contract goals

The static contract must:

- give each synthetic session fixture a stable readable ID;
- pin the exact diagnostic blueprint and upstream fixture-set versions;
- reference existing blueprint slots, diagnostic items, responses and evidence
  records only;
- distinguish session lifecycle from response observation states;
- define conservative transitions, abandonment and invalidation semantics;
- keep all records synthetic, non-production and storage-disabled;
- carry no correctness, evaluation, educational outcome or learning-state
  claim;
- reject child PII, runtime identity, timestamps and persistence fields;
- defer selection, execution, calculation and all product behavior.

## Contract layers

| Layer | Purpose | Slice 6 status |
|---|---|---|
| Diagnostic blueprint | Defines static coverage slots and evidence categories | Existing static artifact |
| Item, response and evidence fixtures | Provide safe structural references | Existing static artifacts |
| Session lifecycle fixture | Groups existing references and demonstrates a static state path | Static draft allowed |
| Runtime diagnostic session | Selects items, records interaction and persists state | Forbidden |

A session fixture is a contract example. Its presence does not mean that a
learner interaction occurred or that any runtime state exists.

## Session ID format

Synthetic diagnostic session IDs use:

```text
dsession.math.g7-9.fixture-<nn>.v<major>
```

Validation pattern:

```text
^dsession\.math\.g7-9\.fixture-[0-9]{2}\.v[1-9][0-9]*$
```

Rules:

- the ID is independent of learner, family, school and textbook identity;
- grade coverage is fixed to the approved grades 7-9 boundary;
- `fixture-<nn>` marks the record as synthetic and non-production;
- `v<major>` changes when the fixture's structural lifecycle meaning changes;
- database keys, timestamps, device data and random runtime tokens never enter
  the ID.

## Fixture set metadata

The artifact metadata contains:

| Field | Meaning |
|---|---|
| `schemaVersion` | Version of the lifecycle fixture shape. |
| `fixtureSetVersion` | Immutable version of the Slice 6 fixture set. |
| `status` | `draft_synthetic_non_production_fixture_set` only. |
| `artifactKind` | Explicit diagnostic session lifecycle fixture-set marker. |
| `subject` | `math` only. |
| `locale` | Russian MVP context, currently `ru-RU`. |
| `gradeBand` | Must remain within grades 7-9. |
| `canonicalSkillGraphVersion` | Pinned Slice 2 graph version. |
| `diagnosticBlueprintVersion` | Pinned Slice 3 blueprint version. |
| `diagnosticItemFixtureSetVersion` | Pinned Slice 4 item fixture version. |
| `diagnosticResponseEvidenceFixtureSetVersion` | Pinned Slice 5 fixture version. |
| `syntheticOnly` | Must be `true`. |
| `productionUseAllowed` | Must be `false`. |
| `runtimeUseAllowed` | Must be `false`. |
| `storageAllowed` | Must be `false`. |
| `sourceContract` | This document. |
| `openDecisionRefs` | Unresolved lifecycle and runtime design decisions. |

## Lifecycle states

Session lifecycle states are distinct from Slice 3 and Slice 5 observation
states.

| State | Meaning | Terminal in this draft |
|---|---|---|
| `drafted` | Static references are assembled but not cleared for collection. | No |
| `ready` | Static references passed structural validation. | No |
| `active` | A future collection context is open; no interpretation follows. | No |
| `paused` | A future collection context is temporarily inactive. | No |
| `closed` | Collection ended without an educational outcome claim. | No, because later invalidation remains possible |
| `abandoned` | Collection stopped before ordinary closure. | Yes |
| `invalidated` | The whole session is excluded under a future reviewed validity policy. | Yes |

The state `closed` does not mean successful, correct or proficient. The state
`abandoned` does not establish failure. The state `invalidated` excludes the
session as a unit without changing or deleting referenced static fixtures.

## Allowed transitions

The static contract allows only:

| From | To |
|---|---|
| `drafted` | `ready` |
| `drafted` | `invalidated` |
| `ready` | `active` |
| `ready` | `abandoned` |
| `ready` | `invalidated` |
| `active` | `paused` |
| `active` | `closed` |
| `active` | `abandoned` |
| `active` | `invalidated` |
| `paused` | `active` |
| `paused` | `closed` |
| `paused` | `abandoned` |
| `paused` | `invalidated` |
| `closed` | `invalidated` |

`abandoned` and `invalidated` have no outgoing transition in this draft. A
future contract must define concurrency, resumption in a new session and
supersession behavior before runtime use.

## Session fixture shape

Each fixture contains only:

| Field | Meaning |
|---|---|
| `id` | Stable synthetic session fixture ID. |
| `status` | `draft_synthetic_non_production_fixture` only. |
| `gradeBand` | Provisional band within grades 7-9. |
| `diagnosticBlueprintVersion` | Exact pinned blueprint version. |
| `blueprintSlotIds` | Existing `diag.math...` slot IDs represented by selected items. |
| `selectedDiagnosticItemIds` | Existing Slice 4 item fixture IDs only. |
| `responseIds` | Existing Slice 5 response fixture IDs only. |
| `evidenceIds` | Existing Slice 5 evidence fixture IDs only. |
| `lifecycleState` | Final state represented by this static fixture. |
| `statePath` | Ordered state names connected only by allowed transitions. |
| `referenceDisposition` | Structural treatment of linked references. |
| `interpretationMode` | Must be `none`. |
| `syntheticOnly` | Must be `true`. |
| `productionUseAllowed` | Must be `false`. |
| `runtimeUseAllowed` | Must be `false`. |
| `storageAllowed` | Must be `false`. |
| `lifecycleNote` | Short internal structural note. |
| `safetyNotes` | Explicit fixture-use constraints. |

Exact allowlists reject any additional runtime or identity-bearing fields.

## Reference alignment

- Metadata versions must match the exact loaded graph, blueprint, item and
  response/evidence artifacts.
- Every session `diagnosticBlueprintVersion` must equal the pinned blueprint
  version.
- Every `blueprintSlotId` must exist in the Slice 3 blueprint.
- Every selected item must exist and its blueprint slot must be listed by the
  session.
- The session slot set must equal the slots implied by its selected items.
- Every response must exist and reference a selected item and listed slot.
- Every evidence record must exist, reference a listed response and align with
  its selected item and listed slot.
- A response or evidence fixture may belong to at most one Slice 6 session
  fixture.
- Reference alignment never upgrades an upstream `open_decision` review state.

## Abandonment and invalidation

`abandoned` means future collection stopped before ordinary closure. Existing
references, if any, remain structural only and cannot be interpreted as an
educational outcome. An abandoned fixture with no response or evidence uses
`referenceDisposition: no_linked_records`.

`invalidated` means the whole session and all linked references are excluded
from future evidence use under a reviewed policy. It uses
`referenceDisposition: excluded`. Invalidation is not deletion and does not
alter the referenced response/evidence fixtures.

`closed` uses `referenceDisposition: structural_only`. Other non-terminal
states use `pending`. None of these values authorizes runtime storage or
interpretation.

## Safety and forbidden data

The static artifact must not contain:

- final or correct answers;
- worked solutions, hints or revealing keys;
- correctness booleans or numeric evaluation values;
- mastery or proficiency claims;
- provider payloads, prompts or completions;
- textbook content or copied text;
- real student data or child PII;
- tenant, family, learner, account or device identifiers;
- attempts, events, timestamps, duration, storage keys or runtime tokens;
- database or persistence fields;
- analytics or deployment data.

All selected content and linked records remain the synthetic non-production
fixtures from earlier Wave 3 slices.

## Deferred decisions

Deferred until later explicitly approved slices:

- production session identity and idempotency rules;
- authorization, tenant isolation and child-data minimization;
- persistence schema, retention, deletion and audit policy;
- item selection, ordering, timing, pause and resume behavior;
- accessibility and interrupted-flow recovery;
- actual response collection and confirmation provenance;
- deterministic checking and validity rules;
- outcome calculation, evidence aggregation and contradiction handling;
- mastery, proficiency, recommendations and learning-plan updates;
- API, OpenAPI, Prisma and web contracts;
- analytics, reports, production operations and real-child use.
