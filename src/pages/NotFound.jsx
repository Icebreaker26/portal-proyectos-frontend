import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Snake jugable en la 404 (issue #13). Adaptado del mismo patrón ya probado en
// kernel-frontend (src/pages/NotFound.jsx): canvas 2D plano + hooks de React, sin
// librería de juegos. Colores cambiados a la paleta institucional (ver ADR 0007 en el
// repo backend). El canvas se mantiene oscuro a propósito (pequeña consola retro),
// aunque el resto del portal es tema claro.
const COLS = 20;
const ROWS = 16;
const CELL = 20;
const TICK = 120;

const dir = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

const randFood = (snake) => {
  let pos;
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
  } while (snake.some(([x, y]) => x === pos[0] && y === pos[1]));
  return pos;
};

const initState = () => {
  const snake = [[10, 8], [9, 8], [8, 8]];
  return { snake, dir: dir.RIGHT, next: dir.RIGHT, food: randFood(snake), score: 0, dead: false };
};

const SnakeGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(initState());
  const tickRef = useRef(null);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { snake, food } = stateRef.current;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid sutil
    ctx.strokeStyle = '#0d1829';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    // Comida — dorado institucional
    const [fx, fy] = food;
    ctx.fillStyle = '#DBA630';
    ctx.shadowColor = '#DBA63099';
    ctx.shadowBlur = 8;
    ctx.fillRect(fx * CELL + 3, fy * CELL + 3, CELL - 6, CELL - 6);
    ctx.shadowBlur = 0;

    // Serpiente — cabeza verde institucional, cola se atenúa hacia granate
    snake.forEach(([x, y], i) => {
      const t = i / snake.length;
      ctx.fillStyle =
        i === 0 ? '#00804E' : `rgba(134, 25, 28, ${0.9 - t * 0.5})`;
      ctx.shadowColor = i === 0 ? '#00804E88' : 'transparent';
      ctx.shadowBlur = i === 0 ? 10 : 0;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      ctx.shadowBlur = 0;
    });
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;

    const [dx, dy] = s.next;
    const [hx, hy] = s.snake[0];
    const nx = hx + dx;
    const ny = hy + dy;

    // Colisión pared o cuerpo
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || s.snake.some(([x, y]) => x === nx && y === ny)) {
      stateRef.current = { ...s, dead: true };
      setDead(true);
      draw();
      return;
    }

    const comio = nx === s.food[0] && ny === s.food[1];
    const nuevaSerpiente = [[nx, ny], ...s.snake];
    if (!comio) nuevaSerpiente.pop();

    const nuevoScore = comio ? s.score + 10 : s.score;
    stateRef.current = {
      ...s,
      snake: nuevaSerpiente,
      dir: s.next,
      food: comio ? randFood(nuevaSerpiente) : s.food,
      score: nuevoScore,
    };
    if (comio) setScore(nuevoScore);
    draw();
  }, [draw]);

  const restart = () => {
    stateRef.current = initState();
    setScore(0);
    setDead(false);
    setStarted(true);
    draw();
  };

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!started || dead) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(tick, TICK);
    return () => clearInterval(tickRef.current);
  }, [started, dead, tick]);

  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      const moves = {
        ArrowUp: dir.UP, w: dir.UP,
        ArrowDown: dir.DOWN, s: dir.DOWN,
        ArrowLeft: dir.LEFT, a: dir.LEFT,
        ArrowRight: dir.RIGHT, d: dir.RIGHT,
      };
      const next = moves[e.key];
      if (!next) return;
      // No permitir reversa — se compara contra la última dirección YA ENCOLADA
      // (stateRef.current.next), no la última aplicada en pantalla (s.dir): dos giros
      // rápidos entre ticks no deben poder colarse como reversa válida.
      const actual = stateRef.current.next;
      if (next[0] === -actual[0] && next[1] === -actual[1]) return;
      stateRef.current = { ...stateRef.current, next };
      if (!started) setStarted(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started]);

  const moverA = (nuevaDir) => {
    const actual = stateRef.current.next;
    if (nuevaDir[0] === -actual[0] && nuevaDir[1] === -actual[1]) return;
    stateRef.current = { ...stateRef.current, next: nuevaDir };
    if (!started) setStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between" style={{ width: COLS * CELL }}>
        <p className="text-[9px] tracking-[3px] text-slate-400">SNAKE · SECTOR 404</p>
        <p className="text-[10px] font-bold tracking-wider text-ucp-dorado">
          {String(score).padStart(4, '0')}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />

        {!started && !dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617cc]">
            <p className="mb-2 text-[10px] tracking-[3px] text-ucp-verde">PRESIONA ← ↑ → ↓</p>
            <p className="text-[9px] tracking-wider text-slate-400">O WASD PARA EMPEZAR</p>
          </div>
        )}

        {dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617cc]">
            <p className="mb-1 text-sm font-bold tracking-[4px] text-ucp-rojo">GAME OVER</p>
            <p className="mb-4 text-[9px] tracking-wider text-slate-400">SCORE: {score}</p>
            <button
              type="button"
              onClick={restart}
              className="border border-ucp-verde/40 px-4 py-1.5 text-[9px] tracking-[2px] text-ucp-verde transition-all hover:border-ucp-verde hover:bg-ucp-verde/10"
            >
              REINICIAR
            </button>
          </div>
        )}
      </div>

      <div className="mt-1 flex flex-col items-center gap-1">
        <button
          type="button"
          onPointerDown={() => moverA(dir.UP)}
          className="flex h-9 w-9 select-none items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600"
        >
          ▲
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            onPointerDown={() => moverA(dir.LEFT)}
            className="flex h-9 w-9 select-none items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600"
          >
            ◄
          </button>
          <button
            type="button"
            onPointerDown={() => moverA(dir.DOWN)}
            className="flex h-9 w-9 select-none items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600"
          >
            ▼
          </button>
          <button
            type="button"
            onPointerDown={() => moverA(dir.RIGHT)}
            className="flex h-9 w-9 select-none items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600"
          >
            ►
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-lg border border-slate-200 px-6 py-2 text-xs tracking-[2px] text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700"
      >
        ← VOLVER
      </button>
    </div>
  );
};

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FA] px-4 font-sans"
    >
      <p className="mb-1 text-6xl font-bold text-slate-300">404</p>
      <p className="mb-8 text-xs tracking-[3px] text-slate-400">PÁGINA NO ENCONTRADA</p>
      <SnakeGame onClose={() => navigate(-1)} />
    </motion.div>
  );
}
