'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/ui/SiteHeader';

/** The centred card the sign-in family of pages (forgot, reset, verify) sit in. */
export function AuthCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f4efe6] text-[#2b2620]">
      <SiteHeader />
      <main className="flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#24201b]/15 bg-white p-6 sm:p-8">
            <h1 className="font-display text-3xl leading-tight">{title}</h1>
            {intro && <p className="mt-2 text-sm text-[#5b5348]">{intro}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
