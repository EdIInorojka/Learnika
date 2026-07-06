# API contract principles

 

## Style

- REST over HTTPS;

- JSON request and response bodies;

- OpenAPI is the published contract;

- generated TypeScript and Python clients where useful;

- ISO 8601 timestamps in UTC;

- opaque identifiers;

- explicit pagination and filtering;

- idempotency keys for creation flows that may retry.

 

## Common response metadata

 

```json

{

  "data": {},

  "meta": {

    "requestId": "req_...",

    "apiVersion": "2026-07-01"

  }

}

```

 

## Error format

 

```json

{

  "error": {

    "code": "HOMEWORK_UNSUPPORTED_PROBLEM",

    "message": "This problem type is not supported yet.",

    "requestId": "req_...",

    "details": {}

  }

}

```

 

Messages shown to children must be mapped to age-appropriate localized copy rather than exposing internal errors.

 

## Initial endpoint groups

 

### Authentication and sessions

- `POST /auth/register-parent`

- `POST /auth/login`

- `POST /auth/refresh`

- `POST /auth/logout`

- `GET /sessions`

- `DELETE /sessions/{sessionId}`

 

### Family and child

- `POST /families`

- `GET /families/{familyId}`

- `POST /families/{familyId}/children`

- `GET /children/{childId}`

- `PATCH /children/{childId}`

- `POST /children/{childId}/consents`

 

### Curriculum and textbooks

- `GET /subjects`

- `GET /grades`

- `GET /textbooks?subject=&grade=`

- `GET /textbooks/{editionId}/sections`

- `PUT /children/{childId}/learning-context`

 

### Homework

- `POST /children/{childId}/homework/uploads`

- `POST /homework/{homeworkId}/assets/complete`

- `GET /homework/{homeworkId}`

- `POST /homework/{homeworkId}/confirm-problems`

- `POST /homework/problems/{problemId}/attempts`

- `POST /attempts/{attemptId}/steps`

- `POST /attempts/{attemptId}/hints`

- `POST /attempts/{attemptId}/complete`

- `GET /attempts/{attemptId}/transfer`

- `POST /transfer/{transferId}/answer`

 

### Voice input

- `POST /v1/voice-sessions` — create a session and signed upload target;

- `POST /v1/voice-sessions/{id}/complete` — confirm upload and queue transcription;

- `GET /v1/voice-sessions/{id}` — retrieve processing or review state;

- `POST /v1/voice-sessions/{id}/confirm` — save learner-confirmed text;

- `DELETE /v1/voice-sessions/{id}` — cancel and delete temporary media.

 

Create request contains child, purpose, locale and MIME type. Completion contains duration and size. Review response may contain raw transcript, normalized text, confidence and uncertain fragments. Confirm request contains only learner-approved text.

 

Voice-specific error codes include:

 

- `VOICE_PERMISSION_REQUIRED`;

- `VOICE_FILE_TOO_LARGE`;

- `VOICE_DURATION_EXCEEDED`;

- `VOICE_FORMAT_UNSUPPORTED`;

- `VOICE_NO_SPEECH_DETECTED`;

- `VOICE_LOW_CONFIDENCE`;

- `VOICE_TRANSCRIPTION_FAILED`;

- `VOICE_SESSION_EXPIRED`.

 

### Diagnostics and plans

- `POST /children/{childId}/diagnostics`

- `GET /diagnostics/{diagnosticId}`

- `GET /children/{childId}/mastery`

- `GET /children/{childId}/weekly-plan`

- `POST /plan-items/{planItemId}/start`

- `POST /plan-items/{planItemId}/complete`

 

### Reports

- `GET /children/{childId}/reports/weekly/latest`

- `GET /children/{childId}/reports/weekly?cursor=`

 

### Escalations

- `POST /attempts/{attemptId}/escalations`

- `GET /teacher/escalations`

- `POST /teacher/escalations/{caseId}/resolve`

 

### Entitlements — paid beta

- `GET /families/{familyId}/entitlements`

- `POST /billing/checkout-session`

- `POST /billing/webhooks/{provider}`

 

## Internal math-AI contract

 

### Normalize problem

`POST /internal/v1/problems/normalize`

 

Input includes sanitized asset reference or extracted text, locale, expected grade and policy version.

 

Output:

 

```json

{

  "problemType": "linear_equation",

  "normalized": {

    "expression": "2*x + 3 = 11",

    "variables": ["x"]

  },

  "candidates": [],

  "confidence": 0.97,

  "provider": "mock-or-approved-provider",

  "modelVersion": "...",

  "schemaVersion": "1.0"

}

```

 

### Validate step

`POST /internal/v1/steps/validate`

 

Output must distinguish:

 

- valid equivalent transformation;

- valid but incomplete step;

- arithmetic error;

- algebraic rule error;

- unrelated step;

- ambiguous parse;

- unsupported operation.

 

### Select hint

`POST /internal/v1/hints/select`

 

The service returns a structured hint intent, not unrestricted prose. Final child-facing text is selected from reviewed templates or controlled generation.

 

## Internal Speech-to-Text contract

 

The core API accesses transcription through a provider-neutral adapter. Input contains storage key, locale, optional mathematical context and request identifier. Output contains transcript, optional segment confidence, provider metadata and processing duration.

 

Raw audio never enters the external learning API response.

 

## Authorization

Every endpoint documents:

 

- actor roles;

- required scope;

- tenant boundary;

- ownership checks;

- audit behavior;

- rate and cost limit.

 

## Versioning

Breaking changes require a new API or schema version. AI schema, curriculum and content versions are independent and stored with results.