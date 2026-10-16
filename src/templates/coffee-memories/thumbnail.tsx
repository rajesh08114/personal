/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#f3e6d3]">
      <div className="m-3 flex flex-1 flex-col justify-center rounded-md border-4 border-[#8b5e3c] bg-[#1f2a24] p-3 text-[#f5efe3]" style={{ fontFamily: "'Caveat', cursive" }}>
        <p className="text-base">~ today’s menu ~</p>
        <p className="text-sm opacity-80">Memory latte ........ ♡</p>
        <p className="text-sm opacity-80">Birthday special .... ♡</p>
        <p className="text-sm opacity-80">Sweet surprise ...... ♡</p>
      </div>
      <div className="relative mr-4 flex w-[34%] items-end justify-center pb-6">
        <div className="relative h-12 w-14 rounded-b-2xl bg-white shadow-md">
          <span className="absolute top-2 -right-3 h-6 w-4 rounded-r-full border-4 border-white" />
          <span className="absolute -top-8 left-3 h-7 w-1.5 rounded-full bg-white/70 blur-[1px] transition-transform duration-1000 group-hover:-translate-y-2" />
          <span className="absolute -top-10 left-7 h-8 w-1.5 rounded-full bg-white/60 blur-[1px] transition-transform duration-1000 group-hover:-translate-y-3" />
        </div>
      </div>
    </div>
  );
}
