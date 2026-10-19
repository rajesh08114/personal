'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleAlert, LogOut, MonitorSmartphone, TriangleAlert } from 'lucide-react';
import { accountApi } from '@/data/accounts';
import { useAuth, useRequireLogin } from '@/store/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LoadingScreen } from '@/components/ui/Layout';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/utils/media';
import { formatBytes } from '@/utils/format';

const joined = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

/** `/profile` — who you are, what you're using, and the account's security settings. */
export default function ProfilePage() {
  const auth = useAuth();
  useEffect(() => {
    document.title = 'Profile — Birthday Studio';
  }, []);

  const blocked = useRequireLogin('/profile');
  if (blocked) return <LoadingScreen dark={false} />;

  if (!auth.accountsEnabled || !auth.user) {
    return (
      <div className="min-h-dvh bg-[#f4efe6] text-[#24201b]">
        <SiteHeader width="max-w-4xl" />
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
          <h1 className="font-display text-4xl">Accounts aren’t switched on here</h1>
          <p className="mt-3 text-[#5b5348]">You can use the studio without logging in.</p>
          <Link href="/create" className="mt-6 inline-flex font-semibold underline underline-offset-4">
            Open the studio
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f4efe6] text-[#24201b]">
      <SiteHeader active="profile" width="max-w-4xl" />
      <main className="mx-auto max-w-4xl space-y-12 px-4 pb-24 sm:px-8">
        <Identity />
        <Usage />
        <NameForm />
        <PasswordForm />
        <Devices />
        <DeleteAccount />
      </main>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="border-t border-[#24201b]/20 pt-8">
      <h2 id={id} className="font-display text-2xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-3 flex items-start gap-1.5 text-sm font-medium text-rose-700">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {message}
    </p>
  );
}

// ── Identity ─────────────────────────────────────────────────────────────────

function Identity() {
  const auth = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const user = auth.user!;

  const resend = async () => {
    setBusy(true);
    try {
      await accountApi!.resendVerification();
      toast('Sent. Check your inbox (and spam).', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="who" className="pt-6 sm:pt-12">
      <div className="flex flex-wrap items-center gap-5">
        <span aria-hidden className="inline-flex size-16 items-center justify-center rounded-full bg-[#24201b] font-display text-3xl text-[#f4efe6]">
          {(user.name.trim()[0] ?? user.email[0]).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 id="who" className="truncate font-display text-4xl leading-tight sm:text-5xl">
            {user.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#5b5348]">
            <span className="truncate">{user.email}</span>
            {auth.emailEnabled &&
              (user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                  <CircleCheck className="size-3.5" aria-hidden /> Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  <CircleAlert className="size-3.5" aria-hidden /> Not confirmed
                </span>
              ))}
          </p>
          {joined(user.createdAt) && <p className="mt-1 text-sm text-[#8a7f70]">Member since {joined(user.createdAt)}</p>}
        </div>
      </div>
      {auth.emailEnabled && !user.emailVerified && (
        <div role="status" className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="flex-1">Confirm your address so you can reset your password by email if you ever forget it.</p>
          <Button size="sm" variant="secondary" loading={busy} onClick={() => void resend()}>
            Send the link again
          </Button>
        </div>
      )}
    </section>
  );
}

// ── Usage ────────────────────────────────────────────────────────────────────

function Usage() {
  const auth = useAuth();
  const [stats, setStats] = useState<{ works: number; published: number; used: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([accountApi!.listWorks(), accountApi!.library()])
      .then(([works, library]) => {
        if (!cancelled) setStats({ works: works.length, published: works.filter((w) => w.shareId).length, used: library.usedBytes });
      })
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const limits = auth.limits;
  const cells: Array<[string, string, string]> = stats
    ? [
        ['Birthdays', String(stats.works), limits ? `of ${limits.maxWorks}` : ''],
        ['Published', String(stats.published), 'with a share link'],
        ['Library', formatBytes(stats.used), limits ? `of ${formatBytes(limits.maxLibraryBytes)}` : ''],
      ]
    : [];

  return (
    <Section id="usage" title="What you’re using">
      {error ? (
        <Problem message={error} />
      ) : !stats ? (
        <p role="status" className="text-[#5b5348]">
          Loading…
        </p>
      ) : (
        <dl className="grid grid-cols-3 gap-4">
          {cells.map(([label, value, hint]) => (
            <div key={label} className="rounded-xl border border-[#24201b]/15 bg-white p-4">
              <dt className="text-sm text-[#5b5348]">{label}</dt>
              <dd className="mt-1 font-display text-3xl">{value}</dd>
              <dd className="text-xs text-[#8a7f70]">{hint}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
        <Link href="/dashboard" className="underline underline-offset-4">
          My birthdays
        </Link>
        <Link href="/dashboard?tab=library" className="underline underline-offset-4">
          Photo &amp; music library
        </Link>
      </p>
    </Section>
  );
}

// ── Name ─────────────────────────────────────────────────────────────────────

function NameForm() {
  const auth = useAuth();
  const toast = useToast();
  const [name, setName] = useState(auth.user!.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await accountApi!.updateProfile(name);
      setName(user.name);
      await auth.refresh();
      toast('Name saved.', 'success');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="name" title="Your name">
      <form onSubmit={save} className="max-w-md space-y-4" noValidate>
        <Input label="Name" autoComplete="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
        <Input label="Email" type="email" value={auth.user!.email} readOnly hint="Your email is how you log in. It can’t be changed here yet." className="h-12 bg-[#f4efe6]" />
        {error && <Problem message={error} />}
        <Button type="submit" variant="primary" loading={busy} disabled={name.trim() === auth.user!.name || !name.trim()}>
          Save name
        </Button>
      </form>
    </Section>
  );
}

// ── Password ─────────────────────────────────────────────────────────────────

function PasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await accountApi!.changePassword(current, next);
      setCurrent('');
      setNext('');
      toast('Password changed. Your other devices were signed out.', 'success');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section id="password" title="Password">
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <Input label="Current password" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className="h-12" />
        <Input label="New password" type="password" autoComplete="new-password" required minLength={10} maxLength={200} hint="At least 10 characters." value={next} onChange={(e) => setNext(e.target.value)} className="h-12" />
        {error && <Problem message={error} />}
        <Button type="submit" variant="primary" loading={busy}>
          Change password
        </Button>
      </form>
    </Section>
  );
}

// ── Devices ──────────────────────────────────────────────────────────────────

function Devices() {
  const auth = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState<'others' | 'logout' | null>(null);

  const others = async () => {
    setBusy('others');
    try {
      await accountApi!.logoutOthers();
      toast('Signed out everywhere else.', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    setBusy('logout');
    try {
      await auth.logout();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Section id="devices" title="Signing out">
      <p className="max-w-xl text-[#5b5348]">You stay signed in on this device until you log out or the session expires.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" loading={busy === 'logout'} onClick={() => void logout()} icon={<LogOut className="size-4" aria-hidden />}>
          Log out
        </Button>
        <Button variant="secondary" loading={busy === 'others'} onClick={() => void others()} icon={<MonitorSmartphone className="size-4" aria-hidden />}>
          Sign out other devices
        </Button>
      </div>
    </Section>
  );
}

// ── Delete ───────────────────────────────────────────────────────────────────

function DeleteAccount() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.deleteAccount(password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Section id="delete" title="Delete account">
      <p className="max-w-xl text-[#5b5348]">
        This removes your account, every birthday, your whole library and all share links, right away. It can’t be undone.
      </p>
      {!confirming ? (
        <Button className="mt-4" variant="danger" onClick={() => setConfirming(true)}>
          Delete my account…
        </Button>
      ) : (
        <form onSubmit={remove} className="mt-4 max-w-md space-y-4 rounded-md border border-red-200 bg-red-50 p-4">
          <Input label="Enter your password to confirm" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
          {error && <Problem message={error} />}
          <div className="flex gap-2">
            <Button type="submit" variant="danger" loading={busy}>
              Delete everything
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Section>
  );
}
