/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#5a3a22,#1f130b_70%)]">
      <div className="relative size-28 rounded-full bg-[repeating-radial-gradient(circle,#111_0_2px,#1d1d1d_2px_4px)] shadow-2xl transition-transform duration-[2s] group-hover:rotate-[360deg]">
        <span className="absolute inset-[34%] rounded-full bg-[#c4552f]" />
        <span className="absolute inset-[47%] rounded-full bg-[#1f130b]" />
      </div>
      <span className="absolute top-6 right-[26%] h-20 w-1.5 origin-top rotate-[18deg] rounded-full bg-[#cfc3b2] transition-transform duration-700 group-hover:rotate-[28deg]" />
      <p className="absolute bottom-3 left-4 text-sm text-[#f0d9b5]" style={{ fontFamily: "'Righteous', sans-serif" }}>
        Side A · Us
      </p>
    </div>
  );
}
