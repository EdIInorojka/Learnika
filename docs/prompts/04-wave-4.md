# Codex prompt — Wave 4

 

Start only after web homework, voice and learning-plan flows are approved.

 

Implement the native mobile application with React Native and Expo.

 

Required outcomes:

 

- initialize mobile application in the existing monorepo;

- implement approved child and parent journeys;

- use Expo Router and TypeScript;

- implement native camera upload;

- implement foreground-only microphone recording with visible state;

- implement secure token storage;

- implement resilient media upload, retry and cancellation;

- keep transcript confirmation and typed fallback identical to web policy;

- implement push notification foundations;

- add Sentry React Native and PII-safe analytics;

- configure EAS Build and approved update strategy;

- add permission, accessibility, offline and low-connectivity tests;

- update runbooks and release checklist.

 

Do not implement background recording, realtime voice dialogue, billing or school features.

 

Acceptance criteria:

 

- critical learner flow works on approved Android and iOS test devices;

- permission denial does not block typing;

- no audio records in background;

- secure storage and session revocation tests pass;

- upload retry is idempotent;

- mobile E2E and accessibility checks pass;

- independent reviewer approves.