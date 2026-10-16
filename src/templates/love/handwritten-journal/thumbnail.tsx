/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#3b4a5a]">
      <div className="relative flex h-[78%] w-[80%] shadow-2xl">
        <div className="flex-1 bg-[repeating-linear-gradient(#fdfbf4_0_10px,#c9d8ea_10px_11px)]" />
        <div className="w-1 bg-[#2b3440]" />
        <div className="relative flex-1 origin-left bg-[repeating-linear-gradient(#fdfbf4_0_10px,#c9d8ea_10px_11px)] transition-transform duration-1000 group-hover:[transform:perspective(400px)_rotateY(-35deg)]">
          <div className="absolute top-3 left-3 h-8 w-10 rotate-3 bg-[#e9b9a8]" />
          <span className="absolute right-0 bottom-0 size-5 bg-[linear-gradient(135deg,#fdfbf4_50%,#e8dfcc_50%)]" />
        </div>
      </div>
      <p className="absolute bottom-2 text-sm text-[#fdfbf4]" style={{ fontFamily: "'Kalam', cursive" }}>
        our journal
      </p>
    </div>
  );
}
