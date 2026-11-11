# Portal de Proyectos UCP — Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r169-000000?logo=three.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-desplegado-0B0D0E?logo=railway&logoColor=white)

SPA (React 18 + Vite) del Portal de Proyectos de la Universidad Católica de Pereira. Proyecto
final de Cloud Computing — Alejandro Marín, Martín Salazar, Alejandro Jaramillo.

## En vivo

| | |
|---|---|
| **Sitio** | https://frontend-production-bf16ffea.up.railway.app |
| Vitrina pública | https://frontend-production-bf16ffea.up.railway.app/proyectos/pub |
| API (repo aparte) | [`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend) |

Desplegado en [Railway](https://railway.app) (fase de pruebas) como contenedor nginx, con
auto-deploy desde `main`.

## Stack

React 18 + Vite · Tailwind CSS · Framer Motion · react-three-fiber/Three.js (hero 3D) ·
Docker + nginx (producción)

## Qué hay en esta SPA

- **Landing** (`/landing`) con hero 3D propio (`react-three-fiber`), diagrama de arquitectura y
  resultados del proyecto.
- **Vitrina pública** (`/proyectos/pub`, sin sesión) y **dashboard privado** (`/proyectos`, con
  sesión), cada una con su propio hero 3D (`src/components/landing3d/`).
- Flujo completo de proyectos: crear, subir archivos, votar, aprobar/rechazar con historial,
  consentimiento de coautores, panel de administración de usuarios.
- Componentes de UI compartidos (`src/components/`): animaciones en cascada, tarjetas, skeletons,
  estados vacíos — ver [`AGENTS.md`](AGENTS.md) para el detalle de cada uno.

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

Necesita el backend corriendo aparte — ver
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend).

## Flujo de trabajo (Git flow)

- `main`: estable / releases.
- `develop`: integración — rama por defecto para PRs.
- `feature/<nombre>` / `fix/<nombre>`: una por cada issue o corrección, contra `develop`.
- Commits: Conventional Commits simple (`feat:`, `fix:`, `chore:`, `docs:`).
- Sin protección de rama por ahora.

## Documentación de ingeniería

Documentación de requisitos, diseño, pruebas y ADRs vive en el repo
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend/tree/develop/docs)
(`docs/`), por ser el punto único de verdad del proyecto.

## Para un agente/colaborador nuevo

Antes de tocar código, lee [`AGENTS.md`](AGENTS.md) (convenciones de este repo) y los
[issues abiertos del milestone Fase 1](https://github.com/Icebreaker26/portal-proyectos-frontend/milestones)
para ver qué falta.
