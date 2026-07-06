# ADR-002: Separate Python math-AI service

 

- Status: Accepted

- Date: 2026-07

- Owners: solution-architect, ai-vision-math

 

## Context

Mathematical normalization and validation benefit from Python libraries such as SymPy, while the core platform is planned in TypeScript. AI provider integration also needs a controlled boundary, evaluation tooling and cost policies.

 

## Decision

Create a separate Python service for recognition adapters, mathematical normalization, deterministic checking, step validation and structured hint support.

 

## Responsibilities

- accept sanitized task inputs;

- classify supported problem types;

- return strict schemas and confidence;

- run deterministic math checks;

- expose deterministic mocks for tests;

- record model and policy versions;

- never decide authorization or billing;

- never directly write learner mastery.

 

## Consequences

 

### Positive

- appropriate mathematical ecosystem;

- clearer AI security and cost boundary;

- independent evaluation and scaling;

- provider portability.

 

### Negative

- network and deployment complexity;

- schema synchronization required;

- cross-service tracing and idempotency required.

 

## Failure policy

Timeout, low confidence or invalid schema returns a safe failure. The core API asks for clarification or creates an escalation; it does not invent a result.