# AGENTS.md — Frontend Portal de Proyectos UCP

Convenciones de este repo para cualquier agente o colaborador nuevo. Autocontenido: no asume acceso
a ningún otro proyecto ni configuración externa. Si algo aquí entra en conflicto con el código, el
código manda — abre un issue señalando la diferencia.

## Qué es este proyecto

SPA (React 18 + Vite) del Portal de Proyectos UCP. Consume la API del repo
[`portal-proyectos-backend`](https://github.com/Icebreaker26/portal-proyectos-backend)
(repo separado — clónalo aparte si necesitas correr el stack completo).

## Estado actual (ver también los issues del milestone "Fase 1")

**Verificado funcionando** (`npm install`, `npm run dev`, probado en navegador real contra el backend
levantado en local): `apiService.js`, `AuthContext` + `ProtectedRoute`/`PublicOnlyRoute`, páginas
`Landing`/`Login`/`Registro`/`NotFound`, y el flujo completo registro → sesión → `/proyectos`.
`ListadoPublico.jsx` consume `/api/proyectos/pub` y renderiza, pero **sin estilos** (ver más abajo).

**Bug ya corregido** (no lo reintroduzcas): el interceptor 401/403 de `apiService` redirigía a
`/landing` incluso cuando `/auth/me` devuelve 401 por ser un visitante normal sin sesión, causando un
bucle infinito de recargas en `/landing`/`/login`. La condición `esChequeoDeSesion` en
`apiService.js` existe para evitar exactamente eso — no la quites sin entender por qué está.

**No verificado / pendiente — empieza aquí:**
1. **Panel estudiante: formulario para crear proyecto** — el backend ya expone `POST /api/proyectos`
   y funciona (probado por curl), pero no hay ningún formulario en el frontend todavía. Es el hueco
   más grande del flujo completo ahora mismo.
2. **Panel profesor: aprobar/rechazar** — backend expone `PUT /api/proyectos/:id/estado` protegido
   con la acción `APROBAR`; falta la UI.
3. **UI de votos** — backend listo (`/api/votos`), sin UI.
4. **`docker compose up` del servicio `frontend`** — nunca se construyó la imagen (build Vite + nginx),
   solo se probó `npm run dev`.
5. **Layout/Navbar del módulo proyectos** — no existe, `ListadoPublico.jsx` se renderiza sin ningún
   layout propio.
6. **Identidad visual** (issue "Definir estética/identidad visual del proyecto") — **no se usa ningún
   estilo heredado de otro proyecto**, este repo define el suyo desde cero. Bloquea que los paneles
   de arriba se vean terminados, pero no bloquea construirlos funcionalmente primero.

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
