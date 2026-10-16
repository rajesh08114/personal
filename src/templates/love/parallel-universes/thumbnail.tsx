/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const books = [
    ['#d9762b', 'h-[62%]'],
    ['#2f5d62', 'h-[70%]'],
    ['#a8342b', 'h-[66%]'],
    ['#1c1b19', 'h-[60%]'],
  ];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-[#e8dfcc] pb-6">
      <div className="flex h-[78%] items-end gap-2">
        {books.map(([c, h], i) => (
          <span key={c} className={`${h} w-12 shadow-md transition-transform duration-500 ${i === 1 ? 'group-hover:-translate-y-3' : ''}`} style={{ background: c }}>
            <span className="mx-auto mt-[30%] block size-7 rounded-full bg-[#f2ebdc]/30" />
          </span>
        ))}
      </div>
      <div className="h-2.5 w-[70%] bg-[#7a5c40]" />
    </div>
  );
}
