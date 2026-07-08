# Local infrastructure

Slice 2 provides local Docker Compose infrastructure only. It does not create application shells, migrations, endpoints, provider mocks or production deployment configuration.

## Services

| Service | Image | Local port | Purpose |
| --- | --- | ---: | --- |
| PostgreSQL | `postgres:16.4-alpine` | `127.0.0.1:5432` | Local relational database |
| Redis | `redis:7.2.5-alpine` | `127.0.0.1:6379` | Local cache and queue backing service |
| MinIO | `minio/minio:RELEASE.2024-07-16T23-46-41Z` | `127.0.0.1:9000`, `127.0.0.1:9001` | Local S3-compatible object storage and console |

All credentials in `.env.example` are local placeholders only.

## Commands

```powershell
Copy-Item .env.example .env
pnpm.cmd run infra:up
pnpm.cmd run infra:validate
pnpm.cmd run infra:ps
pnpm.cmd run infra:down
```

To remove local containers and named volumes, run:

```powershell
pnpm.cmd run infra:clean -- --yes
```

`infra:clean` refuses to run without `--yes` because it deletes local Docker volumes.

