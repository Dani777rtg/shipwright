# Deploy catalog — platforms and production readiness

Used by the `devops-lead` agent (deployment strategy in Architect, delivery in Ship). Verified 2026-10-14; items marked [NV] come from secondary sources — confirm in the platform docs before relying on them. The user's platform wins; if none is imposed, pick by workload and record it in an ADR.

## Platform changes to know
- **AWS App Runner** closed to new customers (2026-04-30): use **ECS Express Mode** or ECS Fargate.
- **Heroku** is in sustaining-engineering mode (2026-02): do not choose it for new projects.
- **Cloudflare Pages**: new projects use **Workers with static assets** (Wrangler ≥ 4).
- **Fly.io legacy Postgres** is deprecated: use Managed Postgres.

## Platforms

| Platform | Fits | Container web/API service | Config / IaC | Deploy | Rollback |
|---|---|---|---|---|---|
| Azure | Enterprise, SSR, API, jobs | Container Apps (App Service, Static Web Apps) | `azure.yaml` + Bicep / Terraform | `azd up` [NV] | Previous revision + traffic weights |
| AWS | Anything | ECS Express Mode / Fargate; Lambda for events | CDK / Terraform / OpenTofu / CloudFormation | `aws ecs create-express-gateway-service`, `cdk deploy` | Express Mode canary with automatic alarm rollback |
| GCP | API containers, jobs | Cloud Run (services + jobs) | Terraform; service YAML | `gcloud run deploy --source .` / `--image` | `gcloud run services update-traffic --to-revisions` [NV] |
| Render | SSR, API, workers, cron, Postgres | Web Service | `render.yaml` Blueprint | Git push / Blueprint sync | Dashboard [NV] |
| Railway | API, workers, Postgres/Redis | Service | `railway.json` / `railway.toml` | `railway up` | Dashboard [NV] |
| Fly.io | Global, near-user APIs | Machines | `fly.toml` | `fly deploy` | Redeploy previous image [NV]; `bluegreen` strategy |
| Vercel | Next.js, SSR, static, functions | — (no long-running containers) | `vercel.json` | `vercel --prod` | `vercel rollback` / Instant Rollback |
| Netlify | Static, Jamstack, functions | — | `netlify.toml` | `netlify deploy --prod` [NV] | "Publish deploy" on an older deploy |
| Cloudflare | Edge, static, APIs | Workers + static assets | `wrangler.jsonc` / `wrangler.toml` | `wrangler deploy` | `wrangler rollback` [NV] |
| DigitalOcean | SSR, API, workers, Postgres | App Platform | `.do/app.yaml` | `doctl apps create --spec` / `apps update <id> --spec` | Previous deployment in dashboard [NV] |
| VPS / Docker | Low cost, full control | Compose + Caddy, or Kamal | `compose.yaml`, `config/deploy.yml` | `docker compose up -d`, `kamal deploy` | Previous image tag / `kamal rollback` [NV] |
| Kubernetes | Many services at scale | EKS / AKS / GKE | Helm / Kustomize + Argo CD / Flux | `helm upgrade`, `kubectl apply` | `kubectl rollout undo`, Argo Rollouts |
| Mobile | iOS / Android | EAS (Expo), Fastlane | `eas.json` | `eas build` + `eas submit`; `eas update --channel production` | No instant store rollback: phased rollout + OTA fixes |

## Platform notes

