/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-end justify-center gap-6 overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#5a1424,#1c050b_75%)] pb-6">
      {[0.8, 1, 0.75].map((s, i) => (
        <div key={i} className="flex flex-col items-center" style={{ transform: `scale(${s})` }}>
          <div className="relative size-12 transition-transform duration-700 group-hover:scale-125">
            {[0, 1, 2, 3, 4].map((k) => (
              <span key={k} className="absolute inset-0 rounded-[50%_50%_45%_45%] border border-[#7a0f24] bg-[#b3203f]" style={{ transform: `rotate(${k * 72}deg) scale(${1 - k * 0.15})` }} />
            ))}
          </div>
          <span className="h-14 w-1 bg-[#3d6b3a]" />
        </div>
      ))}
      <p className="absolute top-5 text-lg text-[#f3e3d3] italic" style={{ fontFamily: "'Bodoni Moda', serif" }}>
        you, in bloom
      </p>
    </div>
  );
}
