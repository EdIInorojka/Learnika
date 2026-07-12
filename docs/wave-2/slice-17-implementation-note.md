# Wave 2 Slice 17 Implementation Note

## Scope

Slice 17 replaces the static web shell with a minimal parent authentication foundation. It adds no
homework, media, OCR, voice, hint, answer, school, billing or analytics interface and changes no API
route, OpenAPI contract, database schema or migration.

## Server-Side API Client

The web API wrapper accepts only root-relative paths and resolves them against
`LEARNIKA_API_BASE_URL`, defaulting to the local API at `http://127.0.0.1:3001`. Absolute,
protocol-relative, backslash and whitespace-containing paths are rejected before `fetch`.

Requests use `cache: no-store`, reject redirects and never log request headers or response bodies.
API failures retain only an allowlisted code, HTTP status and locally defined safe message. Raw API
error messages and bodies are discarded.

## Token And Session Handling

Register, login, refresh and logout use Next server actions. Access and refresh tokens remain on the
server and are stored in separate cookies with `HttpOnly`, `SameSite=Strict`, root path, API-derived
expiry and `Secure` in production. Tokens are never placed in React state, browser storage, URLs or
rendered output.

The authenticated request helper reads the access token server-side and adds the bearer header only
to the internal API request. Logout attempts API revocation and always clears both local cookies.
Refresh rotates both cookies through the existing API endpoint.

## Minimal Shell

The anonymous shell provides parent registration and login forms. An expired access session with a
remaining refresh cookie can be rotated explicitly. The authenticated shell verifies `/auth/me`,
shows the parent account email and provides logout. Unavailable and rejected authentication states
use fixed local messages without API response details.

No client component or state-management dependency is introduced. No browser code can read the
tokens because all auth actions and session access remain server-side.

## Tests And Risks

Dependency-free Node tests cover strict API paths, sanitized errors, runtime auth response parsing,
bearer-header use inside the server wrapper, `HttpOnly` and strict-same-site cookie guards, absence of
browser token storage and logging, auth action route coverage and UI scope exclusions.

This foundation does not implement automatic background refresh, CSRF tokens beyond Next server
action protections and strict-same-site cookies, multi-device session management, login rate limiting
or production deployment configuration. The API base URL and secure-cookie behavior require review
for the eventual deployment topology.

Rollback removes the web auth libraries, server actions, tests, styles and this note, then restores
the static shell and prior web test script. No API, contract or database rollback is required.
