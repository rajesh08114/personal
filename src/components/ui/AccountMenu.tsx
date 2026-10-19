'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, CircleAlert, FolderOpen, LayoutDashboard, LogOut, Pencil, UserRound } from 'lucide-react';
import { useAuth } from '@/store/AuthProvider';
import { cn } from '@/utils/cn';

const LINK =
  'inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold whitespace-nowrap opacity-75 hover:opacity-100 focus-visible:opacity-100';

const ITEM =
  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#24201b] hover:bg-[#f4efe6] focus-visible:bg-[#f4efe6] focus-visible:outline-none';

/**
 * The right-hand end of every page header. Signed out: Log in and Get started. Signed in: the person's
 * initial, opening a menu to their birthdays, library, profile and Log out. It takes its colour from
 * the header it sits in, and renders nothing on servers without accounts.
 */
export function AccountMenu({ className }: { className?: string }) {
  const auth = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Close on navigation, on a click elsewhere, and on Escape (returning focus to the button).
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (auth.status !== 'ready' || !auth.accountsEnabled) return null;

  if (!auth.user) {
    return (
      <span className={cn('inline-flex items-center gap-1', className)}>
        <Link href="/login" className={LINK}>
          Log in
        </Link>
        {auth.registrationOpen && (
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded-md bg-[#24201b] px-4 text-sm font-semibold whitespace-nowrap text-[#f4efe6] hover:bg-[#3a342c]"
          >
            Get started
          </Link>
        )}
      </span>
    );
  }

  const { user } = auth;
  const initial = (user.name.trim()[0] ?? user.email[0] ?? '?').toUpperCase();

  const logout = async () => {
    setBusy(true);
    try {
      await auth.logout();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-full pr-2 pl-1 hover:bg-black/5 focus-visible:bg-black/5"
      >
        <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-full bg-[#24201b] text-sm font-semibold text-[#f4efe6]">
          {initial}
        </span>
        <span className="max-w-32 truncate text-sm font-semibold max-md:hidden">{user.name}</span>
        <ChevronDown aria-hidden className={cn('size-4 opacity-60 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          // Choosing anything closes the menu, including a link to another view of the page we're already on.
          onClick={() => setOpen(false)}
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#24201b]/15 bg-white p-2 text-[#24201b] shadow-xl"
        >
          <div className="px-3 pt-2 pb-3">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-[#5b5348]">{user.email}</p>
            {auth.emailEnabled && !user.emailVerified && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">
                <CircleAlert className="size-3.5" aria-hidden /> Email not confirmed
              </p>
            )}
          </div>
          <div className="border-t border-[#24201b]/10 pt-1">
            <Link role="menuitem" href="/dashboard" className={ITEM}>
              <LayoutDashboard className="size-4 text-[#8a7f70]" aria-hidden /> My birthdays
            </Link>
            <Link role="menuitem" href="/dashboard?tab=library" className={ITEM}>
              <FolderOpen className="size-4 text-[#8a7f70]" aria-hidden /> Photo &amp; music library
            </Link>
            <Link role="menuitem" href="/create" className={ITEM}>
              <Pencil className="size-4 text-[#8a7f70]" aria-hidden /> Open the studio
            </Link>
            <Link role="menuitem" href="/profile" className={ITEM}>
              <UserRound className="size-4 text-[#8a7f70]" aria-hidden /> Profile &amp; settings
            </Link>
          </div>
          <div className="mt-1 border-t border-[#24201b]/10 pt-1">
            <button type="button" role="menuitem" disabled={busy} onClick={() => void logout()} className={ITEM}>
              <LogOut className="size-4 text-[#8a7f70]" aria-hidden /> {busy ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
