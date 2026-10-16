/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-black">
      <div className="relative aspect-[2.39/1] w-full overflow-hidden">
        <div className="absolute inset-0 scale-110 bg-gradient-to-r from-[#3b2b22] via-[#6b4a3a] to-[#2a2230] transition-transform duration-[2s] group-hover:translate-x-[-6%]" />
        <p className="absolute bottom-2 left-3 text-[0.55rem] tracking-[0.35em] text-white/80" style={{ fontFamily: "'Tenor Sans', sans-serif" }}>
          SCENE 01 — THE DAY WE MET
        </p>
      </div>
    </div>
  );
}
