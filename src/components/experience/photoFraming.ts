import { createContext, useContext, type CSSProperties } from 'react';
import type { BirthdayConfig, PhotoFraming } from '@/types/birthday';

export const DEFAULT_FRAMING: PhotoFraming = { fit: 'cover', position: { x: 50, y: 50 }, zoom: 1 };

/**
 * CSS for a framed photo. The focal point drives both object-position and the
 * transform origin, so zooming always closes in on the part of the photo the
 * creator chose — whatever shape of frame a template uses.
 */
export function framingStyle(framing?: PhotoFraming): CSSProperties | undefined {
  if (!framing) return undefined;
  const { x, y } = framing.position;
  const r = framing.rotation ?? 0;
  // A straightened photo needs a little extra scale so its corners don't show inside a 'cover' frame.
  const rad = (Math.abs(r) * Math.PI) / 180;
  const cover = framing.fit === 'cover' && r ? Math.cos(rad) + Math.sin(rad) * 1.5 : 1;
  const scale = framing.zoom * cover;
  return {
    objectFit: framing.fit,
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    transform: scale !== 1 || r ? `scale(${scale.toFixed(4)}) rotate(${r}deg)` : undefined,
  };
}

/** Maps every photo URL in the config to its framing, so <PhotoSlot> can find it by src alone. */
export function buildFramingMap(config: BirthdayConfig): Map<string, PhotoFraming> {
  const map = new Map<string, PhotoFraming>();
  const add = (src?: string, f?: PhotoFraming) => {
    if (src && f && !map.has(src)) map.set(src, f);
  };
  add(config.heroImage, config.heroFraming);
  add(config.finalImage, config.finalFraming);
  for (const m of config.memories) add(m.image, m.framing);
  for (const t of config.timeline) add(t.image, t.framing);
  return map;
}

export const FramingContext = createContext<Map<string, PhotoFraming> | null>(null);

export function useFraming(src?: string): PhotoFraming | undefined {
  const map = useContext(FramingContext);
  return src ? map?.get(src) : undefined;
}
