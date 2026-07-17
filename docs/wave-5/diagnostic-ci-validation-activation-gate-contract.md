# Diagnostic CI and deterministic validation activation gate contract

## Status

This Wave 5 / Slice 14 contract is a static, non-production placeholder for a future CI and deterministic validation activation gate. It does not activate a gate, modify the CI workflow, enable runtime enforcement, satisfy an activation prerequisite, or authorize diagnostic review.

The current diagnostic baseline remains:

- readiness: `NOT_READY`;
- activation: `BLOCKED`;
- review workflow: `INACTIVE`;
- blockers: exactly `INCOMPLETE_COVERAGE` and `NON_PRODUCTION_FIXTURES`;
- satisfied activation prerequisites: `0`;
- approved candidates and production approvals: `0`.

The `ci_and_deterministic_validation` prerequisite remains `UNSATISFIED_DEFERRED`.

## Contract identity and dependency pins

The placeholder uses gate ID `diagnostic-ci-and-deterministic-validation-activation-gate` and version `wave-5.slice-14.diagnostic-ci-and-deterministic-validation-activation-gate.placeholder.v1`. It pins exact static references to:

- Wave 5 / Slice 2 activation prerequisites;
- Wave 5 / Slice 12 readiness integration plan;
- Wave 5 / Slice 13 rollback and withdrawal policy;
- Wave 5 / Slice 11 coverage gap closure plan;
- Wave 5 / Slice 10 production approval authority policy.

These links provide consistency inputs only. They are not approval evidence and do not change any upstream state.

## Current validation baseline placeholder

The current `.github/workflows/ci.yml` configuration is observed read-only as a single `validate` job using Node 24, pnpm 11.7.0, frozen-lockfile installation, database generation, infrastructure validation, database validation, migration deploy, and aggregate repository validation.

This observation is not a gate decision, execution record, approval, or guarantee of future activation sufficiency. Slice 14 does not change the workflow file.

## Future required CI jobs

Before activation can be considered, a later approved slice must decide and implement an explicit job graph for:

- static governance validation;
- application quality validation;
- database and contract validation;
- infrastructure availability validation;
- safety and privacy validation;
- manual approval handoff.

The placeholder supplies identifiers and dependency shape only. No job is active, required by a changed workflow, executed, or allowed to contribute to an activation decision.

## Future deterministic validator matrix

A later approved slice must define deterministic checks for:

- exact upstream version pins;
- closed-world artifact schemas;
- exact worktree scope;
- governance artifact consistency;
- no-answer and no-scoring safety;
- privacy and PII scanning;
- runtime, API, OpenAPI, and web change boundaries;
- migration and schema drift;
- Docker and infrastructure availability;
- rerun reproducibility.

Each matrix row remains `TO_BE_DECIDED`, has no validator or fixture reference, and cannot execute or contribute to the gate.

## Future gate policies

The machine-readable artifact contains disabled placeholders for governance consistency, no-answer/no-scoring safety, privacy/PII scanning, runtime and interface change assessment, migration/schema drift, Docker/infra availability, rerun/flakiness handling, and manual approval handoff.

Activation requires future decisions for rule versions, negative fixtures, failure classification, rerun limits, flakiness ownership, infrastructure expectations, change-review routing, and independent manual authority. Empty evidence or a successful unrelated CI run must never satisfy the gate.

## Fail-closed boundaries

The Slice 14 validator must fail closed when:

- an upstream version pin or upstream blocked baseline changes;
- the CI prerequisite is not exactly `UNSATISFIED_DEFERRED`;
- readiness, activation, workflow, or blocker values drift;
- an active gate, workflow mutation, runtime enforcement, prerequisite satisfaction, activation transition, or readiness transition appears;
- any production approval, approved candidate, review evidence, review decision, digest, identity, assignment, authority grant, rollback, or withdrawal record appears;
- unknown fields, forbidden educational content fields, private identifiers, location-like values, candidate identifiers, or hash-like values appear;
- the worktree includes CI workflow, API, OpenAPI, Prisma, web, runtime, lockfile, dependency, or any other non-allowlisted path.

## Deferred decisions

The following remain unresolved prerequisites rather than implemented facts:

- final CI job graph and dependency order;
- deterministic validator ownership and fixture policy;
- governance consistency and safety/privacy rule versions;
- runtime/interface change review routing;
- migration/schema drift policy;
- Docker/infra failure classification;
- rerun and flakiness thresholds;
- manual approval handoff authority and sequencing.

No Wave 5 closure claim is made by this contract.
