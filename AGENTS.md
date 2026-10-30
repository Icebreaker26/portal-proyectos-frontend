# AGENTS.md — Frontend Portal de Proyectos UCP

Convenciones de este repo para cualquier agente o colaborador nuevo. Autocontenido: no asume acceso
a ningún otro proyecto ni configuración externa. Si algo aquí entra en conflicto con el código, el
código manda — abre un issue señalando la diferencia.

## Qué es este proyecto

SPA (React 18 + Vite) del Portal de Proyectos UCP. Consume la API del repo
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend)
(repo separado — clónalo aparte si necesitas correr el stack completo).

## Estado actual (ver también los issues del milestone "Fase 1")

El scaffolding base **ya existe** en `develop`:
- `apiService.js` (Axios configurado).
- `AuthContext` + `ProtectedRoute`/`PublicOnlyRoute`.
- Páginas globales mínimas: `Landing`, `Login`, `Registro` (restringido a `@ucp.edu.co`, ver ADR 0006
  en el repo backend), `NotFound`.
- Módulo `proyectos`: solo `ListadoPublico.jsx`, funcional pero **sin estilos** (ver más abajo).
- `Dockerfile` + `nginx.conf` + `docker-compose.yml`.

**No se ha corrido** `npm install` ni `npm run dev`/`build` todavía — nadie ha verificado que la app
levante de punta a punta. Verifícalo antes de asumir que algo "ya funciona".

Faltan por completo: panel estudiante (subir proyecto), panel profesor (aprobar/rechazar), UI de
votos, y la identidad visual del proyecto (ver issue "Definir estética/identidad visual del proyecto"
— **no se usa ningún estilo heredado de otro proyecto**, este repo define el suyo desde cero).

Cada issue abierto trae un comentario indicando qué parte de su alcance está hecha y qué falta.

## Reglas críticas (no romper)

1. **Toda llamada HTTP pasa por `src/services/apiService.js`**. Nunca `fetch` ni una instancia de
   Axios distinta — el backend exige el header `X-Requested-With` en mutaciones (CSRF) y `apiService`
   ya lo manda.
2. Sesión vía cookie HttpOnly (`withCredentials: true` en `apiService`); no guardes el JWT en
   `localStorage`/`sessionStorage`.
3. Rutas privadas siempre envueltas en `<ProtectedRoute>`; rutas de solo-invitado en `<PublicOnlyRoute>`.
   `path="*"` (`NotFound`) va al final de `App.jsx`, fuera de cualquier layout.
4. Variables de entorno nuevas → prefijo `VITE_` y agregarlas a `.env.example`.
5. Un módulo de negocio nuevo sigue el patrón `src/modules/<nombre>/{components,pages}`.

## Flujo de trabajo

- Ramas: `main` (estable), `develop` (integración, default), `feature/<nombre>` contra `develop`.
- Una rama por issue. PR a `develop` usando la plantilla (`.github/PULL_REQUEST_TEMPLATE.md`).
- Commits: Conventional Commits simple (`feat:`, `fix:`, `chore:`, `docs:`).
- **Ningún commit ni PR de este repo lleva línea de coautoría de ninguna IA/asistente** (sin
  `Co-Authored-By` de Claude, ChatGPT, Copilot, etc.). Usa la identidad Git normal del autor humano.

## Puertos (no genéricos — ver ADR 0004 en el repo backend)

Vite dev server `39173`, nginx (build de producción) `39080`. Si vuelven a chocar en otra máquina,
revisa primero `netsh interface ipv4 show excludedportrange protocol=tcp` (en Windows, Hyper-V
reserva rangos dinámicos que pueden tapar un puerto "libre" con `EACCES`) antes de elegir otro.

## Dónde mirar antes de preguntar

- Requisitos, diseño y decisiones de arquitectura: `docs/` en
  [`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend/tree/develop/docs)
  (punto único de verdad para ambos repos).
- Backlog y prioridad: [Issues](https://github.com/Icebreaker26/portal-proyectos-frontend/issues) +
  [Project board](https://github.com/users/Icebreaker26/projects/2).
