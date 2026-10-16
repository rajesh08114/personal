/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#c9b9a0]">
      <div className="w-[78%] -rotate-2 bg-[#efe9dc] px-3 pt-2 pb-3 text-[#1d1b18] shadow-md transition-transform duration-500 group-hover:rotate-0">
        <p className="text-center text-xl leading-none" style={{ fontFamily: "'UnifrakturMaguntia', serif" }}>
          The Birthday Edition
        </p>
        <div className="mt-1 border-y border-double border-[#1d1b18] py-px text-center text-[0.4rem] tracking-[0.2em] uppercase">Vol. 30 · One copy printed</div>
        <p className="mt-1.5 text-[0.8rem] leading-tight font-bold uppercase" style={{ fontFamily: "'Old Standard TT', serif" }}>
          Local legend turns thirty
        </p>
        <div className="mt-1.5 grid grid-cols-[1.3fr_1fr] gap-1.5">
          <div className="aspect-[3/2] bg-[#9b9284]" />
          <div className="space-y-1">
            {[100, 90, 95, 70].map((w, i) => (
              <div key={i} className="h-0.5 bg-[#1d1b18]/25" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
