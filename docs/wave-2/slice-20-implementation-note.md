# Wave 2 Slice 20 Implementation Note

## Scope

Slice 20 adds an authenticated upload form for eligible media asset metadata rows on the existing
homework session detail page. It uses only the approved local upload route:

`POST /homework/sessions/{homeworkSessionId}/media-assets/{mediaAssetId}/upload`

It changes no API route, OpenAPI contract, Prisma schema, migration, infrastructure configuration or
dependency.

## Eligibility And Validation

The file input appears only for parsed image, screenshot or PDF metadata that remains `TEMPORARY`, has
an unexpired retention deadline and declares a non-zero size within the 10 MiB limit. The action
accepts exactly one `file` field and rejects missing, duplicate and unsupported fields before calling
the API. Selected bytes must match the metadata MIME type and exact byte size.

Next's server-action body ceiling is set to 11 MB to leave bounded room for multipart framing around a
file that remains subject to the stricter 10 MiB application and API limit.

The API remains authoritative for parent and tenant authorization, retention state, metadata match,
file signature, checksum and local object-storage write behavior.

## Server-Side Transfer Boundary

The protected homework layout resolves the parent session before upload UI can render. The Next
server action reads the access token only through the Slice 17 server session foundation. A dedicated
multipart API client shares the existing root-relative path check, sanitized errors, `no-store` and
redirect rejection. It leaves `Content-Type` unset so `fetch` creates the multipart boundary.

The browser-provided filename is never read, rendered, logged or persisted by web code. Before the
server-to-API request, the multipart filename is replaced with the constant `upload.bin`. Uploaded
bytes remain inside the server action and API request and are never returned to React, encoded as
base64 or written by web code.

The API response is passed through the Slice 19 safe metadata projection, which discards storage keys,
checksum values and tenant or child identifiers before the action ignores the result.

## Deferred Scope

This slice adds no direct MinIO access, download, signed or public URL, OCR candidate, voice, OCR, STT,
LLM, provider, hint, answer-checking, solution, billing, school, mobile, analytics or deployment
behavior. Repeated uploads remain possible under the existing Slice 13 metadata limitations.

## Tests And Rollback

Dependency-free Node tests cover missing and duplicate file rejection, unsupported form fields,
MIME/size mismatch, upload eligibility, sanitized outbound multipart naming, automatic multipart
boundary handling, server-side bearer use, exact upload-route use and forbidden-scope absence.

Rollback removes the upload contract, service, action, tests and this note, restores the prior web test
script, removes the file form and upload states from the homework detail page, reverts its style
additions and removes multipart support from the web API/auth clients. No API, database or dependency
rollback is required.
