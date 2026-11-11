import { marked } from 'marked';
import DOMPurify from 'dompurify';

// El cuerpo del proyecto se escribe en Markdown, nunca HTML crudo (ADR 0008 -- riesgo
// XSS). Nunca quitar el DOMPurify.sanitize() de este flujo, aunque "ya venga de nuestro
// propio backend": otro autor pudo haber pegado HTML/script dentro del Markdown.
export default function CuerpoMarkdown({ texto }) {
  if (!texto) return null;
  const html = DOMPurify.sanitize(marked.parse(texto));
  return (
    <div
      className="prose prose-sm sm:prose-base prose-slate mt-5 max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-a:text-ucp-verde prose-img:rounded-lg prose-img:border prose-img:border-slate-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
