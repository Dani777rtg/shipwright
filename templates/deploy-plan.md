---
status: draft
---
# Plan de despliegue — <misión>

## Plataforma

| Campo | Valor |
|---|---|
| Plataforma y servicio | |
| Motivo (ADR) | ADR-… |
| Regiones / residencia de datos | |
| Coste estimado mensual | |

## Entornos

| Entorno | URL | Cómo se crea | Datos |
|---|---|---|---|
| Preview | | | |
| Staging | | | |
| Producción | | | |

## Pipeline CI/CD

Build → tests → escaneos de seguridad → deploy a staging → smoke → aprobación → deploy a producción → canario.
- Identidad: OIDC hacia <nube>, rol mínimo, sin claves de larga duración.
- Archivo: `.github/workflows/…`

## Infraestructura y secretos

- Configuración / IaC: `<archivo>`
- Secretos: <gestor>
- Base de datos / caché: <servicio>, backups <frecuencia, retención>

## Lanzamiento seguro

- Estrategia: rolling / blue-green / canario — rollback automático: <cómo>
- Migraciones: expand/contract en <paso pre-deploy>

## Operación

- SLO: <disponibilidad>, <latencia p95>
- Observabilidad: <trazas, métricas, logs, uptime externo>
- Alertas: <burn-rate, errores, coste>
- Dominio y TLS: <dominio>, <certificado>

## Checklist de producción

<!-- Los 14 puntos de reference/deploy-catalog.md: planificado (cómo) o "No aplica: <motivo>". En Ship se añade la evidencia. -->

| # | Área | Plan | Evidencia (Ship) |
|---|---|---|---|
| 1 | Configuración | | |
| 2 | Identidad CI | | |
| 3 | Health checks | | |
| 4 | Lanzamiento seguro | | |
| 5 | SLOs | | |
| 6 | Observabilidad | | |
| 7 | Seguridad | | |
| 8 | Datos y backups | | |
| 9 | Fiabilidad | | |
| 10 | Rendimiento | | |
| 11 | Coste | | |
| 12 | Operación | | |
| 13 | Post-deploy | | |
| 14 | Dominio | | |
