import type { ElementType, ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { DURATION, EASE, revealVariants, type RevealKind } from '@/animations/tokens';

interface RevealProps {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'p' | 'span' | 'h2' | 'h3' | 'figure' | 'article';
  amount?: number;
}

/** Reveals its children once when they scroll into view. */
export function Reveal({ children, kind = 'up', delay = 0, duration = DURATION.slow, className, as = 'div', amount = 0.25 }: RevealProps) {
  const Comp = motion[as] as ElementType;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={revealVariants[kind]}
      transition={{ duration, delay, ease: EASE.out }}
    >
      {children}
    </Comp>
  );
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: '0.6em', filter: 'blur(8px)' },
  show: { opacity: 1, y: '0em', filter: 'blur(0px)' },
};

/** Word-by-word text reveal. Keeps the full sentence available to screen readers. */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  as = 'p',
  inView = true,
  id,
}: {
  id?: string;
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
  /** Animate when scrolled into view (default) or immediately on mount. */
  inView?: boolean;
}) {
  const Comp = motion[as] as ElementType;
  const words = text.split(/(\s+)/);
  const trigger = inView
    ? { whileInView: 'show', viewport: { once: true, amount: 0.4 } }
    : { animate: 'show' };
  return (
    <Comp
      id={id}
      className={className}
      aria-label={text}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block will-change-transform"
            variants={wordVariants}
            transition={{ duration: 0.6, ease: EASE.out }}
          >
            {w}
          </motion.span>
        ),
      )}
    </Comp>
  );
}
