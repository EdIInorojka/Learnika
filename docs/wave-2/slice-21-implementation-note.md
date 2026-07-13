# Wave 2 Slice 21 Implementation Note

## Scope

Slice 21 adds a minimal authenticated mock OCR candidate panel to eligible media rows in the
existing homework detail page. It uses only the approved protected route:

`POST /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/mock-ocr-candidate`

The panel can request the three API-allowlisted synthetic scenarios: a candidate, a low-confidence
review state and a safe failure. It changes no API route, OpenAPI contract, Prisma schema, migration,
infrastructure configuration or dependency.

## Authentication And Eligibility

The Slice 18 homework layout resolves the parent session before any media or OCR UI can render. The
server action and server-only service use the Slice 17 authenticated API wrapper, so bearer tokens
remain in `HttpOnly`, `SameSite=Strict` cookies and never enter React state, browser storage, URLs or
logs. Existing API family, session and media authorization remains authoritative.

The panel appears only for parsed image, screenshot or PDF metadata that is temporary, unexpired,
non-empty and checksum-ready. This is a metadata-only eligibility signal. As established by Slice 16,
object existence remains `UNKNOWN_NOT_VERIFIED`; the web performs no MinIO or S3 operation. A checksum
may have been declared when metadata was registered, so the API readiness boundary remains the final
authority rather than the panel claiming that bytes were independently verified.

## Candidate Trust And Ephemeral State

The server-side parser allowlists the exact response schema and enforces:

- `learnerConfirmationRequired=true`;
- `downstreamUseAllowed=false`;
- `metadataOnly=true`;
- `objectExistence=UNKNOWN_NOT_VERIFIED`;
- candidate trust of `UNTRUSTED_OCR_CANDIDATE`.

Only status, confidence, trust gates and candidate text needed for immediate review reach the client
component. Media identifiers, candidate identifiers, model and policy versions, object state details
and failure internals are validated and discarded. Unknown fields, storage metadata, original
filenames, raw media, answers, solutions, hints, STT or LLM content and provider payloads fail the web
contract.

Candidate text is visibly marked as untrusted. The panel states that learner confirmation is required
and downstream use is disabled. Low-confidence and failure response variants cannot carry candidate
text and render fixed safe messages instead. The result exists only in React action state for the
current page lifetime; there is no URL, cookie, browser-storage, API or database persistence and no
confirmation control yet.

## Deferred Scope

This slice adds no real OCR provider, SDK or external call; object read, stat, list, download or delete;
OCR or confirmation persistence; editable confirmed text; STT, LLM, prompt, completion or provider
payload; hint, answer-checking or solution behavior; media download or signed/public URL; voice UI;
billing, school, mobile, analytics or deployment behavior.

## Tests And Rollback

Dependency-free web tests cover safe candidate projection, explicit trust and confirmation gates,
low-confidence and failure text omission, unknown-field rejection, scenario allowlisting, metadata
eligibility, protected-route use, the exact mock OCR route, ephemeral action state and forbidden-scope
absence.

Rollback removes the mock OCR web contract, server service, server action, client panel, tests and this
note, restores the previous web test script, removes the panel from the homework detail page and
reverts its style additions. No API, contract, database, infrastructure or dependency rollback is
required.
