import { Component } from 'react';
import FallbackEstatico from './FallbackEstatico.jsx';

// Si WebGL no está disponible o la escena 3D lanza cualquier error, la landing no debe romperse
// — se cae al fondo degradado estático en vez de una pantalla en blanco.
export default class LimiteErrorEscena extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error) {
    console.error('Hero 3D de /landing no se pudo renderizar, usando fallback estático.', error);
  }

  render() {
    if (this.state.fallo) return <FallbackEstatico />;
    return this.props.children;
  }
}
