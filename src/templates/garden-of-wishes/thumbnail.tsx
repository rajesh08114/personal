/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
function Flower({ x, c, h, d }: { x: number; c: string; h: number; d: number }) {
  return (
    <div className="absolute bottom-[18%] flex flex-col items-center transition-transform duration-700 group-hover:-translate-y-2" style={{ left: `${x}%`, transitionDelay: `${d}ms` }}>
      <div className="relative size-9">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="absolute top-1/2 left-1/2 h-4 w-3 -translate-x-1/2 rounded-full" style={{ background: c, transform: `translate(-50%,-100%) rotate(${i * 60}deg)`, transformOrigin: '50% 100%' }} />
        ))}
        <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd166]" />
      </div>
      <span className="w-0.5 bg-[#6a994e]" style={{ height: h }} />
    </div>
  );
}

export default function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#ffe8d6] to-[#e3f4ea]">
      <div className="absolute -top-10 -right-10 size-32 rounded-full bg-[#ffd8a8] opacity-70 blur-xl" />
      <Flower x={16} c="#f4978e" h={40} d={0} />
      <Flower x={38} c="#c8b6ff" h={60} d={100} />
      <Flower x={60} c="#ffafcc" h={46} d={200} />
      <Flower x={80} c="#f4978e" h={34} d={300} />
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[#a3b18a]" />
      <span className="absolute top-6 left-8 size-1.5 animate-twinkle rounded-full bg-[#ffd166] shadow-[0_0_8px_#ffd166]" />
      <span className="absolute top-14 left-1/2 size-1.5 animate-twinkle rounded-full bg-[#ffd166] shadow-[0_0_8px_#ffd166] [animation-delay:1s]" />
    </div>
  );
}
