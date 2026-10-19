'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { Copy, ExternalLink, FolderOpen, Music, Pencil, Plus, Trash2, TriangleAlert, Upload } from 'lucide-react';
import { accountApi } from '@/data/accounts';
import type { Library, WorkSummary } from '@/data/api/accountApi';
import { isTemplateId } from '@/data/normalizeConfig';
import { draftStorage } from '@/data/repository';
import { parseDataUrl } from '@/data/configMedia';
import { getTemplate } from '@/templates/registry';
import { useAuth, useRequireLogin } from '@/store/AuthProvider';
import { useDraft } from '@/store/DraftProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LoadingScreen } from '@/components/ui/Layout';
import { useToast } from '@/components/ui/Toast';
import { IMAGE_ACCEPT, AUDIO_ACCEPT, compressImage, errorMessage, readAudioFile } from '@/utils/media';
import { formatBytes } from '@/utils/format';
import { cn } from '@/utils/cn';

type Tab = 'birthdays' | 'library';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'birthdays', label: 'My birthdays' },
  { id: 'library', label: 'Library' },
];

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** `/dashboard` — the signed-in user's birthdays, media library and account. */
export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = params.get('tab') === 'library' ? 'library' : 'birthdays';
  const setTab = (next: Tab) => router.replace(next === 'library' ? '/dashboard?tab=library' : '/dashboard', { scroll: false });

  useEffect(() => {
    document.title = 'My birthdays — Birthday Studio';
  }, []);

  const blocked = useRequireLogin('/dashboard');
  if (blocked) return <LoadingScreen dark={false} />;

  if (!auth.accountsEnabled || !auth.user) {
    return (
      <div className="min-h-dvh bg-[#f4efe6] text-[#24201b]">
        <SiteHeader width="max-w-6xl" />
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
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
      <SiteHeader active="dashboard" width="max-w-6xl" />

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Hello, {auth.user.name}.</h1>
        <VerifyEmailBanner />
        <div role="tablist" aria-label="Dashboard" className="mt-8 flex gap-1 border-b border-[#24201b]/20">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-4 py-3 text-sm font-semibold',
                tab === t.id ? 'border-[#24201b] text-[#24201b]' : 'border-transparent text-[#8a7f70] hover:text-[#24201b]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-8">
          {tab === 'birthdays' && <Birthdays />}
          {tab === 'library' && <LibraryTab />}
        </div>
      </main>
    </div>
  );
}

// ── Birthdays ────────────────────────────────────────────────────────────────

