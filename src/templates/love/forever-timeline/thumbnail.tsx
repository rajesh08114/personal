/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5efe6] p-5" style={{ fontFamily: "'DM Serif Display', serif" }}>
      <span className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1a1414]/40" />
      <span className="absolute top-0 left-1/2 h-0 w-px bg-[#7d1d2f] transition-all duration-1000 group-hover:h-full" />
      {['The day we met', 'The best day', 'Today', 'Forever'].map((t, i) => (
        <div key={t} className={`absolute flex items-center gap-2 text-sm text-[#1a1414] ${i % 2 ? 'left-[54%]' : 'right-[54%] flex-row-reverse'}`} style={{ top: `${14 + i * 20}%` }}>
          <span className="size-2 rounded-full bg-[#7d1d2f]" />
          {t}
        </div>
      ))}
    </div>
  );
}
