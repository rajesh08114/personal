'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { accountApi } from '@/data/accounts';
import { useAuth } from '@/store/AuthProvider';
import { AuthCard } from '@/components/ui/AuthCard';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/Layout';
import { errorMessage } from '@/utils/media';

/**
 * `/verify-email?token=…` — the page the confirmation link opens. It asks for a click rather than
 * confirming on load, so a mail scanner that opens the link can't use it up.
 */
export default function VerifyEmailPage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [token] = useState(() => params.get('token'));
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Confirm your email — Birthday Studio';
    if (params.has('token')) router.replace('/verify-email');
  }, [params, router]);

  if (auth.status === 'loading') return <LoadingScreen dark={false} />;

  if (!auth.accountsEnabled) {
    return (
      <AuthCard title="Accounts aren't switched on here" intro="You can use the studio without logging in.">
        <Link href="/create" className="font-semibold underline underline-offset-4">
          Open the studio
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Email confirmed" intro="Thanks. You’ll be able to reset your password by email if you ever need to.">
        <Link href={auth.user ? '/dashboard' : '/login'} className="font-semibold underline underline-offset-4">
          {auth.user ? 'Go to my birthdays' : 'Log in'}
        </Link>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard title="This link isn’t complete" intro="Open the link from your email again.">
        <Link href="/dashboard" className="font-semibold underline underline-offset-4">
          Go to my birthdays
        </Link>
      </AuthCard>
    );
  }

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await accountApi!.verifyEmail(token);
      await auth.refresh();
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Confirm your email" intro="One click and your address is confirmed.">
      {error && (
        <p role="alert" className="mb-4 flex items-start gap-1.5 text-sm font-medium text-rose-700">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}
      <Button variant="primary" size="lg" className="w-full" loading={busy} onClick={() => void confirm()}>
        Confirm my email
      </Button>
    </AuthCard>
  );
}
