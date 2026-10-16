/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-black p-4">
      <div className="mx-auto h-[62%] w-[70%] bg-gradient-to-br from-[#6b5a4a] to-[#1a1512] transition-transform duration-1000 group-hover:scale-[1.06]" />
      <div className="flex items-end justify-between text-white" style={{ fontFamily: "'Gloock', serif" }}>
        <span className="text-sm">No. 01</span>
        <span className="text-[0.55rem] tracking-[0.3em] text-white/60">DATE · PLACE · MEMORY</span>
      </div>
    </div>
  );
}
