# ADR-003: Explicit family and school tenancy

 

- Status: Accepted

- Date: 2026-07

- Owners: solution-architect, security-privacy, backend-platform

 

## Context

The platform serves B2C families and later B2B schools. A learner may belong to both contexts, but the legal basis, visibility and purpose of data differ.

 

## Decision

Model family and organization as explicit tenant scopes. Authorization is evaluated by actor, resource, tenant, relationship, purpose and role.

 

School membership does not automatically grant access to private family homework or subscription data. Cross-context sharing requires a defined feature, policy, legal basis and auditable permission.

 

## Implementation principles

- tenant identifier or equivalent scope on every tenant-owned record;

- repository methods require tenant context;

- default-deny authorization;

- policy tests for horizontal and vertical privilege escalation;

- audit sensitive access and exports;

- support separate retention and deletion rules;

- analytics removes direct identifiers.

 

## Alternatives rejected

- one global learner record visible to all assigned adults;

- role-only checks without tenant relationship;

- separate databases for every family at launch.

 

## Review trigger

Revisit physical database isolation when school contracts, regulation, scale or risk require stronger separation.