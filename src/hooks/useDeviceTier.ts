import { useSyncExternalStore } from 'react';

export type DeviceTier = 'low' | 'mid' | 'high';

function computeTier(): DeviceTier {
  if (typeof window === 'undefined') return 'mid';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 'low';
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 640;
  if (cores <= 4 || memory <= 2) return 'low';
  if (coarse || small || cores <= 6) return 'mid';
  return 'high';
}

let cached: DeviceTier | null = null;
const getTier = () => (cached ??= computeTier());

/** Rough device capability bucket used to scale particle counts and heavy effects. */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    () => () => {},
    getTier,
    () => 'mid',
  );
}

export const TIER_SCALE: Record<DeviceTier, number> = { low: 0.35, mid: 0.65, high: 1 };
