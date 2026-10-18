import { useEffect, useRef } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { blendLook, clusterLook, seasonWeights, type Season } from './seasons';

/** Leaf clusters on a golden-angle spiral inside the crown, so the canopy looks grown, not gridded. */
const CLUSTERS = Array.from({ length: 72 }, (_, i) => {
  const a = i * 2.39996;
  const r = Math.sqrt((i + 0.5) / 72);
  return { x: 200 + Math.cos(a) * r * 156, y: 172 + Math.sin(a) * r * 116, r: 15 + ((i * 13) % 9) };
});

/** Main limbs, drawn over the canopy edge so the tree still reads when it's bare. */
const BRANCHES = [
  'M200 470 C 196 400, 204 330, 198 270',
  'M199 300 C 170 270, 130 250, 92 200',
  'M199 290 C 232 262, 270 240, 310 196',
  'M198 270 C 190 220, 176 170, 160 110',
  'M198 270 C 214 216, 232 160, 252 104',
  'M140 236 C 118 214, 96 196, 66 188',
  'M262 226 C 290 212, 318 204, 344 206',
  'M168 150 C 150 130, 140 112, 128 82',
  'M236 148 C 252 128, 268 112, 286 96',
  'M199 210 C 200 170, 202 130, 204 72',
];

/**
 * Everything outside the window: sky, sun, hills, the one tree, the ground, and the glass
 * itself (mist in autumn, frost in winter). Driven by `pos`, a continuous position in the
 * year, and updated outside React so turning seasons never re-renders the page.
 */
export function Scene({ order, pos }: { order: Season[]; pos: MotionValue<number> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clusterRefs = useRef<Array<SVGCircleElement | null>>([]);
  const winter = order.indexOf('winter');
  const autumn = order.indexOf('autumn');

  const apply = (p: number) => {
    const root = rootRef.current;
    if (!root) return;
    const look = blendLook(order, p);
    const w = seasonWeights(p, order.length);
    const s = root.style;
    s.setProperty('--fs-sky-top', look.skyTop);
    s.setProperty('--fs-sky-bottom', look.skyBottom);
    s.setProperty('--fs-ground', look.ground);
    s.setProperty('--fs-hills', look.hills);
    s.setProperty('--fs-sun-y', `${(1 - look.sun) * 46 + 6}%`);
    s.setProperty('--fs-sun-x', `${18 + (p / Math.max(1, order.length - 1)) * 60}%`);
    s.setProperty('--fs-frost', String(w[winter]));
    s.setProperty('--fs-mist', String(w[autumn] * 0.6 + w[winter] * 0.3));
    clusterRefs.current.forEach((el, i) => {
      if (!el) return;
      const c = clusterLook(order, p, i, CLUSTERS.length);
      el.setAttribute('fill', c.color);
      el.style.transform = `scale(${c.scale.toFixed(3)})`;
    });
  };

  useMotionValueEvent(pos, 'change', apply);
  useEffect(() => apply(pos.get()));

  return (
    <div ref={rootRef} aria-hidden className="fs-scene pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[var(--fs-sky-top)] to-[var(--fs-sky-bottom)]" />
      <div className="fs-sun absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-32" />
      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[16%] h-[26%] w-full"
      >
        <path
          d="M0 260 C 160 180, 320 210, 470 170 C 640 125, 760 210, 930 160 C 1040 128, 1130 150, 1200 140 L1200 400 L0 400 Z"
          fill="var(--fs-hills)"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[var(--fs-ground)]" />
      <svg
        viewBox="0 0 400 500"
        className="absolute bottom-[10%] left-1/2 h-[min(78vh,46rem)] -translate-x-1/2 overflow-visible sm:left-[68%]"
      >
        <ellipse cx="200" cy="474" rx="120" ry="12" fill="#000" opacity="0.08" />
        <path
          d="M184 478 C 190 420, 186 360, 192 300 L 208 300 C 212 360, 210 420, 218 478 Z"
          fill="#5b4636"
        />
        {BRANCHES.map((d) => (
          <path key={d} d={d} stroke="#5b4636" strokeWidth="9" strokeLinecap="round" fill="none" />
        ))}
        {/* Snow settles on the tops of the limbs in winter. */}
        <g className="fs-snowline">
          {BRANCHES.slice(1).map((d) => (
            <path
              key={d}
              d={d}
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              transform="translate(0 -2)"
            />
          ))}
        </g>
        {CLUSTERS.map((c, i) => (
          <circle
            key={i}
            ref={(el) => {
              clusterRefs.current[i] = el;
            }}
            cx={c.x}
            cy={c.y}
            r={c.r}
            className="fs-cluster"
            fillOpacity={0.92}
            style={{ transformOrigin: `${c.x}px ${c.y}px` }}
          />
        ))}
      </svg>
      <div className="fs-mist absolute inset-0" />
      <div className="fs-frost absolute inset-0" />
    </div>
  );
}

/** The window itself: a painted wooden frame and sill that stays put while the year turns. */
export function WindowFrame() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute inset-0 border-[10px] border-[#efe6d6] shadow-[inset_0_0_0_2px_#d8ccb6,inset_0_10px_30px_-12px_rgb(0_0_0/0.35)] sm:border-[18px]" />
      <div className="absolute inset-x-0 bottom-0 h-5 bg-[#e6dac4] shadow-[0_-3px_0_#d4c5aa,0_-10px_24px_-8px_rgb(0_0_0/0.25)] sm:h-8" />
    </div>
  );
}
