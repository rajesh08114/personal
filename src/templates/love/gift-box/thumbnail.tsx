/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#fff6ee,#f1d9cf_70%)]">
      <div className="relative size-20 transition-transform duration-700 group-hover:-translate-y-2" style={{ transform: 'rotate(-6deg)' }}>
        <span className="absolute inset-x-0 bottom-0 h-[76%] rounded-md bg-[#c9566f] shadow-xl" />
        <span className="absolute bottom-0 left-1/2 h-[76%] w-3 -translate-x-1/2 bg-[#f3d38a]" />
        <span className="absolute inset-x-[-8%] top-[12%] h-[20%] rounded-md bg-[#b8475f] transition-transform duration-700 group-hover:-translate-y-4 group-hover:-rotate-12" />
      </div>
      {[[20, 70, '#e7b6c1'], [76, 66, '#f3d38a'], [64, 22, '#d9c2ef']].map(([x, y, c], i) => (
        <span key={i} className="absolute size-7 rounded-sm shadow" style={{ left: `${x}%`, top: `${y}%`, background: c as string }} />
      ))}
      <p className="absolute bottom-3 text-xl text-[#9a3a52]" style={{ fontFamily: "'Sacramento', cursive" }}>
        I got you something…
      </p>
    </div>
  );
}
