'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AccountMenu } from '@/components/ui/AccountMenu';
import { useAuth } from '@/store/AuthProvider';
import { cn } from '@/utils/cn';

const NAV =
  'inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-[#5b5348] hover:text-[#24201b] aria-[current=page]:text-[#24201b] aria-[current=page]:underline aria-[current=page]:underline-offset-8';

/**
 * The header shared by the landing page, the catalogue, the dashboard and the profile.
 * `active` marks the current section for assistive technology and for the underline.
 */
export function SiteHeader({
  active,
  width = 'max-w-7xl',
}: {
  active?: 'templates' | 'dashboard' | 'profile';
  width?: string;
}) {
  const auth = useAuth();
  const loading = auth.status === 'loading';
  const accounts = !loading && auth.accountsEnabled;
  const localMode = !loading && !auth.accountsEnabled;

  return (
    <header className={cn('mx-auto flex items-center justify-between gap-3 px-4 py-5 sm:px-8', width)}>
      <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold">
        <img src="/favicon.svg" alt="" className="size-8" />
        <span className="max-sm:sr-only">Birthday Studio</span>
      </Link>
      <nav className="flex items-center gap-1" aria-label="Main">
        <Link href="/templates" className={NAV} aria-current={active === 'templates' ? 'page' : undefined}>
          Templates
        </Link>

        {/* Signed-in user in accounts mode */}
        {accounts && auth.user && (
          <Link href="/dashboard" className={cn(NAV, 'max-sm:hidden')} aria-current={active === 'dashboard' ? 'page' : undefined}>
            My birthdays
          </Link>
        )}

        {/* Local mode — no accounts server */}
        {localMode && (
          <>
            <Link href="/preview" className={cn(NAV, 'max-sm:hidden')}>
              My website
            </Link>
            <Link
              href="/create"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#24201b] px-4 text-sm font-semibold text-[#f4efe6] hover:bg-[#3a342c]"
            >
              Open studio <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}

        {/* Accounts mode — signed out: show Log in + Get started */}
        {accounts && !auth.user && (
          <>
            <Link href="/login" className={NAV}>
              Log in
            </Link>
            {auth.registrationOpen && (
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-md bg-[#24201b] px-4 text-sm font-semibold text-[#f4efe6] hover:bg-[#3a342c]"
              >
                Get started
              </Link>
            )}
          </>
        )}

        {/* Accounts mode — signed in: avatar dropdown */}
        {accounts && auth.user && <AccountMenu className="ml-1" />}
      </nav>
    </header>
  );
}
