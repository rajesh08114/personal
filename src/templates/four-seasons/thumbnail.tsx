import './thumbnail.css';

/** Gallery thumbnail: a whole year turning on one tree, in an eight-second loop. */
export default function Thumbnail() {
  return (
    <div className="fs-thumb relative h-full w-full overflow-hidden">
      <div className="fs-thumb-sky absolute inset-0" />
      <div className="fs-thumb-ground absolute inset-x-0 bottom-0 h-[22%]" />
      <svg
        viewBox="0 0 100 100"
        className="absolute bottom-[14%] left-1/2 h-[70%] -translate-x-1/2"
        aria-hidden
      >
        <path d="M47 100 C 48 80, 47 66, 49 56 L 53 56 C 54 66, 53 80, 55 100 Z" fill="#5b4636" />
        <path
          d="M50 64 C 40 56, 30 52, 22 44 M51 62 C 60 54, 70 50, 78 42 M50 58 C 49 44, 46 34, 44 24 M51 58 C 54 44, 58 34, 62 24"
          stroke="#5b4636"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {[
          [30, 40],
          [42, 28],
          [58, 28],
          [70, 40],
          [50, 18],
          [36, 52],
          [64, 52],
          [50, 38],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="11"
            className="fs-thumb-leaf"
            style={{ animationDelay: `${i * 40}ms`, transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 border-[6px] border-[#efe6d6]" aria-hidden />
    </div>
  );
}
