import { useEffect } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';

/**
 * Smoothed pointer position across the viewport, from -1 to 1 on each axis.
 * Drive parallax layers with it via `useTransform`. Stays at 0 for touch-only devices
 * and under reduced motion, so nothing moves unless someone is pointing at it.
 */
export function usePointerParallax(): { x: MotionValue<number>; y: MotionValue<number> } {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 50, damping: 18, mass: 1 });
  const y = useSpring(rawY, { stiffness: 50, damping: 18, mass: 1 });

  useEffect(() => {
    if (!fine || reduced) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, reduced, rawX, rawY]);

  return { x, y };
}
