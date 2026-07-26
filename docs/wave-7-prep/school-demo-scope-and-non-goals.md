# Synthetic school demo scope and non-goals

## Purpose

This document bounds a school-shaped demonstration track before Wave 7 school
beta approval. It is a static planning artifact. It does not create a school
product surface or imply that Learnika is ready for a real school.

## In scope for the demo foundation

- a synthetic organization, school and academic year;
- synthetic grade 7–9 classes, teacher roles, students and optional parent
  links;
- a conceptual teacher assignment builder;
- a conceptual online assignment delivery flow;
- aggregate class analytics concepts;
- CSV/XLSX import-first planning with preview, validation and rejection;
- PDF variant, answer-sheet and answer-key planning;
- future OMR and manual-review boundaries;
- school-versus-family tenancy and authorization assumptions;
- PII-safe fixture, logging and retention rules;
- a ten-slice implementation plan with a final demo closure gate.

The foundation may use diagrams, tables and synthetic labels, but it must not
contain operational records or real educational content.

## Explicit non-goals

This track does not:

- start or approve a real school beta;
- name a design-partner school or contact;
- onboard a real organization, teacher, learner or parent;
- add school tenancy tables, migrations, API routes, OpenAPI paths, web routes
  or runtime authorization;
- import or retain a real roster;
- send invitations, issue credentials or integrate an identity provider;
- connect to an electronic journal, government system or school information
  system;
- claim compliance with Russian education, privacy, procurement or archival
  law;
- publish grades, final marks, attendance, timetable, HR or disciplinary data;
- perform OMR, handwriting recognition, automatic grading or teacher review;
- create learner-facing diagnostics, readiness transitions or production
  analytics;
- use real textbook exercises, protected source content or student work;
- establish school licensing, billing or entitlement terms;
- make a production retention, deletion, export or legal-hold commitment.

## Synthetic semantics

Every example must be visibly synthetic and disposable. Use role labels and
opaque demo codes rather than personal-like names or contact details. A
synthetic class such as `DEMO_CLASS_8B` is a label for a scenario, not an
identifier that can be resolved outside the demo.

The demo must fail closed when a fixture contains a real name, school name,
email address, phone number, address, government identifier, account
identifier, production learner record, raw media, provider payload or copied
textbook content.

## Wave 7 boundary

The real Wave 7 gate remains blocked until the business gate and named
design-partner gate are approved. This preparation track may be reviewed
independently, but it cannot be treated as pilot evidence or as authorization
to implement the beta.
