/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#4c3a7a] to-[#c98b6b]">
      <div className="absolute top-4 right-8 size-8 rounded-full bg-[#fff3c4] shadow-[0_0_24px_#fff3c4]" />
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-3/4 w-full">
        <path d="M0 90 Q50 60 100 85 T200 80 V120 H0Z" fill="#2d2350" />
        <g fill="#1a1433">
          <rect x="88" y="40" width="24" height="50" />
          <rect x="80" y="55" width="8" height="35" />
          <rect x="112" y="55" width="8" height="35" />
          <polygon points="88,40 100,22 112,40" />
          <polygon points="80,55 84,45 88,55" />
          <polygon points="112,55 116,45 120,55" />
        </g>
        <rect x="97" y="55" width="6" height="8" className="fill-[#1a1433] transition-colors duration-700 group-hover:fill-[#ffd166]" />
        <path d="M0 105 Q60 90 120 104 T200 100 V120 H0Z" fill="#120d24" />
      </svg>
      <p className="absolute inset-x-0 top-1/3 text-center text-lg text-[#fff3c4]" style={{ fontFamily: "'IM Fell English', serif" }}>
        Once upon a time…
      </p>
    </div>
  );
}
