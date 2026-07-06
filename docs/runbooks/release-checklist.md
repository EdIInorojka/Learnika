# Release checklist

 

## Product

- active scope and non-goals are unchanged or approved;

- acceptance criteria are met;

- critical user journeys pass;

- parent and learner copy is reviewed;

- voice input remains optional and typed fallback works.

 

## Curriculum and AI

- supported problem whitelist is current;

- math gold sets pass;

- answer-leak evaluation passes;

- hint policy is versioned;

- recognition and transcription thresholds pass;

- mathematical speech normalization gold set passes;

- provider and policy versions are recorded;

- unsupported and low-confidence states are safe.

 

## Engineering

- formatting, lint and strict typecheck pass;

- unit, integration, contract and E2E tests pass;

- migrations are reviewed;

- generated contracts are current;

- feature flags and rollback path are documented;

- temporary-media cleanup tests pass.

 

## Security and privacy

- authorization and tenant-isolation tests pass;

- signed URL and file-validation tests pass;

- microphone permission and recording indicators are verified;

- only confirmed transcript reaches learning flows;

- raw audio is absent from logs and analytics;

- retention deadlines and deletion jobs are verified;

- no critical dependency, secret or provider risk remains;

- privileged access is audited.

 

## Operations

- dashboards and alerts are active;

- queue depth, transcription latency and cleanup failures are monitored;

- backup and restore status is current;

- runbooks match actual commands;

- on-call or responsible owner is named;

- cost limits and provider kill switches are configured.

 

## Review verdicts

Required verdicts for the active wave:

 

- product;

- curriculum;

- security and privacy;

- QA and evaluation;

- independent review.

 

Verdict is one of:

 

- APPROVE;

- APPROVE WITH FIXES;

- BLOCK.

 

## Post-release

- monitor activation, transfer, voice correction and safety metrics;

- review provider costs;

- review retention deletion compliance;

- triage incidents and support feedback;

- compare expected and actual behavior;

- create corrective tasks with owners and deadlines.