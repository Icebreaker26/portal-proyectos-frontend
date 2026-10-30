# AGENTS.md — Frontend Portal de Proyectos UCP

Convenciones de este repo para cualquier agente o colaborador nuevo. Autocontenido: no asume acceso
a ningún otro proyecto ni configuración externa. Si algo aquí entra en conflicto con el código, el
código manda — abre un issue señalando la diferencia.

## Qué es este proyecto

SPA (React 18 + Vite) del Portal de Proyectos UCP. Consume la API del repo
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend)
(repo separado — clónalo aparte si necesitas correr el stack completo).

## Estado actual (última actualización: 2026-10-30)

**Verificado funcionando end-to-end** (`npm install`, `npm run dev`, `docker compose up -d
--build`, probado en navegador real contra el backend levantado en local):

- `apiService.js`, `AuthContext` + `ProtectedRoute`/`PublicOnlyRoute`/`AdminRoute`.
- **Identidad visual completa** (ADR 0007/0009 en el repo backend): navbar con franja
  institucional segmentada, paleta UCP en `tailwind.config.js`
  (`ucp.granate`/`ucp.verde`/`ucp.dorado`/`ucp.rojo`), footer, botón de cerrar sesión como ícono.
  `Landing`/`Login`/`Registro` con el kit visual (`AuthLayout.jsx`); `NotFound.jsx` tiene un Snake
  jugable con score en vez de un 404 estático. **Pendiente de aplicar**: skeleton loaders
  (ADR 0009) — hoy las vistas que cargan datos siguen mostrando `"Cargando…"` en texto plano,
  queda para cuando se rediseñen.
- **Flujo de proyectos con el modelo extendido** (ADR 0008 en el backend):
  - `ListadoPublico.jsx` (`/proyectos/pub`, público): tarjetas con portada/resumen/stack, no tabla.
  - `ListadoProyectos.jsx` (`/proyectos`, autenticado — **componente distinto** a `ListadoPublico`,
    no los confundas): tabla simple, **sin acciones** — cada título enlaza al expediente.
  - `ExpedienteProyecto.jsx` (`/proyectos/:id`, autenticado, consume el nuevo
    `GET /api/proyectos/:id` del backend): detalle completo con participantes, archivos e
    historial de revisiones. **Aprobar/rechazar vive solo aquí** — decisión explícita del autor:
    un profesor no debe poder aprobar/rechazar desde una fila de tabla sin ver el expediente
    completo primero. Al rechazar pide el motivo inline antes de confirmar.
  - `NuevoProyecto.jsx` (`/proyectos/nuevo`): formulario completo (programa, asignatura, semestre,
    tipo, resumen, cuerpo en Markdown, stack/palabras clave vía `TagInput.jsx`, repo, portada,
    video, demo, visibilidad, licencia, participantes sin cuenta). Tras crear, ofrece subir
    archivos (`ArchivosProyecto.jsx`).
  - `DetalleProyecto.jsx` (`/proyectos/pub/:id`, **público**, distinto de `ExpedienteProyecto.jsx`):
    cuerpo renderizado con `CuerpoMarkdown.jsx` (`marked` + `DOMPurify` — **nunca** quitar el
    sanitizado, el cuerpo es Markdown de usuario), participantes, video de YouTube embebido,
    archivos (descarga exige sesión), meta Open Graph. Solo muestra proyectos
    aprobado+público — para ver cualquier otro (propio, pendiente, privado) la ruta autenticada es
    `ExpedienteProyecto.jsx`.
  - `VotoBoton.jsx` (`src/modules/votos/`): votar/retirar, "ya voté" optimista por sesión del
    navegador (el backend no expone ese estado).
  - `PanelUsuarios.jsx` (`/admin/usuarios`, admin-only): promueve/devuelve estudiante↔profesor.

**Huecos conocidos, dejados a propósito** (ver comentario en `NuevoProyecto.jsx`, el cierre de
[frontend#14](https://github.com/Icebreaker26/portal-proyectos-frontend/issues/14), y
[backend#12](https://github.com/Icebreaker26/portal-proyectos-backend/issues/12)):
- No hay selector de "profesor" al crear un proyecto, ni búsqueda de coautor por cuenta — no existe
  un endpoint en el backend para listar profesores ni buscar usuarios por email sin ser admin. Los
  participantes adicionales se agregan como `nombre_libre` (sin cuenta) por ahora.
- No hay UI para que un participante con cuenta confirme su consentimiento de publicación (el
  endpoint `PUT /api/proyectos/:id/consentimiento` existe en el backend, pero no hay forma de
  saber desde el frontend "en qué proyectos debo confirmar" sin que `GET /api/proyectos` exponga
  participantes).

**Bugs reales encontrados y corregidos (no los reintroduzcas):**
- El interceptor 401/403 de `apiService` redirigía a `/landing` también en un 403 (sesión válida,
  falta un permiso puntual) → bucle infinito si `/landing` manda a un usuario autenticado de vuelta
  a una ruta que le da 403 (`PublicOnlyRoute` hace esto). Ahora solo 401 fuerza el redirect.
- `docker-compose.yml` no estaba en la misma red que el backend (proyectos Compose separados — ver
  ADR 0001 en el backend); se une a `portal-proyectos-backend_portal_net` (requiere el backend
  levantado primero).
- `nginx.conf` resolvía `backend` una sola vez al arrancar y moría si no estaba listo; ahora usa el
  resolver embebido de Docker (127.0.0.11) + `proxy_pass` con variable, se recupera solo.

**Pendiente:**
1. Deploy en Railway (issue #10) — no iniciado, en pausa (ver AGENTS.md del backend).
2. Este repo no tiene tests automatizados propios todavía (el backend sí, `npm test` ahí). No hay
   issue abierto para esto — considerar si hace falta antes de crecer más el frontend.
3. Skeleton loaders (ver arriba) cuando se rediseñen las vistas existentes.

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
