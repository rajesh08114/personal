/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-[#0f0d0c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(255_59_47/0.25),transparent_55%)]" />
      <div className="flex gap-2 bg-[#1b1714] px-3 py-4 transition-transform duration-1000 group-hover:-translate-x-10">
        {['#ffb38a', '#8fd3ff', '#c3f0ca', '#fbc2eb', '#ffe29f'].map((c, i) => (
          <div key={i} className="relative h-20 w-16 shrink-0 bg-black p-1">
            <div className="h-full w-full transition-[filter] duration-700 [filter:invert(1)_hue-rotate(180deg)] group-hover:[filter:none]" style={{ background: c }} />
          </div>
        ))}
      </div>
      <span className="absolute top-2 right-3 text-[0.55rem] tracking-widest text-[#ff6b5e]" style={{ fontFamily: "'Space Mono', monospace" }}>
        ● REC 400
      </span>
    </div>
  );
}
