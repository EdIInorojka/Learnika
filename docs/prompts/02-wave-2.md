# Codex prompt — Wave 2

 

Read `AGENTS.md`, `docs/product/voice-input.md`, the homework and AI documents, approved contracts and Wave 1 implementation.

 

Implement one end-to-end homework-helper vertical slice with optional web voice input for the approved problem whitelist.

 

Required homework flow:

 

1. create upload;

2. validate and sanitize asset;

3. recognize through deterministic mock and one adapter interface;

4. return task candidates and confidence;

5. learner confirms the task;

6. learner types an attempt or records a short question or step;

7. voice is transcribed and normalized through provider-neutral interfaces;

8. learner edits and confirms transcript;

9. Python service validates supported mathematics deterministically;

10. invalid step returns a structured error category;

11. hint policy selects the minimum sufficient hint after an attempt;

12. source final answer remains hidden;

13. learner completes the task;

14. learner receives a reviewed transfer problem;

15. transfer result emits learning evidence;

16. temporary media is deleted according to policy.

 

Required voice behavior:

 

- explicit microphone permission;

- visible foreground recording state;

- maximum 60-second recording;

- stop and cancel;

- signed private upload;

- transcription queue and worker;

- Speech-to-Text adapter plus deterministic mock;

- mathematical speech normalizer;

- uncertain-fragment highlighting;

- editable confirmation;

- typed fallback;

- retention cleanup and deletion audit;

- no background recording, realtime dialogue or raw-audio delivery to the tutoring LLM.

 

Required controls:

 

- strict schemas;

- model, provider and policy versioning;

- EXIF stripping;

- private storage and signed URLs;

- MIME, size and duration limits;

- rate and AI, OCR or speech cost limits;

- idempotency;

- safe decline for unsupported content;

- answer-leak tests;

- prompt-injection image and spoken-text tests;

- PII-safe logs and analytics;

- authorization tests for voice sessions;

- deletion compliance tests.

 

Do not implement unrestricted chat, arbitrary mathematics, native mobile, billing or school features.

 

Run unit, integration, E2E, security, media and AI-evaluation gates. Obtain curriculum, security, QA and independent-review verdicts.