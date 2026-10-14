# Deployment — sources (2026-10-14)

Basis of [`reference/deploy-catalog.md`](../../reference/deploy-catalog.md). Key findings: AWS App Runner closed to new customers (2026-04-30, use ECS Express Mode); Heroku in "sustaining engineering" mode (2026-02); Cloudflare recommends Workers with assets instead of Pages.

- https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html
- https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-update-full.html
- https://docs.aws.amazon.com/cli/latest/reference/ecs/create-express-gateway-service.html
- https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html
- https://github.com/hashicorp/terraform-provider-aws/issues/47161
- https://www.deployhq.com/blog/heroku-sustaining-engineering-alternatives (secondary)
- https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/
- https://docs.fly.io/reference/configuration
- https://docs.railway.com/config-as-code/reference · https://docs.railway.com/infrastructure-as-code
- https://render.com/docs/blueprint-spec
- https://vercel.com/docs/instant-rollback · https://vercel.com/docs/rolling-releases · https://vercel.com/docs/oidc
- https://docs.digitalocean.com/products/app-platform/reference/app-spec
- https://learn.microsoft.com/azure/container-apps/traffic-splitting · https://learn.microsoft.com/azure/container-apps/revisions-manage
- https://cloud.google.com/blog/products/devops-sre/deploy-to-cloud-run-with-github-actions
- https://docs.expo.dev/eas/build/updates/
- Frameworks: https://12factor.net · https://sre.google/sre-book/service-level-objectives/ · https://owasp.org/www-project-secure-headers/ · https://opentelemetry.io/docs/
