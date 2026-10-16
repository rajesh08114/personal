/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  const bulbs = ['#ff5d8f', '#ffd23f', '#3ef4ff', '#7dff9c', '#c084fc'];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a0b2e]">
      <svg viewBox="0 0 200 40" className="absolute inset-x-0 top-0 w-full">
        <path d="M0 6 Q50 30 100 10 T200 8" stroke="#555" fill="none" />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={i * 20} cy={6 + Math.sin(i * 0.9) * 8 + 8} r="3.5" fill={bulbs[i % 5]} className="animate-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </svg>
      <div className="absolute inset-x-6 bottom-0 h-1/2 rounded-t-[50%] bg-gradient-to-t from-[#2d1452] to-[#5b2a86]" />
      <div className="absolute bottom-[30%] left-1/2 h-24 w-32 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,#fff6,transparent_70%)] transition-opacity duration-500 group-hover:opacity-100 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)] opacity-60" />
      <p className="absolute inset-x-0 bottom-6 text-center text-xl text-[#ffd23f]" style={{ fontFamily: "'Shrikhand', cursive" }}>
        Festival of You
      </p>
    </div>
  );
}
