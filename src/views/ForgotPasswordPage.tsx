'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { accountApi } from '@/data/accounts';
import { useAuth } from '@/store/AuthProvider';
import { AuthCard } from '@/components/ui/AuthCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LoadingScreen } from '@/components/ui/Layout';
import { errorMessage } from '@/utils/media';

/** `/forgot-password` — asks for the address and emails a reset link. */
export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Reset your password — Birthday Studio';
  }, []);

  if (auth.status === 'loading') return <LoadingScreen dark={false} />;

  if (!auth.accountsEnabled || !auth.emailEnabled) {
    return (
      <AuthCard title="Resetting by email isn’t available" intro="This server isn’t set up to send email.">
        <Link href="/login" className="font-semibold underline underline-offset-4">
          Back to log in
        </Link>
      </AuthCard>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await accountApi!.forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email">
        <p role="status" className="leading-relaxed text-[#3a342c]">
          If there’s an account for <strong>{sentTo}</strong>, a link to choose a new password is on its way. It works once, for an
          hour. It can take a minute to arrive, so check your spam folder too.
        </p>
        <p className="mt-5 text-sm">
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" intro="Enter your email and we’ll send you a link to choose a new one.">
      <form onSubmit={submit} noValidate>
        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
        {error && (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-sm font-medium text-rose-700">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" loading={busy}>
          Send reset link
        </Button>
        <p className="mt-5 text-center text-sm text-[#5b5348]">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
