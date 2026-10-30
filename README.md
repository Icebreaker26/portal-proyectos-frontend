# Portal de Proyectos UCP — Frontend

SPA (React 18 + Vite) del Portal de Proyectos de la Universidad Católica de Pereira.
Proyecto final de Cloud Computing — Alejandro Marín, Martin Salazar, Alejandro Jaramillo.

## Stack

React 18 + Vite · Docker + nginx (producción)

## Puertos (no genéricos — la máquina de pruebas ya tiene ocupados los estándar)

| Modo | Puerto |
|---|---|
| Vite dev server | `39173` |
| nginx (build de producción) | `39080` |

> `58xxx` se descartó: Windows/Hyper-V reserva dinámicamente rangos de puertos (`netsh interface ipv4
> show excludedportrange protocol=tcp`) que en esta máquina cubrían justo `58065–58264`. Si `39xxx`
> vuelve a chocar en otra máquina, revisa esos rangos antes de elegir un reemplazo.

## Levantar en local

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:39173
```

## Flujo de trabajo (Git flow)

- `main`: estable / releases.
- `develop`: integración — rama por defecto para PRs.
- `feature/<nombre>`: una por cada issue, contra `develop`.
- Commits: Conventional Commits simple (`feat:`, `fix:`, `chore:`, `docs:`).
- Sin protección de rama por ahora.

## Documentación de ingeniería

Documentación de requisitos, diseño, pruebas y ADRs vive en el repo [`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend/tree/develop/docs) (`docs/`), por ser el punto único de verdad del proyecto.

## Para un agente/colaborador nuevo

Antes de tocar código, lee [`AGENTS.md`](AGENTS.md) (convenciones de este repo) y los [issues abiertos del milestone Fase 1](https://github.com/Icebreaker26/portal-proyectos-frontend/milestones) para ver qué falta.
