# Learnika Contracts

Slice 8 stores generated contract artifacts for the API routes that exist now.

Generate the OpenAPI artifact:

```powershell
pnpm.cmd run contracts:generate
```

Check that the artifact is current:

```powershell
pnpm.cmd run contracts:check
```

Validate contract scope and sensitive-field rules:

```powershell
pnpm.cmd run contracts:validate
```

The generated contract must not document future homework, voice, billing, school,
teacher/admin or provider-adapter routes as implemented.
