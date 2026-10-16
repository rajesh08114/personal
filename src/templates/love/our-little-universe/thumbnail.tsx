/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const planets = [
    [0.34, 0.9, '#8e3b2e'],
    [0.62, 2.6, '#5f8f7d'],
    [0.88, 4.4, '#bf8f3a'],
  ] as const;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1d1914] bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgb(201_164_103/0.18),transparent_70%)]">
      <svg viewBox="0 0 200 140" className="h-full w-full transition-transform duration-[1.5s] group-hover:rotate-6" aria-hidden>
        {planets.map(([r], i) => (
          <ellipse key={i} cx="100" cy="70" rx={r * 90} ry={r * 32} fill="none" stroke="#b08d57" strokeOpacity=".4" />
        ))}
        {planets.map(([r, a, c], i) => {
          const x = 100 + Math.cos(a) * r * 90;
          const y = 70 + Math.sin(a) * r * 32;
          return (
            <g key={i}>
              <line x1="100" y1="70" x2={x} y2={y} stroke="#c9a467" strokeWidth="1.2" />
              <circle cx={x} cy={y} r={5 + i} fill={c} stroke="#c9a467" />
            </g>
          );
        })}
        <circle cx="100" cy="70" r="12" fill="#c9a467" />
      </svg>
    </div>
  );
}
