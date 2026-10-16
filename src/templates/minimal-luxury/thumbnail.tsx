/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#f4efe6]">
      <div className="flex flex-1 flex-col justify-center pl-6">
        <p className="text-4xl leading-none text-[#0e0d0b]" style={{ fontFamily: "'Bodoni Moda', Didot, serif" }}>
          Today
        </p>
        <p className="mt-2 text-[0.55rem] tracking-[0.45em] text-[#0e0d0b]/70">IS YOUR DAY.</p>
        <span className="mt-4 block h-px w-8 bg-[#b8975a] transition-all duration-700 group-hover:w-20" />
      </div>
      <div className="w-[38%] bg-[#0e0d0b] p-3">
        <div className="h-full w-full bg-gradient-to-b from-[#3b352c] to-[#15130f] transition-transform duration-1000 group-hover:scale-105" />
      </div>
    </div>
  );
}
