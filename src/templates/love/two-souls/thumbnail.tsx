/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b0d12]">
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#10141c]" />
      <span className="absolute top-[46%] left-[22%] size-2.5 rounded-full bg-[#fff4dc] shadow-[0_0_14px_4px_rgb(232_162_91/0.55)] transition-all duration-1000 group-hover:left-[47%]" />
      <span className="absolute top-[46%] right-[22%] size-2.5 rounded-full bg-[#fff4dc] shadow-[0_0_14px_4px_rgb(232_162_91/0.55)] transition-all duration-1000 group-hover:right-[47%]" />
      <p className="absolute bottom-5 text-xs tracking-[0.5em] text-[#f1e7d6]/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        YOU + ME = US
      </p>
    </div>
  );
}
