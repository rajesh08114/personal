'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { accountApi } from '@/data/accounts';
import { useAuth } from '@/store/AuthProvider';
import { AuthCard } from '@/components/ui/AuthCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LoadingScreen } from '@/components/ui/Layout';
import { errorMessage } from '@/utils/media';

/** `/reset-password?token=…` — the page the emailed link opens. */
export default function ResetPasswordPage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [token] = useState(() => params.get('token'));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Choose a new password — Birthday Studio';
    // The link's token has been read; take it out of the address bar and the browser history.
    if (params.has('token')) router.replace('/reset-password');
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

  if (!token && !done) {
    return (
      <AuthCard title="This link isn’t complete" intro="Open the link from your email again, or ask for a new one.">
        <Link href="/forgot-password" className="font-semibold underline underline-offset-4">
          Send me a new link
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password changed" intro="You were signed out everywhere. Log in with your new password.">
        <Link href="/login" className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#17111f] px-7 text-base font-semibold text-white">
          Log in
        </Link>
      </AuthCard>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('The two passwords don’t match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await accountApi!.resetPassword(token!, password);
      await auth.refresh();
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" intro="At least 10 characters. A few random words is a good password.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="New password" type="password" autoComplete="new-password" required minLength={10} maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
        <Input label="Type it again" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12" />
        {error && (
          <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-rose-700">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {error}{' '}
              {/expired|already used/i.test(error) && (
                <Link href="/forgot-password" className="underline underline-offset-4">
                  Ask for a new one.
                </Link>
              )}
            </span>
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
          Change password
        </Button>
      </form>
    </AuthCard>
  );
}
