import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import apiService from '../../../services/apiService.js';
import TagInput from '../components/TagInput.jsx';
import ArchivosProyecto from '../components/ArchivosProyecto.jsx';

const inputClase =
  'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde';

const TIPOS_PROYECTO = [
  { value: '', label: 'Sin definir' },
  { value: 'investigacion', label: 'Investigación' },
  { value: 'aplicativo', label: 'Aplicativo' },
  { value: 'trabajo_de_grado', label: 'Trabajo de grado' },
  { value: 'otro', label: 'Otro' },
];

const VISIBILIDADES = [
  { value: 'publico', label: 'Público — cualquier visitante lo ve aprobado' },
  { value: 'comunidad', label: 'Comunidad — solo usuarios con sesión' },
  { value: 'privado', label: 'Privado — solo autor, participantes y profesores' },
];

const campoVacio = { nombreLibre: '', rol: 'desarrollo', aporte: '' };

// Backend valida lo mismo en crearSchema (proyectosSchema.js). Campos extendidos del
// ADR 0008.
export default function NuevoProyecto() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [repositorioUrl, setRepositorioUrl] = useState('');
  const [programa, setPrograma] = useState('');
  const [asignatura, setAsignatura] = useState('');
  const [semestre, setSemestre] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [resumen, setResumen] = useState('');
  const [imagenPortadaUrl, setImagenPortadaUrl] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [stack, setStack] = useState([]);
  const [palabrasClave, setPalabrasClave] = useState([]);
  const [videoDemoUrl, setVideoDemoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [visibilidad, setVisibilidad] = useState('publico');
  const [licencia, setLicencia] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [profesorUuid, setProfesorUuid] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [coautoresCuenta, setCoautoresCuenta] = useState([]);
  const [emailBusqueda, setEmailBusqueda] = useState('');
  const [buscandoCoautor, setBuscandoCoautor] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [proyectoCreado, setProyectoCreado] = useState(null);

  useEffect(() => {
    apiService.get('/usuarios/profesores').then(({ data }) => setProfesores(data));
  }, []);

  const agregarParticipante = () => setParticipantes((prev) => [...prev, { ...campoVacio }]);
  const quitarParticipante = (i) => setParticipantes((prev) => prev.filter((_, idx) => idx !== i));
  const actualizarParticipante = (i, campo, valor) =>
    setParticipantes((prev) => prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));

  const quitarCoautorCuenta = (i) => setCoautoresCuenta((prev) => prev.filter((_, idx) => idx !== i));
  const actualizarCoautorCuenta = (i, campo, valor) =>
    setCoautoresCuenta((prev) => prev.map((c, idx) => (idx === i ? { ...c, [campo]: valor } : c)));

  // Búsqueda por email EXACTO (el backend lo exige así) disparada al hacer click en "Buscar" o
  // Enter, nunca por cada letra escrita — GET /api/usuarios/buscar tiene rate limiter propio
  // (30/15min/IP). No es un <form> anidado: el formulario principal ya envuelve toda la página.
  const buscarCoautor = async () => {
    const email = emailBusqueda.trim().toLowerCase();
    if (!email) return;
    if (coautoresCuenta.some((c) => c.email === email)) {
      toast.error('Ese coautor ya está en la lista');
      return;
    }
    setBuscandoCoautor(true);
    try {
      const { data } = await apiService.get('/usuarios/buscar', { params: { email } });
      setCoautoresCuenta((prev) => [...prev, { usuarioUuid: data.id, nombre: data.nombre, email: data.email, rol: 'desarrollo', aporte: '' }]);
      setEmailBusqueda('');
      toast.success(`${data.nombre} agregado como coautor`);
    } catch (err) {
      if (err.response?.status === 404) toast.error('No se encontró una cuenta con ese email');
      else if (err.response?.status === 429) toast.error('Demasiados intentos — espera unos minutos e inténtalo de nuevo');
      else toast.error(err.response?.data?.error || 'No se pudo buscar el usuario');
    } finally {
      setBuscandoCoautor(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { data } = await apiService.post('/proyectos', {
        titulo,
        descripcion,
        repositorio_url: repositorioUrl || undefined,
        programa: programa || undefined,
        asignatura: asignatura || undefined,
        semestre: semestre || undefined,
        tipo_proyecto: tipoProyecto || undefined,
        profesor_uuid: profesorUuid || undefined,
        resumen: resumen || undefined,
        imagen_portada_url: imagenPortadaUrl || undefined,
        cuerpo: cuerpo || undefined,
        stack,
        palabras_clave: palabrasClave,
        video_demo_url: videoDemoUrl || undefined,
        demo_url: demoUrl || undefined,
        visibilidad,
        licencia: licencia || undefined,
        participantes: [
          ...participantes
            .filter((p) => p.nombreLibre.trim())
            .map((p) => ({ nombre_libre: p.nombreLibre.trim(), rol: p.rol, aporte: p.aporte || undefined })),
          ...coautoresCuenta.map((c) => ({ usuario_uuid: c.usuarioUuid, rol: c.rol, aporte: c.aporte || undefined })),
        ].map((p, i) => ({ ...p, orden_autoria: i + 2 })),
      });
      toast.success('Proyecto enviado — queda pendiente de aprobación');
      setProyectoCreado(data);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo crear el proyecto';
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  // Tras crear, se ofrece subir archivos (necesitan el id del proyecto) antes de volver
  // al listado -- ver ArchivosProyecto.jsx.
  if (proyectoCreado) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold text-slate-800">¡Proyecto enviado!</h1>
        <p className="mt-1 text-sm text-slate-500">
          "{proyectoCreado.titulo}" queda pendiente de aprobación. Puedes subir archivos ahora o hacerlo después.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <ArchivosProyecto proyectoId={proyectoCreado.id} />
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            to="/proyectos"
            className="rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90"
          >
            Listo, ir a mis proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-800">Nuevo proyecto</h1>
      <p className="mt-1 text-sm text-slate-500">
        Queda en estado "pendiente" hasta que un profesor lo apruebe.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <section className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-xs font-medium text-slate-600">Título</label>
            <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required className={inputClase} />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-xs font-medium text-slate-600">Descripción</label>
            <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows={3} className={inputClase} />
          </div>

          <div>
            <label htmlFor="resumen" className="block text-xs font-medium text-slate-600">
              Resumen corto ({resumen.length}/300)
            </label>
            <textarea
              id="resumen"
              value={resumen}
              onChange={(e) => setResumen(e.target.value.slice(0, 300))}
              rows={2}
              placeholder="Para tarjetas del listado y al compartir en redes"
              className={inputClase}
            />
          </div>

          <div>
            <label htmlFor="cuerpo" className="block text-xs font-medium text-slate-600">
              Cuerpo del proyecto (Markdown, opcional)
            </label>
            <textarea
              id="cuerpo"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={6}
              placeholder="## Título&#10;Texto con **negrita**, listas, enlaces..."
              className={`${inputClase} font-mono`}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div>
            <label htmlFor="programa" className="block text-xs font-medium text-slate-600">Programa</label>
            <input id="programa" value={programa} onChange={(e) => setPrograma(e.target.value)} className={inputClase} />
          </div>
          <div>
            <label htmlFor="asignatura" className="block text-xs font-medium text-slate-600">Asignatura</label>
            <input id="asignatura" value={asignatura} onChange={(e) => setAsignatura(e.target.value)} className={inputClase} />
          </div>
          <div>
            <label htmlFor="semestre" className="block text-xs font-medium text-slate-600">Semestre</label>
            <input id="semestre" value={semestre} onChange={(e) => setSemestre(e.target.value)} placeholder="2026-1" className={inputClase} />
          </div>
          <div>
            <label htmlFor="tipo" className="block text-xs font-medium text-slate-600">Tipo de proyecto</label>
            <select id="tipo" value={tipoProyecto} onChange={(e) => setTipoProyecto(e.target.value)} className={inputClase}>
              {TIPOS_PROYECTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profesor" className="block text-xs font-medium text-slate-600">Profesor</label>
            <select id="profesor" value={profesorUuid} onChange={(e) => setProfesorUuid(e.target.value)} className={inputClase}>
              <option value="">Sin profesor asignado</option>
              {profesores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} — {p.email}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Tecnologías / stack</label>
            <TagInput value={stack} onChange={setStack} placeholder="React, Node.js… (Enter para agregar)" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Palabras clave</label>
            <TagInput value={palabrasClave} onChange={setPalabrasClave} placeholder="iot, educacion… (Enter para agregar)" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <label htmlFor="repositorio" className="block text-xs font-medium text-slate-600">Repositorio</label>
            <input id="repositorio" type="url" value={repositorioUrl} onChange={(e) => setRepositorioUrl(e.target.value)} placeholder="https://github.com/usuario/proyecto" className={inputClase} />
          </div>
          <div>
            <label htmlFor="imagenPortada" className="block text-xs font-medium text-slate-600">Imagen de portada (URL)</label>
            <input id="imagenPortada" type="url" value={imagenPortadaUrl} onChange={(e) => setImagenPortadaUrl(e.target.value)} placeholder="https://…" className={inputClase} />
          </div>
          <div>
            <label htmlFor="videoDemo" className="block text-xs font-medium text-slate-600">Video demo (YouTube, etc.)</label>
            <input id="videoDemo" type="url" value={videoDemoUrl} onChange={(e) => setVideoDemoUrl(e.target.value)} className={inputClase} />
          </div>
          <div>
            <label htmlFor="demoUrl" className="block text-xs font-medium text-slate-600">Demo en vivo</label>
            <input id="demoUrl" type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={inputClase} />
          </div>
          <div>
            <label htmlFor="visibilidad" className="block text-xs font-medium text-slate-600">Visibilidad</label>
            <select id="visibilidad" value={visibilidad} onChange={(e) => setVisibilidad(e.target.value)} className={inputClase}>
              {VISIBILIDADES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="licencia" className="block text-xs font-medium text-slate-600">Licencia</label>
            <input id="licencia" value={licencia} onChange={(e) => setLicencia(e.target.value)} placeholder="MIT, CC-BY-4.0…" className={inputClase} />
          </div>
        </section>

        <section className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-medium text-slate-600">Coautor con cuenta en el portal</label>
          <p className="mt-1 text-xs text-slate-400">
            Busca por su email exacto (@ucp.edu.co). Deberá confirmar su consentimiento de
            publicación antes de que el proyecto pueda aprobarse.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="email"
              value={emailBusqueda}
              onChange={(e) => setEmailBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  buscarCoautor();
                }
              }}
              placeholder="nombre@ucp.edu.co"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-ucp-verde focus:outline-none focus:ring-1 focus:ring-ucp-verde"
            />
            <button
              type="button"
              onClick={buscarCoautor}
              disabled={buscandoCoautor}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
            >
              <Search size={14} /> {buscandoCoautor ? 'Buscando…' : 'Buscar'}
            </button>
          </div>

          {coautoresCuenta.map((c, i) => (
            <div key={c.usuarioUuid} className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2">
              <div className="min-w-[160px] flex-1 text-sm text-slate-700">
                {c.nombre} <span className="text-xs text-slate-400">({c.email})</span>
              </div>
              <select
                value={c.rol}
                onChange={(e) => actualizarCoautorCuenta(i, 'rol', e.target.value)}
                className="rounded border border-slate-200 px-2 py-1 text-sm"
              >
                <option value="lider">Líder</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="diseno">Diseño</option>
                <option value="investigacion">Investigación</option>
              </select>
              <button type="button" onClick={() => quitarCoautorCuenta(i)} className="text-xs text-ucp-rojo hover:underline">
                Quitar
              </button>
            </div>
          ))}
        </section>

        <section className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-600">
              Participantes adicionales (sin cuenta en el portal)
            </label>
            <button type="button" onClick={agregarParticipante} className="text-xs font-medium text-ucp-verde hover:underline">
              + Agregar
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Para quien no tiene cuenta propia en el portal.
          </p>

          {participantes.map((p, i) => (
            <div key={i} className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2">
              <input
                value={p.nombreLibre}
                onChange={(e) => actualizarParticipante(i, 'nombreLibre', e.target.value)}
                placeholder="Nombre completo"
                className="min-w-[160px] flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
              />
              <select
                value={p.rol}
                onChange={(e) => actualizarParticipante(i, 'rol', e.target.value)}
                className="rounded border border-slate-200 px-2 py-1 text-sm"
              >
                <option value="lider">Líder</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="diseno">Diseño</option>
                <option value="investigacion">Investigación</option>
              </select>
              <button type="button" onClick={() => quitarParticipante(i)} className="text-xs text-ucp-rojo hover:underline">
                Quitar
              </button>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to="/proyectos" className="text-sm text-slate-500 hover:text-slate-700">Cancelar</Link>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-ucp-verde px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ucp-verde/90 disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Enviar proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
