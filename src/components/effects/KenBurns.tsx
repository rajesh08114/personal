import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

const PATHS = [
  { x: ['0%', '-3%'], y: ['0%', '-2%'], scale: [1.04, 1.14] },
  { x: ['-2%', '2%'], y: ['-1%', '1.5%'], scale: [1.12, 1.03] },
  { x: ['2%', '-1%'], y: ['1%', '-2%'], scale: [1.05, 1.15] },
];

/**
 * A slow documentary-style pan and zoom over a still photo (the "Ken Burns" move).
 * Transform-only and mirrored, so it loops seamlessly; Motion's reduced-motion setting freezes it.
 * The wrapper oversizes slightly so the frame edge never shows while panning.
 */
export function KenBurns({ children, seed = 0, duration = 22, className }: { children: ReactNode; seed?: number; duration?: number; className?: string }) {
  const path = PATHS[seed % PATHS.length];
  return (
    <motion.div
      className={cn('h-full w-full will-change-transform', className)}
      initial={{ x: path.x[0], y: path.y[0], scale: path.scale[0] }}
      animate={{ x: path.x[1], y: path.y[1], scale: path.scale[1] }}
      transition={{ duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
    >
      {children}
    </motion.div>
  );
}
