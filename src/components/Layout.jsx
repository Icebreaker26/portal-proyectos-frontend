import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Layout general del portal (ver docs/adr/0007-identidad-visual-portal.md en el backend):
// navbar superior + contenido centrado + footer, sin sidebar (solo hay dos módulos de
// negocio). flex-col + flex-1 en <main> para que el footer quede pegado abajo aunque
// el contenido sea corto.
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
