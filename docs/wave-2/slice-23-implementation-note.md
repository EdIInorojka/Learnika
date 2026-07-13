# Wave 2 Slice 23 Implementation Note

## Scope

Slice 23 adds a minimal authenticated web control for creating homework attempt metadata and extends
the existing homework detail list to show each attempt's number, status, creation time and update
time. It uses only the existing parent-protected homework attempt API.

This slice adds no API route, OpenAPI change, Prisma change, migration, dependency, object-storage
access or generated educational behavior.

## Attempt Creation Boundary

The attempt form has no learner input fields. Its server action rejects every submitted field except
Next's internal server-action markers, then constructs the fixed `{ status: "CREATED" }` request.
The authenticated server-only API wrapper sends that payload only to
`POST /homework/sessions/{homeworkSessionId}/attempts`.

The response parser rejects generated, media-bearing or provider-related fields and projects only
the attempt number, status, creation time and update time. API errors become fixed redirects and
messages; response bodies are neither rendered nor logged. Existing tenant-safe API authorization
continues to own family, child and homework-session access checks.

## Learner Data Boundary

Attempt creation is explicitly metadata-only. The page states that learner answers and locally
confirmed OCR text are not saved. Slice 22 local OCR confirmation remains disconnected from this
form and action. There is no text input, answer submission, correctness state, hint, solution,
prompt, completion, provider payload, raw media, storage key or original filename in this flow.

Tokens remain in the Slice 17 server-only HttpOnly-cookie path. This slice adds no browser storage,
direct MinIO or S3 access, logging or client-side persistence.

## Tests And Rollback

Dependency-free tests cover the fixed no-input request, rejection of extra form fields, safe response
projection, forbidden response-field rejection, the exact authenticated API route and method,
protected layout use, absence of browser or object-storage access, and rendering of only the four
approved attempt fields.

Rollback removes the attempt action and focused test, restores the prior web test command and detail
page attempt section, removes the Slice 23 styles and this note, and removes the single-attempt parser
and service call. No API, contract, database, infrastructure or dependency rollback is required.
