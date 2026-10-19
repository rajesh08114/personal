'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/store/AuthProvider';

const PRIMARY =
  'inline-flex h-13 items-center justify-center gap-2 rounded-md bg-[#24201b] px-7 text-base font-semibold text-[#f4efe6] hover:bg-[#3a342c]';
const SECONDARY =
  'inline-flex h-13 items-center justify-center rounded-md border border-[#24201b]/30 px-7 text-base font-semibold text-[#24201b] hover:border-[#24201b] hover:bg-white/60';

/** The landing page's buttons. They change with who is looking: a new visitor, a returning user, or a server without accounts. */
export function HeroActions({ placement = 'hero' }: { placement?: 'hero' | 'closing' }) {
  const auth = useAuth();
  // Until the server has answered, show the signed-out buttons: they are right for most first visits.
  const user = auth.status === 'ready' ? auth.user : null;
  const accounts = auth.status !== 'ready' || auth.accountsEnabled;

  let note: string;
  let buttons;
  if (user) {
    note = `Signed in as ${user.name}.`;
    buttons = (
      <>
        <Link href="/dashboard" className={PRIMARY}>
          Go to my birthdays <ArrowRight className="size-5" aria-hidden />
        </Link>
        <Link href="/templates" className={SECONDARY}>
          Start a new one
        </Link>
      </>
    );
  } else if (!accounts) {
    note = 'No account needed. Everything stays in this browser until you share it.';
    buttons = (
      <>
        <Link href="/create" className={PRIMARY}>
          Open the studio <ArrowRight className="size-5" aria-hidden />
        </Link>
        <Link href="/templates" className={SECONDARY}>
          Browse templates
        </Link>
      </>
    );
  } else {
    note = 'Free. A couple of minutes, start to finish.';
    buttons = (
      <>
        <Link href={`/register?next=${encodeURIComponent('/templates')}`} className={PRIMARY}>
          Create your first birthday <ArrowRight className="size-5" aria-hidden />
        </Link>
        <Link href="/templates" className={SECONDARY}>
          Browse templates
        </Link>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">{buttons}</div>
      <p className="mt-4 text-sm text-[#5b5348]">
        {note}
        {!user && accounts && placement === 'hero' && (
          <>
            {' '}
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#24201b] underline underline-offset-4">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
