import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f4efe6] px-6 text-center text-[#24201b]">
      <p className="font-display text-6xl">404</p>
      <p className="text-[#5b5348]">This page wandered off to a party somewhere.</p>
      <Link href="/templates" className="mt-2 rounded-md bg-[#24201b] px-6 py-3 font-semibold text-[#f4efe6]">
        Browse birthday templates
      </Link>
    </main>
  );
}
