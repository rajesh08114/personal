import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './useMediaQuery';

/** Types text out character by character once `active` becomes true. */
export function useTypewriter(text: string, active: boolean, speedMs = 28): { output: string; done: boolean } {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || reduced) return;
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += text.length > 400 ? 3 : 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, active, speedMs, reduced]);

  if (reduced) return { output: active ? text : '', done: active };
  const shown = Math.min(count, text.length);
  return { output: text.slice(0, shown), done: active && shown >= text.length };
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

/** "Decrypts" text: random glyphs resolve into the real characters left to right. */
export function useScramble(text: string, active: boolean, durationMs = 1200): string {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(() => (active ? '' : text.replace(/\S/g, '·')));

  useEffect(() => {
    if (reduced) return;
    if (!active) {
      setOut(text.replace(/\S/g, '·'));
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const resolved = Math.floor(p * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += i < resolved || ch === ' ' || ch === '\n' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, durationMs, reduced]);

  return reduced ? text : out;
}
