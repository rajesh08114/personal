/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="np-thumb relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#120d10] bg-[linear-gradient(rgb(0_0_0/0.55)_2px,transparent_2px),linear-gradient(90deg,rgb(0_0_0/0.5)_2px,transparent_2px)] bg-[size:100%_18px,40px_36px]">
      <p className="text-3xl font-extrabold tracking-wide text-[#fff3fb] transition-opacity duration-300 group-hover:opacity-70" style={{ fontFamily: "'Monoton', sans-serif", textShadow: '0 0 4px #fff, 0 0 12px #ff3ea5, 0 0 26px #ff3ea5' }}>
        PARTY
      </p>
      <p className="mt-1 text-sm tracking-[0.3em] text-[#effeff]" style={{ textShadow: '0 0 4px #fff, 0 0 12px #3ef4ff' }}>
        OPEN LATE
      </p>
    </div>
  );
}
