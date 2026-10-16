/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#d9cdb6]">
      <div className="relative flex size-28 items-center justify-center rounded-full bg-[#4c6c65] shadow-[inset_0_0_0_6px_#44615a,0_10px_18px_-8px_rgb(40_30_20/0.6)] transition-transform duration-500 group-hover:-rotate-6">
        <span className="bg-[#1f1e1c] px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.18em] text-[#f4f1ea]">DO NOT OPEN</span>
        <span className="absolute top-1/2 left-[-12%] h-5 w-[124%] -translate-y-1/2 -rotate-[8deg] bg-[#e8dcb5]/90" />
      </div>
    </div>
  );
}
