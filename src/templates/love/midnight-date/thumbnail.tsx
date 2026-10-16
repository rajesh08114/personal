/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const heights = [40, 62, 48, 80, 55, 70, 44, 66, 50];
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#050a1f] via-[#0d1840] to-[#1b2a5c]">
      <span className="absolute top-4 right-8 size-9 rounded-full bg-[#fdf6e3] shadow-[0_0_30px_#fdf6e3aa] transition-transform duration-1000 group-hover:-translate-x-10" />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-1 px-2">
        {heights.map((h, i) => (
          <div key={i} className="relative flex-1 bg-[#081028]" style={{ height: `${h}%` }}>
            <div className="absolute inset-1.5 grid grid-cols-2 gap-1 opacity-60 transition-opacity duration-700 group-hover:opacity-100">
              {Array.from({ length: 8 }, (_, k) => (
                <span key={k} className="h-1.5 rounded-[1px]" style={{ background: (i + k) % 3 === 0 ? '#ffd27a' : '#1d2b55' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="absolute top-6 left-6 text-lg text-[#fdf6e3] italic" style={{ fontFamily: "'Marcellus', serif" }}>
        meet me at midnight
      </p>
    </div>
  );
}
