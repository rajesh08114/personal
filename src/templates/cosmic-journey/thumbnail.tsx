/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#03040c] bg-[radial-gradient(ellipse_at_30%_30%,#3b1d6e55,transparent_60%),radial-gradient(ellipse_at_80%_70%,#0e4d6e55,transparent_60%)]">
      <div className="absolute size-40 rounded-full border border-white/10 [transform:rotateX(70deg)]" />
      <div className="absolute size-28 animate-spin-slow rounded-full border border-white/15">
        <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#7dd3fc] to-[#3b82f6]" />
      </div>
      <div className="absolute size-44 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-white/10">
        <span className="absolute top-1/2 -right-2 size-5 rounded-full bg-gradient-to-br from-[#fca5a5] to-[#e11d48]" />
      </div>
      <span className="relative size-10 rounded-full bg-gradient-to-br from-[#fde68a] to-[#f59e0b] shadow-[0_0_30px_#f59e0b] transition-transform duration-500 group-hover:scale-125" />
    </div>
  );
}
