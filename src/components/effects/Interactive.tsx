import type { ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

/** Card that tilts in 3D toward the pointer (fine pointers only). */
export function TiltCard({
  children,
  className,
  max = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const glareBg = useTransform(
    [px, py],
    ([x, y]: number[]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / 0.22), transparent 55%)`,
  );
  const active = fine && !reduced;

  return (
    <motion.div
      className={cn('group/tilt relative [transform-style:preserve-3d]', className)}
      style={active ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={(e) => {
        if (!active) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      {active && glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}
