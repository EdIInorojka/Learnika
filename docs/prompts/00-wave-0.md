# Codex prompt — Wave 0

 

Read `AGENTS.md` and every document linked from `docs/INDEX.md` that is relevant to Wave 0.

 

Explicitly create focused subagents for:

 

- product and scope;

- architecture and domain;

- curriculum and textbook mapping;

- AI, math and homework safety;

- voice and media processing;

- student and parent UX;

- security and privacy;

- data and analytics;

- QA and evaluation;

- DevOps and delivery;

- independent review.

 

Do not write production feature code.

 

Produce:

 

1. repository summary and missing foundations;

2. assumptions and truly blocking questions only;

3. domain context map;

4. dependency graph and file ownership matrix;

5. proposed monorepo structure;

6. ADR plan and initial ADRs including voice pipeline;

7. data model with tenant, PII, media retention and audit columns;

8. API and event contracts for the Wave 2 homework and voice vertical slice;

9. skill-graph seed plan and first problem whitelist;

10. clickable or coded prototype plan for upload, hints and transcript confirmation;

11. threat-model and provider-policy plan for OCR, Speech-to-Text and LLM;

12. test, security, voice and AI-evaluation strategy;

13. prioritized implementation backlog for Waves 1-3;

14. exact commands and expected artifacts;

15. review checkpoint.

 

Each subagent must return findings, proposed decisions, risks and open items. The orchestrator must resolve conflicts and return one integrated recommendation.

 

Stop after independent review. The final verdict must be APPROVE, APPROVE WITH FIXES or BLOCK.