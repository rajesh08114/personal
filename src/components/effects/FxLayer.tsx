import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { BurstOptions, ConfettiOptions, FireworksOptions, FxEngine, RainOptions } from './fxEngine';
import { loadChunk } from '@/utils/lazyChunk';

export interface FxApi {
  confetti: (o?: ConfettiOptions) => void;
  cannons: (o?: Omit<ConfettiOptions, 'x' | 'y' | 'angle'>) => void;
  rain: (o?: RainOptions) => void;
  burst: (o: BurstOptions) => void;
  fireworks: (o?: FireworksOptions) => void;
  clear: () => void;
}

export const noopFx: FxApi = {
  confetti: () => {},
  cannons: () => {},
  rain: () => {},
  burst: () => {},
  fireworks: () => {},
  clear: () => {},
};

/** The particle engine is its own chunk: it is off the critical path and warmed up once the page is idle. */
const loadEngine = loadChunk(() => import('./fxEngine'));

type Call = (engine: FxEngine) => void;

/**
 * Full-viewport, click-through canvas that renders Confetti and Fireworks for the
 * whole experience. Templates trigger effects through `useExperience().fx`.
 */
export const FxLayer = forwardRef<FxApi, { scale: number; enabled: boolean }>(function FxLayer(
  { scale, enabled },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FxEngine | null>(null);
  const settings = useRef({ scale, enabled });
  const queue = useRef<Call[]>([]);
  const starting = useRef(false);
  const alive = useRef(true);

  const start = () => {
    if (starting.current) return;
    starting.current = true;
    void loadEngine()
      .then(({ FxEngine }) => {
        const canvas = canvasRef.current;
        if (!alive.current || !canvas || engineRef.current) return;
        const engine = new FxEngine(canvas);
        engine.scale = settings.current.scale;
        engine.enabled = settings.current.enabled;
        engineRef.current = engine;
        queue.current.splice(0).forEach((call) => call(engine));
      })
      .catch(() => {
        // No canvas support or offline: effects are decorative, so fail silently.
        queue.current = [];
      });
  };

  const run = (call: Call) => {
    if (engineRef.current) return call(engineRef.current);
    queue.current.push(call);
    start();
  };

  useEffect(() => {
    alive.current = true;
    const onResize = () => engineRef.current?.resize();
    window.addEventListener('resize', onResize);
    // Warm the engine up when the browser is idle so the first celebration has no delay.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => start());
    return () => {
      alive.current = false;
      cancelIdle(handle);
      window.removeEventListener('resize', onResize);
      engineRef.current?.destroy();
      engineRef.current = null;
      starting.current = false;
    };
  }, []);

  useEffect(() => {
    settings.current = { scale, enabled };
    if (!engineRef.current) return;
    engineRef.current.scale = scale;
    engineRef.current.enabled = enabled;
  }, [scale, enabled]);

  useImperativeHandle(
    ref,
    () => ({
      confetti: (o) => run((e) => e.confetti(o)),
      cannons: (o) => run((e) => e.cannons(o)),
      rain: (o) => run((e) => e.rain(o)),
      burst: (o) => run((e) => e.burst(o)),
      fireworks: (o) => run((e) => e.fireworks(o)),
      clear: () => {
        queue.current = [];
        engineRef.current?.clear();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />
  );
});
