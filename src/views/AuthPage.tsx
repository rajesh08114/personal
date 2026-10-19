'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { useAuth } from '@/store/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LoadingScreen } from '@/components/ui/Layout';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { errorMessage } from '@/utils/media';

/** Only same-site paths, so a crafted `?next=` can't send someone to another site after they log in. */
export const safeNext = (value: string | null): string =>
  value && /^\/(?![/\\])/.test(value) && !/^\/(login|register)(\/|\?|$)/.test(value) ? value : '/dashboard';

/** `/login` and `/register`. */
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const registering = mode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = registering ? 'Create your account — Birthday Studio' : 'Log in — Birthday Studio';
  }, [registering]);

  // Already signed in (or just did): carry on to where they were going.
  useEffect(() => {
    if (auth.user) router.replace(next);
  }, [auth.user, next, router]);

  if (auth.status === 'loading' || auth.user) return <LoadingScreen dark={false} />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (registering) await auth.register(email, password, name);
      else await auth.login(email, password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const suffix = next === '/dashboard' ? '' : `?next=${encodeURIComponent(next)}`;

  return (
    <div className="min-h-dvh bg-[#f4efe6] text-[#2b2620]">
      <SiteHeader />
      <main className="flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">

        {!auth.accountsEnabled ? (
          <div className="rounded-2xl border border-[#24201b]/15 bg-white p-6 text-center sm:p-8">
            <h1 className="font-display text-3xl leading-tight">Accounts aren’t switched on here</h1>
            <p className="mt-3 text-[#5b5348]">You can use the studio without logging in.</p>
            <Link href="/create" className="mt-6 inline-flex font-semibold underline underline-offset-4">
              Open the studio
            </Link>
          </div>
        ) : registering && !auth.registrationOpen ? (
          <div className="rounded-2xl border border-[#24201b]/15 bg-white p-6 text-center sm:p-8">
            <h1 className="font-display text-3xl leading-tight">Sign-ups are closed</h1>
            <p className="mt-3 text-[#5b5348]">New accounts aren’t being accepted right now.</p>
            <Link href="/login" className="mt-6 inline-flex font-semibold underline underline-offset-4">
              Log in instead
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-[#24201b]/15 bg-white p-6 sm:p-8" noValidate>
            <h1 className="font-display text-3xl leading-tight">{registering ? 'Create your account' : 'Welcome back'}</h1>
            <p className="mt-2 text-sm text-[#5b5348]">
              {registering
                ? 'Keep every birthday you make, and a library of your photos and songs, in one private place.'
                : 'Log in to your birthdays and your library.'}
            </p>

            <div className="mt-6 space-y-4">
              {registering && (
                <Input
                  label="Your name"
                  autoComplete="name"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              )}
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
              <Input
                label="Password"
                type="password"
                autoComplete={registering ? 'new-password' : 'current-password'}
                required
                minLength={registering ? 10 : undefined}
                maxLength={200}
                hint={registering ? 'At least 10 characters. A few random words is a good password.' : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
              {!registering && auth.emailEnabled && (
                <p className="-mt-2 text-sm">
                  <Link href="/forgot-password" className="font-semibold underline underline-offset-4">
                    Forgot your password?
                  </Link>
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-4 flex items-start gap-1.5 text-sm font-medium text-rose-700">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" loading={busy}>
              {registering ? 'Create account' : 'Log in'}
            </Button>

            <p className="mt-5 text-center text-sm text-[#5b5348]">
              {registering ? (
                <>
                  Already have an account?{' '}
                  <Link href={`/login${suffix}`} className="font-semibold underline underline-offset-4">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{' '}
                  {auth.registrationOpen ? (
                    <Link href={`/register${suffix}`} className="font-semibold underline underline-offset-4">
                      Create an account
                    </Link>
                  ) : (
                    'Sign-ups are closed right now.'
                  )}
                </>
              )}
            </p>
          </form>
        )}
        </div>
      </main>
    </div>
  );
}
