/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f6efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgb(255_236_200/0.9),transparent_60%)]" />
      <div className="relative h-[52%] w-[62%] rounded-sm bg-[#efe2cc] shadow-[0_18px_30px_-12px_rgb(80_50_30/0.45)]">
        <div className="absolute inset-x-0 top-0 h-1/2 origin-top bg-[#e6d4b6] transition-transform duration-700 [clip-path:polygon(0_0,100%_0,50%_100%)] group-hover:[transform:rotateX(160deg)]" />
        <div className="absolute top-[42%] left-1/2 size-8 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#c24b5a,#8e2236)] shadow-md" />
        <p className="absolute inset-x-0 bottom-3 text-center text-lg text-[#8e2236]" style={{ fontFamily: "'Pinyon Script', cursive" }}>
          I wrote something for you
        </p>
      </div>
      <span className="absolute top-6 left-8 h-3 w-2 rotate-45 rounded-[50%_0] bg-[#d9667a]/70" />
      <span className="absolute right-10 bottom-8 h-3 w-2 -rotate-12 rounded-[50%_0] bg-[#d9667a]/60" />
    </div>
  );
}