function Birthdays() {
  const router = useRouter();
  const toast = useToast();
  const draft = useDraft();
  const [works, setWorks] = useState<WorkSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const load = useCallback(async () => {
    try {
      setWorks(await accountApi!.listWorks());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (id: string) => {
    try {
      if (await draft.openWork(id)) router.push('/create');
      else {
        toast('That birthday no longer exists.', 'error');
        void load();
      }
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const create = async () => {
    try {
      await draft.newWork();
      router.push('/templates');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const duplicate = async (id: string) => {
    try {
      await accountApi!.duplicateWork(id);
      toast('Duplicated. The copy is a private draft.', 'success');
      void load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const remove = async (id: string) => {
    try {
      await accountApi!.deleteWork(id);
      // If it was the one open in the studio, leave the studio with a blank page rather than a ghost.
      if (draft.workId === id) await draft.newWork();
      setConfirming(null);
      toast('Birthday deleted.', 'success');
      void load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const rename = async (e: FormEvent, id: string) => {
    e.preventDefault();
    try {
      await accountApi!.renameWork(id, title);
      setRenaming(null);
      void load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (error) return <Problem message={error} />;
  if (!works) return <p role="status" className="text-[#5b5348]">Loading your birthdays…</p>;

  return (
    <>
      <ClaimBanner onClaimed={() => void load()} />
      {works.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#24201b]/30 bg-white/60 p-8 sm:p-12">
          <h2 className="font-display text-3xl leading-tight">Make your first birthday</h2>
          <ol className="mt-4 max-w-xl space-y-2 text-[#5b5348]">
            <li>
              <strong className="text-[#24201b]">1. Pick an experience.</strong> Preview any of the templates with sample photos.
            </li>
            <li>
              <strong className="text-[#24201b]">2. Add your photos, words and a song.</strong> It saves to your account as you go.
            </li>
            <li>
              <strong className="text-[#24201b]">3. Publish and share the link.</strong> It stays private until you do.
            </li>
          </ol>
          <Button className="mt-6" variant="primary" size="lg" onClick={() => void create()} icon={<Plus className="size-5" aria-hidden />}>
            Choose a template
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[#5b5348]">{works.length} saved</p>
          <Button variant="primary" onClick={() => void create()} icon={<Plus className="size-4" aria-hidden />}>
            New birthday
          </Button>
        </div>
      )}

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w) => {
          const template = isTemplateId(w.templateId) ? getTemplate(w.templateId) : null;
          return (
            <li key={w.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#24201b]/15 bg-white">
              <button
                type="button"
                onClick={() => void open(w.id)}
                aria-label={`Edit ${w.title}`}
                className="relative block aspect-[16/10] w-full overflow-hidden bg-[#e4dccd] text-left"
                style={template ? { background: `linear-gradient(135deg, ${template.palette.primary}, ${template.palette.secondary})` } : undefined}
              >
                {w.heroImage && <img src={w.heroImage} alt="" loading="lazy" className="size-full object-cover" />}
                <span
                  className={cn(
                    'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase',
                    w.shareId ? 'bg-emerald-100 text-emerald-900' : 'bg-white/90 text-[#5b5348]',
                  )}
                >
                  {w.shareId ? 'Published' : 'Draft'}
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-3 p-4">
                {renaming === w.id ? (
                  <form onSubmit={(e) => void rename(e, w.id)} className="flex gap-2">
                    <Input label="Name" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} wrapperClassName="flex-1" autoFocus />
                    <Button type="submit" size="sm" variant="primary" className="self-end">
                      Save
                    </Button>
                  </form>
                ) : (
                  <div>
                    <h2 className="truncate font-display text-xl">{w.title}</h2>
                    <p className="text-xs text-[#8a7f70]">
                      {template?.name ?? 'Birthday'} · edited {day(w.updatedAt)}
                    </p>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                  <button type="button" onClick={() => void open(w.id)} className="inline-flex items-center gap-1.5 underline underline-offset-4">
                    <Pencil className="size-3.5" aria-hidden /> Edit
                  </button>
                  {w.shareId && (
                    <a href={`/birthday/${w.shareId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-4">
                      <ExternalLink className="size-3.5" aria-hidden /> View
                    </a>
                  )}
                  <button type="button" onClick={() => void duplicate(w.id)} className="inline-flex items-center gap-1.5 text-[#5b5348] underline underline-offset-4">
                    <Copy className="size-3.5" aria-hidden /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenaming(w.id);
                      setTitle(w.title);
                    }}
                    className="text-[#5b5348] underline underline-offset-4"
                  >
                    Rename
                  </button>
                  <button type="button" onClick={() => setConfirming(w.id)} className="inline-flex items-center gap-1.5 text-rose-700 underline underline-offset-4">
                    <Trash2 className="size-3.5" aria-hidden /> Delete
                  </button>
                </div>
                {confirming === w.id && (
                  <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <p>
                      Delete “{w.title}”?{w.shareId ? ' Its share link stops working.' : ''} This can’t be undone.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="danger" onClick={() => void remove(w.id)}>
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                        Keep it
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Asks people to confirm their address, so a forgotten password can be reset by email. */
function VerifyEmailBanner() {
  const auth = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!auth.user || !auth.emailEnabled || auth.user.emailVerified) return null;

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
    <div role="status" className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="flex-1">
        Please confirm <strong>{auth.user.email}</strong>. We emailed you a link. It’s how you’ll reset your password if you forget it.
      </p>
      <Button size="sm" variant="secondary" loading={busy} onClick={() => void resend()}>
        Send it again
      </Button>
    </div>
  );
}

/**
 * Before accounts, publishing from this browser left a share id and an edit token in its saved draft.
 * Those prove the birthday is theirs, so it can be moved into the account with its link intact.
 */
function ClaimBanner({ onClaimed }: { onClaimed: () => void }) {
  const toast = useToast();
  const [found, setFound] = useState<{ shareId: string; editToken: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    draftStorage
      .load()
      .then((draft) => {
        if (!cancelled && draft?.shareId && draft.editToken) setFound({ shareId: draft.shareId, editToken: draft.editToken });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  /** The token has done its job (or won't ever), so this browser stops offering it. */
  const forget = async () => {
    const draft = await draftStorage.load().catch(() => null);
    if (draft) await draftStorage.save({ config: draft.config });
    setFound(null);
  };

  if (!found) return null;

  const claim = async () => {
    setBusy(true);
    try {
      await accountApi!.claimWork(found.shareId, found.editToken);
      await forget();
      toast('Added to your account. Its share link still works.', 'success');
      onClaimed();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="status" className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-[#24201b]/20 bg-white px-4 py-3 text-sm">
      <p className="flex-1">
        You published a birthday from this browser before accounts. Add it to your account to keep editing it. Its link keeps working.
      </p>
      <Button size="sm" variant="primary" loading={busy} onClick={() => void claim()}>
        Add to my account
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setFound(null)}>
        Not now
      </Button>
    </div>
  );
}

// ── Library ──────────────────────────────────────────────────────────────────

function LibraryTab() {
  const auth = useAuth();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLibrary(await accountApi!.library());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav)$/i.test(file.name);
        const dataUrl = isAudio ? await readAudioFile(file) : await compressImage(file);
        const media = parseDataUrl(dataUrl);
        if (!media) throw new Error('That file couldn’t be read.');
        await accountApi!.uploadToLibrary(media.bytes, media.type, file.name);
      }
      toast('Added to your library.', 'success');
      await load();
      void auth.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async (id: string) => {
    try {
      await accountApi!.deleteFromLibrary(id);
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error'); // e.g. "This file is used by …"
    }
  };

  if (error) return <Problem message={error} />;
  if (!library) return <p role="status" className="text-[#5b5348]">Loading your library…</p>;

  const percent = Math.min(100, Math.round((library.usedBytes / library.maxBytes) * 100));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-56">
          <p className="text-sm font-semibold">
            {formatBytes(library.usedBytes)} of {formatBytes(library.maxBytes)} used
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#24201b]/10" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Library space used">
            <div className="h-full bg-[#24201b]" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept={`${IMAGE_ACCEPT},${AUDIO_ACCEPT}`}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void upload(e.target.files)}
        />
        <Button variant="primary" loading={busy} onClick={() => input.current?.click()} icon={<Upload className="size-4" aria-hidden />}>
          Upload photos or music
        </Button>
      </div>

      {library.items.length === 0 ? (
        <p className="mt-8 flex items-center gap-2 text-[#5b5348]">
          <FolderOpen className="size-5" aria-hidden /> Your library is empty. Photos and songs you add in the studio are kept here.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {library.items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-[#24201b]/15 bg-white">
              {item.kind === 'image' ? (
                <img src={item.url} alt={item.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[#e4dccd]">
                  <Music className="size-8 text-[#5b5348]" aria-hidden />
                  <audio controls preload="none" src={item.url} className="w-[90%]" />
                </div>
              )}
              <div className="flex items-center gap-2 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-[#8a7f70]">{formatBytes(item.size)}</p>
                </div>
                <button type="button" onClick={() => void remove(item.id)} aria-label={`Delete ${item.name}`} className="rounded-md p-2 text-rose-700 hover:bg-rose-50">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-rose-700">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {message}
    </p>
  );
}
