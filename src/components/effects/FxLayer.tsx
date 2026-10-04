import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { FxEngine, type BurstOptions, type ConfettiOptions, type FireworksOptions, type RainOptions } from './fxEngine';

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

/**
 * Full-viewport, click-through canvas that renders Confetti and Fireworks for the
 * whole experience. Templates trigger effects through `useExperience().fx`.
 */
export const FxLayer = forwardRef<FxApi, { scale: number; enabled: boolean }>(function FxLayer({ scale, enabled }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FxEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: FxEngine;
    try {
      engine = new FxEngine(canvas);
    } catch {
      return;
    }
    engineRef.current = engine;
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.scale = scale;
    engineRef.current.enabled = enabled;
  }, [scale, enabled]);

  useImperativeHandle(
    ref,
    () => ({
      confetti: (o) => engineRef.current?.confetti(o),
      cannons: (o) => engineRef.current?.cannons(o),
      rain: (o) => engineRef.current?.rain(o),
      burst: (o) => engineRef.current?.burst(o),
      fireworks: (o) => engineRef.current?.fireworks(o),
      clear: () => engineRef.current?.clear(),
    }),
    [],
  );

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
});
