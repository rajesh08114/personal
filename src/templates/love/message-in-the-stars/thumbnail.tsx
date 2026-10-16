/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#020611]">
      <div className="absolute -top-6 left-[-10%] h-24 w-[120%] -rotate-6 bg-gradient-to-r from-transparent via-[#34d399]/40 to-transparent blur-xl transition-transform duration-1000 group-hover:translate-x-6" />
      <div className="absolute top-8 left-[-10%] h-16 w-[120%] rotate-3 bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent blur-xl" />
      <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full" aria-hidden>
        <polyline points="30,40 38,28 50,34 62,28 70,40 50,52 30,40" fill="none" stroke="#e0f2fe" strokeOpacity=".5" strokeWidth=".4" />
        {[[30, 40], [38, 28], [50, 34], [62, 28], [70, 40], [50, 52]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.1} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
      <p className="absolute inset-x-0 bottom-3 text-center text-sm text-[#e0f2fe]/80 italic" style={{ fontFamily: "'Lustria', serif" }}>
        every line, a star
      </p>
    </div>
  );
}
