# Wave 2 Slice 19 Implementation Note

## Scope

Slice 19 adds an authenticated media asset metadata section to the existing homework session detail
page. It uses only the approved create and list metadata route nested under a homework session. It
does not change API behavior, OpenAPI, Prisma, migrations, infrastructure or dependencies.

The parent can register metadata containing an approved asset kind, matching MIME type, byte size and
optional SHA-256 checksum. The page lists safe display metadata for assets already registered to the
session.

## Authentication And Authorization

The Slice 18 protected `/homework` layout resolves the Slice 17 server-side parent session before any
homework or media loading state can render. Server components and the media server action call the
existing authenticated API wrapper. The API remains authoritative for family, homework session and
media asset tenant authorization.

Tokens remain in `HttpOnly`, `SameSite=Strict` cookies and never enter React state, browser storage,
URLs or logs. API errors are converted to fixed local states; raw response bodies are neither rendered
nor logged.

## Safe Metadata Projection

The API media response includes internal family, child, session and creator identifiers plus an
opaque storage key. The web parser validates the response and projects it into a smaller view with
only:

- asset kind and MIME type;
- byte size;
- whether a checksum exists, without returning the checksum value to React;
- retention state and deadline;
- created and updated timestamps;
- an opaque asset identifier used only as the React list key.

Storage keys, checksum values, child identifiers, tenant identifiers, original filenames and deletion
internals are discarded before rendering. Unsafe answer, solution, hint, OCR, STT, LLM, provider,
prompt, completion, transcript, raw media, base64 and filename fields cause a safe contract failure.

## Transfer Boundary

The browser form contains no file input and uses a Next server action with ordinary scalar metadata.
There is no multipart encoding, raw media, base64, MinIO access, upload route, download route, signed
URL, OCR candidate or provider call in the web implementation. The session identifier is bound to the
server action and is not added as a browser form field.

## Tests And Rollback

Dependency-free Node tests cover safe response projection, storage-key and checksum-value omission,
unsafe response rejection, exact create metadata fields, kind/MIME validation, protected-route use,
approved API paths and absence of transfer/provider/browser-storage behavior.

Rollback removes the media metadata contract, service, action, labels, tests and this note, restores
the prior web test script, removes the media section from the homework detail page and reverts its
style additions. No API, contract, database, infrastructure or dependency rollback is required.
