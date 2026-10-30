# AGENTS.md — Frontend Portal de Proyectos UCP

Convenciones de este repo para cualquier agente o colaborador nuevo. Autocontenido: no asume acceso
a ningún otro proyecto ni configuración externa. Si algo aquí entra en conflicto con el código, el
código manda — abre un issue señalando la diferencia.

## Qué es este proyecto

SPA (React 18 + Vite) del Portal de Proyectos UCP. Consume la API del repo
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend)
(repo separado — clónalo aparte si necesitas correr el stack completo).

## Estado actual (ver también los issues del milestone "Fase 1")

**Verificado funcionando** (`npm install`, `npm run dev`, `docker compose up -d --build`, probado en
navegador real contra el backend levantado en local): `apiService.js`, `AuthContext` +
`ProtectedRoute`/`PublicOnlyRoute`/`AdminRoute`, páginas `Landing`/`Login`/`Registro`/`NotFound`, y
el flujo completo registro → sesión → `/proyectos`.

**Identidad visual definida y aplicada** (ADR 0007 en el repo backend): navbar con franja
institucional segmentada (granate/verde/dorado), layout centrado, paleta UCP en
`tailwind.config.js` (`ucp.granate`/`ucp.verde`/`ucp.dorado`/`ucp.rojo`), tablas `shadow-sm` +
`thead bg-slate-50`, animaciones Framer Motion discretas. Todo responsive (navbar colapsa a
hamburguesa bajo `md`, tablas con `overflow-x-auto`).

**Flujo de proyectos completo**: `ListadoPublico.jsx` (`/proyectos/pub`, público, con `VotoBoton`
por fila) y `ListadoProyectos.jsx` (`/proyectos`, autenticado, `GET /api/proyectos` con las reglas
de visibilidad del backend — ojo, es un componente distinto a `ListadoPublico`, no lo confundas).
`NuevoProyecto.jsx` (`/proyectos/nuevo`) crea proyectos. `ListadoProyectos.jsx` también trae la
columna de acciones Aprobar/Rechazar (`PUT /api/proyectos/:id/estado`), visible solo para
profesor/admin. `VotoBoton.jsx` (`src/modules/votos/`) maneja votar/retirar voto — el "ya voté" es
optimista por sesión del navegador, el backend no expone ese estado (ver comentario en el archivo).
`PanelUsuarios.jsx` (`/admin/usuarios`, admin-only vía `AdminRoute`) promueve/devuelve estudiante↔
profesor.

**Bugs reales encontrados y corregidos en esta sesión (no los reintroduzcas):**
- El interceptor 401/403 de `apiService` redirigía a `/landing` también en un 403 (sesión válida,
  falta un permiso puntual). Si `/landing` manda a un usuario autenticado de vuelta a una ruta que
  le da 403 (`PublicOnlyRoute` hace esto), la recarga completa a `/landing` repite el ciclo — bucle
  infinito reproducido en vivo (cientos de requests, rate limiter agotado). Ahora solo 401 fuerza el
  redirect; un 403 lo maneja el componente que hizo la llamada.
- `docker-compose.yml` no estaba en la misma red que el backend (proyectos Compose separados — ver
  ADR 0001 en el backend), así que `nginx.conf` no podía resolver `backend:48500`. Se une a la red
  real `portal-proyectos-backend_portal_net` (requiere que el backend esté levantado primero).
- `nginx.conf` resolvía `backend` una sola vez al arrancar: si el backend no estaba listo en ese
  instante, nginx moría con "host not found in upstream" y no se recuperaba solo. Ahora usa el
  resolver embebido de Docker (127.0.0.11) + `proxy_pass` con variable para resolver en cada
  petición — el frontend sigue arriba (502 en `/api`, 200 en el resto) aunque el backend esté caído,
  y se recupera sin reiniciar en cuanto vuelve.

**Pendiente:**
1. Deploy en Railway (issue #10) — no iniciado, en pausa (ver AGENTS.md del backend).
2. `tests/integration/auth.test.js` equivalente en el backend ya existe; este repo no tiene tests
   automatizados propios todavía (no hay issue abierto para esto — considerar si hace falta antes de
   crecer más el frontend).

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
