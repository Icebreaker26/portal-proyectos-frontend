// Se usa mientras carga el chunk de three.js, si WebGL no está disponible, o si algo dentro
// del Canvas lanza un error: nunca debe verse una landing rota.
export default function FallbackEstatico() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full bg-gradient-to-br from-ucp-granate/10 via-white to-ucp-verde/10"
    />
  );
}
