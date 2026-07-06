# ADR-001: Use a modular monolith for the core API

 

- Status: Accepted

- Date: 2026-07

- Owners: solution-architect, backend-platform

 

## Context

The product has several future domains but the first production scope is narrow. Premature microservices would increase deployment, testing, observability and data-consistency costs before independent scale is proven.

 

## Decision

Implement the core business platform as a modular monolith with explicit domain modules and contracts. Keep the Python math-AI component separate because it uses a distinct runtime and mathematical toolchain.

 

## Consequences

 

### Positive

- faster delivery and simpler local development;

- easier transactions across early domains;

- lower operational burden;

- clear path to extraction through module boundaries and events.

 

### Negative

- disciplined module ownership is required;

- one deployment contains multiple domains;

- a poorly structured monolith may become tightly coupled.

 

## Extraction criteria

A module may become a service only when independent scaling, security, language, lifecycle or measured bottleneck justifies it.

 

## Guardrails

- no direct cross-module database access outside approved repositories;

- contracts and domain events for significant boundaries;

- architecture tests for forbidden dependencies;

- ADR required for extraction.