import { useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

interface MagneticButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  children: ReactNode;
  strength?: number;
  rippleColor?: string;
}

/** Button that leans toward the cursor and emits a ripple on press. */
export function MagneticButton({ children, className, strength = 0.35, rippleColor = 'rgb(255 255 255 / 0.45)', onClick, type = 'button', ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!fine || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = performance.now();
    setRipples((list) => [...list, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    window.setTimeout(() => setRipples((list) => list.filter((rp) => rp.id !== id)), 700);
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn('relative isolate overflow-hidden', className)}
      {...rest}
    >
      {children}
      {ripples.map((rp) => (
        <span
          key={rp.id}
          aria-hidden
          className="pointer-events-none absolute -z-10 size-8 animate-[ripple_0.7s_ease-out_forwards] rounded-full"
          style={{ left: rp.x - 16, top: rp.y - 16, background: rippleColor }}
        />
      ))}
    </motion.button>
  );
}

/** Thin reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className={cn(
        'fixed inset-x-0 top-0 z-[75] h-[3px] origin-left bg-[linear-gradient(90deg,var(--bd-primary),var(--bd-accent))]',
        className,
      )}
    />
  );
}

/** Soft light that follows a fine pointer. Hidden on touch devices and reduced motion. */
export function CursorGlow({ color = 'var(--bd-primary)', size = 420, className }: { color?: string; size?: number; className?: string }) {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const x = useSpring(-1000, { stiffness: 140, damping: 22 });
  const y = useSpring(-1000, { stiffness: 140, damping: 22 });

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX - size / 2);
      y.set(e.clientY - size / 2);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, reduced, size, x, y]);

  if (!fine || reduced) return null;
  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none fixed top-0 left-0 z-[1] rounded-full opacity-25 mix-blend-screen blur-3xl', className)}
      style={{ x, y, width: size, height: size, background: `radial-gradient(circle, ${color}, transparent 65%)` }}
    />
  );
}

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
