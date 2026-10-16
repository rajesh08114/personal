/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative grid h-full w-full grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden bg-[#ffe14d] bg-[radial-gradient(#e0a800_1px,transparent_1.5px)] bg-[size:8px_8px] p-2" style={{ fontFamily: "'Bangers', cursive" }}>
      <div className="col-span-2 border-[3px] border-black bg-[#4cc9f0]" />
      <div className="border-[3px] border-black bg-white" />
      <div className="border-[3px] border-black bg-white" />
      <div className="col-span-2 flex items-center justify-center border-[3px] border-black bg-[#ff4d6d]">
        <span className="text-2xl tracking-wide text-[#ffe14d] [text-shadow:2px_2px_0_#000] transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">POW!</span>
      </div>
      <span className="absolute top-3 left-4 border-2 border-black bg-white px-1.5 text-xs">THE AMAZING YOU</span>
    </div>
  );
}
