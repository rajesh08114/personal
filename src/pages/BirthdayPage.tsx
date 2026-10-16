import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { BirthdayConfig } from '@/types/birthday';
import { experienceRepository, localRepository, storageMode } from '@/data/repository';
import { readBackupFile, BackupError } from '@/data/backup';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { LoadingScreen } from '@/components/ui/Layout';

type State =
  | { status: 'loading' }
  | { status: 'ready'; config: BirthdayConfig }
  | { status: 'missing'; importError?: string }
  | { status: 'error' };

/** `/birthday/:id` — what the recipient sees. No creator chrome. */
export default function BirthdayPage() {
  const { id = '' } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });
  const fileRef = useRef<HTMLInputElement>(null);

  // Personal pages should never appear in search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    experienceRepository
      .get(id)
      .then((config) => !cancelled && setState(config ? { status: 'ready', config } : { status: 'missing' }))
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Local mode: restore a backup into this browser under this link's id, so the link works here from now on. */
  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const { config } = await readBackupFile(file);
      await localRepository.save(config, id);
      setState({ status: 'ready', config });
    } catch (err) {
      setState({ status: 'missing', importError: err instanceof BackupError ? err.message : 'That backup couldn’t be imported.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'ready') return <ExperienceShell config={state.config} mode="shared" />;

  const local = storageMode === 'local';

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f4efe6] px-6 text-center text-[#2b2620]">
      <div className="max-w-md">
        <p className="font-mono text-xs tracking-[0.25em] text-[#8a7f70] uppercase">Birthday link</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">
          {state.status === 'error' ? 'We couldn’t load this surprise.' : local ? 'This surprise isn’t in this browser.' : 'This surprise couldn’t be found.'}
        </h1>
        <p className="mt-4 leading-relaxed text-[#5b5348]">
          {state.status === 'error'
            ? 'Please check your connection and try again.'
            : local
              ? 'This link was made in Local Share Mode, so the birthday is saved only on the device that created it. If you were sent a backup file, import it here to open it.'
              : 'The link may be mistyped, or the birthday may have been removed.'}
        </p>
        {state.status === 'missing' && state.importError && (
          <p role="alert" className="mt-4 text-sm font-medium text-[#9b2c1f]">
            {state.importError}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3">
          {state.status === 'missing' && local && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-12 items-center rounded-md bg-[#2b2620] px-6 font-semibold text-[#f4efe6] hover:bg-[#3d362d]"
              >
                Import backup file
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => void importBackup(e.target.files?.[0])}
              />
            </>
          )}
          <Link to="/templates" className="text-sm font-semibold underline underline-offset-4 hover:text-black">
            Create your own birthday surprise
          </Link>
        </div>
      </div>
    </main>
  );
}
