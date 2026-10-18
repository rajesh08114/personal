import Link from 'next/link';

/** A shared link that doesn't exist (or was unpublished). Only reached when a server stores the birthdays. */
export default function BirthdayNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f4efe6] px-6 text-center text-[#2b2620]">
      <div className="max-w-md">
        <p className="font-mono text-xs tracking-[0.25em] text-[#8a7f70] uppercase">Birthday link</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">This surprise couldn’t be found.</h1>
        <p className="mt-4 leading-relaxed text-[#5b5348]">
          The link may be mistyped, or the birthday may have been removed.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/templates" className="text-sm font-semibold underline underline-offset-4 hover:text-black">
            Create your own birthday surprise
          </Link>
        </div>
      </div>
    </main>
  );
}
