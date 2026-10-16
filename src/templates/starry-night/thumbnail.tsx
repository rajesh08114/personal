/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const stars = [
    [18, 30], [32, 22], [46, 34], [60, 20], [74, 30], [84, 18], [26, 60], [70, 64], [52, 70], [12, 80], [90, 76],
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#050816] via-[#0b1235] to-[#1d1650]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <polyline points="18,30 32,22 46,34 60,20 74,30 84,18" fill="none" stroke="#cdd8ff" strokeOpacity=".5" strokeWidth=".4" />
        {stars.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i < 6 ? 1 : 0.5} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
      <div className="absolute top-4 right-5 size-10 rounded-full bg-[#f4f1e6] shadow-[0_0_30px_#f4f1e6aa]" />
      <div className="absolute top-3 right-[-3rem] h-px w-16 -rotate-[25deg] bg-gradient-to-r from-transparent to-white opacity-0 transition-all duration-1000 group-hover:right-24 group-hover:opacity-100" />
      <p className="absolute inset-x-0 bottom-6 text-center font-serif text-xl tracking-wide text-[#e9ecff] italic">Under the same sky</p>
    </div>
  );
}
