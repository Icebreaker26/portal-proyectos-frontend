import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';

// Layout general del portal (ver docs/adr/0007-identidad-visual-portal.md en el backend):
// navbar superior + contenido centrado, sin sidebar (solo hay dos módulos de negocio).
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      >
        {children}
      </motion.main>
    </div>
  );
}
