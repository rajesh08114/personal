/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-[#070204]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_30_70/0.25),transparent_60%)]" />
      <svg viewBox="0 0 200 60" className="relative w-full" aria-hidden>
        <path
          d="M0 30 H60 L68 30 L74 8 L82 52 L88 30 H120 L128 30 L134 8 L142 52 L148 30 H200"
          fill="none"
          stroke="#ff2e5f"
          strokeWidth="2"
          strokeDasharray="400"
          className="transition-[stroke-dashoffset] duration-[1.5s] [stroke-dashoffset:400] group-hover:[stroke-dashoffset:0]"
          style={{ filter: 'drop-shadow(0 0 4px #ff2e5f)' }}
        />
      </svg>
      <p className="absolute right-4 bottom-3 font-mono text-[0.6rem] tracking-widest text-[#ff2e5f]">♥ 72 BPM</p>
    </div>
  );
}
