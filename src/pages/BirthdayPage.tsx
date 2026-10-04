import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { BirthdayConfig } from '@/types/birthday';
import { birthdayRepository } from '@/data/repository';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { LoadingScreen } from '@/components/ui/Layout';

type State = { status: 'loading' } | { status: 'ready'; config: BirthdayConfig } | { status: 'missing' } | { status: 'error' };

/** `/birthday/:id` — what the recipient sees. No creator chrome. */
export default function BirthdayPage() {
  const { id = '' } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    birthdayRepository
      .get(id)
      .then((config) => !cancelled && setState(config ? { status: 'ready', config } : { status: 'missing' }))
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'ready') return <ExperienceShell config={state.config} mode="shared" />;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center">
      <div aria-hidden className="absolute size-[60vmin] rounded-full bg-brand/30 blur-3xl" />
      <div className="relative max-w-md">
        <p className="text-xs font-bold tracking-[0.3em] text-gold-soft uppercase">Birthday link</p>
        <h1 className="mt-4 font-display text-4xl text-white">
          {state.status === 'missing' ? 'This surprise couldn’t be found.' : 'We couldn’t load this surprise.'}
        </h1>
        <p className="mt-4 text-ink-300">
          {state.status === 'missing'
            ? birthdayRepository.kind === 'local'
              ? 'Links are currently saved in the browser they were created in. Ask the sender to open it on their device, or connect a backend to share across devices.'
              : 'The link may be mistyped or the birthday may have been removed.'
            : 'Please check your connection and try again.'}
        </p>
        <Link
          to="/templates"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-ink-900 hover:bg-white/90"
        >
          Create your own birthday surprise
        </Link>
      </div>
    </main>
  );
}
