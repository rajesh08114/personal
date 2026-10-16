/** Gallery thumbnail. Loaded lazily, only where the catalogue is shown. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#d8cfb8]">
      <div className="relative h-[76%] w-[82%] overflow-hidden rounded-md bg-[#140e04] px-4 py-3 text-[#ffb000] shadow-[inset_0_0_30px_8px_rgb(0_0_0/0.8)]" style={{ fontFamily: "'VT323', monospace", textShadow: '0 0 2px rgb(255 176 0 / 0.6)' }}>
        <p className="text-sm leading-tight">C:\&gt; RUN BIRTHDAY.EXE</p>
        <p className="text-sm leading-tight opacity-70">████████████░░░░ 75%</p>
        <p className="mt-2 text-2xl leading-none">HAPPY BIRTHDAY<span className="ml-1 inline-block h-5 w-2.5 translate-y-0.5 bg-[#ffb000] group-hover:opacity-0" /></p>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/0.25)_0_1px,transparent_1px_3px)]" />
      </div>
    </div>
  );
}
