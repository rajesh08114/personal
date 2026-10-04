import type { Transition, Variants } from 'motion/react';

/** Shared motion tokens — one vocabulary for timing across the product. */
export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  soft: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const DURATION = { fast: 0.2, base: 0.45, slow: 0.8, cinematic: 1.4 };

export const SPRING: Record<'gentle' | 'snappy' | 'bouncy', Transition> = {
  gentle: { type: 'spring', stiffness: 120, damping: 20 },
  snappy: { type: 'spring', stiffness: 380, damping: 30 },
  bouncy: { type: 'spring', stiffness: 260, damping: 14 },
};

export type RevealKind = 'fade' | 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur';

export const revealVariants: Record<RevealKind, Variants> = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  up: { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -36 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -48 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 48 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: 'blur(14px)', y: 12 }, show: { opacity: 1, filter: 'blur(0px)', y: 0 } },
};

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