- **Azure** — Container Apps revisions with weighted traffic (new revision at 0%, test on its own URL, then shift). Secrets: Key Vault references. Data: PostgreSQL Flexible Server, Azure Managed Redis [NV]. Logs/alerts: Log Analytics + Azure Monitor. CI: `azure/login` with OIDC federated credential.
- **AWS** — ECS Express Mode creates ALB, target groups, security groups, autoscaling; health path defaults to `/ping`; updates canary 5% with automatic rollback on error rate. Secrets: Secrets Manager / SSM. Data: RDS/Aurora PostgreSQL, ElastiCache/Valkey. CloudWatch logs/alarms, ACM for TLS, AWS Budgets. CI: `aws-actions/configure-aws-credentials` with `role-to-assume` and the GitHub OIDC provider, trust scoped to repo and branch/environment.
- **GCP** — Cloud Run revisions and tagged preview URLs; scales to zero (watch cold starts); startup and liveness probes. Secrets: Secret Manager. Data: Cloud SQL, Memorystore. CI: `google-github-actions/auth` with Workload Identity Federation; deploy account needs Artifact Registry writer, Cloud Run admin, service account user.
- **Render** — `render.yaml`: `healthCheckPath`, `preDeployCommand` (migrations), `previews.generation`, `envVarGroups`, `sync: false` for secrets; `databases:` for Postgres; `type: keyvalue` needs `ipAllowList`. Region is fixed at creation. Free instances sleep [NV].
- **Railway** — config-as-code overrides the dashboard; `deploy.preDeployCommand`, `healthcheckPath`, `healthcheckTimeout`, overlap/draining seconds for zero downtime. Postgres/Redis templates; per-PR environments [NV].
- **Fly.io** — `[deploy] strategy` rolling / immediate / canary / bluegreen (canary and bluegreen not with volumes; bluegreen needs a health check). `release_command` runs migrations; failure aborts the deploy. Health checks don't follow redirects. `fly secrets set`; `fly certs add` [NV].
- **Vercel** — Instant Rollback (Hobby: only to the previous deployment); Rolling Releases on Pro+; previews per branch. Not for long-running workers or WebSockets. OIDC for reaching clouds from functions; CI deploys still need `VERCEL_TOKEN`.
- **Netlify** — rollback by publishing an older deploy; turn off auto-publish or the next push overrides it; rollback restores code, not data.
- **Cloudflare** — `assets.directory`, `not_found_handling: "single-page-application"` for SPAs, `.assetsignore` for internal files; `wrangler secret put`; D1, KV, R2, Hyperdrive [NV].
- **DigitalOcean** — app spec `health_check` and `liveness_health_check`; download the current spec before `apps update`. `create-deployment --force-rebuild` is a rebuild, not a rollback.
- **VPS / Docker** — Compose healthchecks, Caddy for automatic TLS. You own backups, OS patches, firewall, log shipping.
- **Kubernetes** — probes, requests/limits, PodDisruptionBudget, HPA; External Secrets or Sealed Secrets (base64 is not encryption); cert-manager; databases managed outside the cluster.
- **Mobile** — EAS build profiles map to update channels; Fastlane `deliver`/`supply`/`match` with store API keys as CI secrets.

## Production readiness (Ship gate — "done" means all met or `No aplica: <reason>` approved)

| # | Area | Requirement | Evidence |
|---|---|---|---|
| 1 | Config | 12-factor: config from env, validated at startup; no secrets in git or images; same artifact promoted staging → production | Secret scan clean; app boots with production config in staging |
| 2 | CI identity | Deploys via OIDC, least-privilege role scoped to branch/environment; no long-lived cloud keys | No static cloud keys in CI secrets |
| 3 | Health | Liveness, readiness (checks dependencies) and startup endpoints wired to the platform | A broken build is refused automatically |
| 4 | Release safety | Rolling / blue-green / canary with automatic rollback; migrations expand/contract in the pre-deploy step | Rollback rehearsed in < 5 min; previous version works with the migrated schema |
| 5 | SLOs | Availability and latency SLIs, SLO, error-budget policy, burn-rate alerts | Alert fired in a test |
| 6 | Observability | OpenTelemetry traces + metrics, structured logs without PII, trace ID in responses, external uptime check | A synthetic request is traceable end to end |
| 7 | Security | TLS everywhere + HTTPS redirect; security headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors, Permissions-Policy); rate limiting; strict CORS; image/dependency CVE scan | Header scan passes; no critical CVEs (see `security-baseline.md`) |
| 8 | Data | Managed database with point-in-time recovery; encrypted automated backups with retention | Restore drill into a scratch database; actual RTO/RPO recorded |
| 9 | Reliability | ≥ 2 instances or HA when the SLO needs it; graceful SIGTERM shutdown; timeouts and retries with backoff; autoscaling limits | Instance killed during a test without user-visible errors |
| 10 | Performance | Load test at 2× expected peak; Core Web Vitals within budget for web | QA report |
| 11 | Cost | Budget and anomaly alerts; right-sized instances; non-production scales to zero; previews cleaned up | Budget alert exists |
| 12 | Operations | Runbook (deploy, rollback, restore, rotate secrets, alerts), owner, escalation path, incident and postmortem templates | `<docsDir>/ops/runbook.md` linked from README |
| 13 | Post-deploy | Smoke + canary watch on the production URL ≥ 15 min; no error-rate regression | Canary report |
| 14 | Domain | Custom domain, DNS and TLS certificate configured and auto-renewing (when the deliverable is public) | HTTPS check on the final URL |

## ECC tools (in `vendor/ecc/`)
`skills/deployment-patterns` (strategies, Dockerfiles, CI pipeline, health, rollback; note: its `railway up --commit` example is not a real flag), `skills/docker-patterns`, `skills/kubernetes-patterns`, `skills/database-migrations`, `skills/canary-watch`, `skills/browser-qa`, `skills/production-audit`, `skills/github-ops`, `skills/uncloud`.

ECC does not cover (this catalog does): per-platform specifics, OIDC deploys, IaC per cloud, SLOs and error budgets, OpenTelemetry setup, restore drills, cost alerts, DNS/TLS, data residency, mobile store delivery, incident templates.

Sources: `docs/investigacion/despliegue.md`.
