/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0a08]">
      <div className="absolute inset-[22%_18%] bg-gradient-to-br from-[#5a4632] to-[#1c1712] transition-all duration-1000 group-hover:inset-0" />
      <p className="absolute top-4 left-5 text-4xl text-[#c8a96a]" style={{ fontFamily: "'Italiana', serif" }}>
        01
      </p>
      <p className="absolute right-5 bottom-4 text-sm tracking-[0.4em] text-[#efe6d6]" style={{ fontFamily: "'Italiana', serif" }}>
        OUR STORY
      </p>
    </div>
  );
}
