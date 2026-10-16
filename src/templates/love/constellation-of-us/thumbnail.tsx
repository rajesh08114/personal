/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const pts: Array<[number, number]> = [
    [20, 60],
    [34, 34],
    [50, 50],
    [64, 28],
    [80, 46],
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#01020a] to-[#0a1230]">
      <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={(i * 37) % 100} cy={(i * 53) % 80} r={0.4} fill="#fff" opacity={0.6} />
        ))}
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#a9c1ff" strokeWidth={0.35} strokeDasharray="120" className="transition-[stroke-dashoffset] duration-1000 [stroke-dashoffset:120] group-hover:[stroke-dashoffset:0]" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.4} fill="#fff" />
        ))}
      </svg>
      <p className="absolute inset-x-0 bottom-4 text-center text-xs tracking-[0.5em] text-[#cfdcff]" style={{ fontFamily: "'Cinzel', serif" }}>
        OUR STORY
      </p>
    </div>
  );
}
