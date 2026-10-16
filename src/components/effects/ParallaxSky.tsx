import { motion, useScroll, useTransform } from 'motion/react';
import { usePointerParallax } from '@/hooks/usePointerParallax';
import { Particles, type ParticleVariant } from './Particles';

interface Layer {
  /** How far this layer travels, in px, at full pointer deflection. Far layers move least. */
  depth: number;
  density: number;
  colors: string[];
  variant?: ParticleVariant;
}

/**
 * A starfield split into depth planes. Each plane shifts with the pointer and with page
 * scroll by an amount proportional to its depth, the way stars and nearer objects separate
 * when you turn your head. Transform-only, so it stays on the compositor.
 */
export function ParallaxSky({ layers, scrollTravel = 120 }: { layers: Layer[]; scrollTravel?: number }) {
  const { x, y } = usePointerParallax();
  const { scrollYProgress } = useScroll();
  return (
    <>
      {layers.map((layer, i) => (
        <SkyLayer key={i} layer={layer} px={x} py={y} scroll={scrollYProgress} scrollTravel={scrollTravel} />
      ))}
    </>
  );
}

function SkyLayer({
  layer,
  px,
  py,
  scroll,
  scrollTravel,
}: {
  layer: Layer;
  px: ReturnType<typeof usePointerParallax>['x'];
  py: ReturnType<typeof usePointerParallax>['y'];
  scroll: ReturnType<typeof useScroll>['scrollYProgress'];
  scrollTravel: number;
}) {
  const tx = useTransform(px, (v) => v * -layer.depth);
  const pointerY = useTransform(py, (v) => v * -layer.depth * 0.6);
  const scrollY = useTransform(scroll, (v) => v * -scrollTravel * (layer.depth / 24));
  const ty = useTransform([pointerY, scrollY], ([a, b]: number[]) => a + b);
  return (
    <motion.div aria-hidden className="absolute -inset-[8%] will-change-transform" style={{ x: tx, y: ty }}>
      <Particles variant={layer.variant ?? 'stars'} density={layer.density} colors={layer.colors} />
    </motion.div>
  );
}
