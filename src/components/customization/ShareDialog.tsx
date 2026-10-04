import { useRef, useState } from 'react';
import { Check, CircleAlert, Copy, Download, ExternalLink, FileUp, HardDrive, Globe2, Share2 } from 'lucide-react';
import type { BirthdayConfig } from '@/types/birthday';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { experienceRepository, storageMode } from '@/data/repository';
import { downloadBackup, readBackupFile, BackupError } from '@/data/backup';
import { getReadiness } from '@/utils/readiness';
import { cn } from '@/utils/cn';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  shareId?: string;
  onSaved: (id: string) => void;
  onImport: (config: BirthdayConfig, shareId?: string) => void;
  onJump: (section: string) => void;
}

const linkFor = (id: string) => `${window.location.origin}/birthday/${id}`;

export function ShareDialog({ open, onClose, config, shareId, onSaved, onImport, onJump }: ShareDialogProps) {
  const toast = useToast();
  const local = storageMode === 'local';
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(shareId);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const missing = getReadiness(config).filter((r) => !r.done);
  const link = savedId ? linkFor(savedId) : null;

  /** Saves (or re-saves) the current draft and returns its id. */
  const save = async (): Promise<string | null> => {
    setBusy(true);
    try {
      const id = await experienceRepository.save(config, savedId);
      setSavedId(id);
      onSaved(id);
      return id;
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Saving failed. Please try again.', 'error');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const copy = async (id?: string | null) => {
    const target = id ?? savedId;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(linkFor(target));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast(local ? 'Local link copied — it opens in this browser only.' : 'Share link copied.', 'success');
    } catch {
      toast('Copy failed — select the link and copy it manually.', 'error');
    }
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const { config: imported, shareId: importedId } = await readBackupFile(file);
      onImport(imported, importedId);
      toast(`Imported ${imported.birthdayPerson.trim() ? `${imported.birthdayPerson}’s` : 'the'} birthday.`, 'success');
      onClose();
    } catch (err) {
      toast(err instanceof BackupError ? err.message : 'That backup couldn’t be imported.', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={local ? 'Share your birthday experience' : link ? 'Your birthday experience is ready to share' : 'Share your birthday experience'}
      description={local || link ? undefined : 'Publish it to the server to get a link that works on any device.'}
    >
      <p
        className={cn(
          'mb-5 inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
          local ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900',
        )}
      >
        {local ? <HardDrive className="size-3.5" aria-hidden /> : <Globe2 className="size-3.5" aria-hidden />}
        {local ? 'Local share mode' : 'Server mode'}
      </p>

      {missing.length > 0 && (
        <div className="mb-5 border-l-2 border-amber-400 bg-amber-50 py-3 pr-3 pl-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CircleAlert className="size-4" aria-hidden /> Some details still show placeholders
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onJump(m.section);
                    onClose();
                  }}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {local ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-700">
            This version is stored <strong>only in this browser</strong>. The link below will open here, but not on
            anyone else’s phone or computer.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">
            <li>Download the backup.</li>
            <li>Open this website on the other device.</li>
            <li>Choose “Import backup” and pick the file.</li>
          </ol>
          {link && (
            <input
              aria-label="Local link"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 font-mono text-xs text-ink-600"
            />
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              loading={busy}
              onClick={async () => copy(await save())}
              icon={copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            >
              {copied ? 'Copied' : 'Copy local link'}
            </Button>
            <Button variant="primary" onClick={() => downloadBackup(config, savedId)} icon={<Download className="size-4" aria-hidden />}>
              Download backup
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-ink-500">
            The backup is a single <code>.json</code> file with every photo, message, photo position and song inside it.
            To make links work everywhere, connect a server (see README → Server mode).
          </p>
        </div>
      ) : link ? (
        <div className="space-y-3">
          <input
            aria-label="Share link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 font-mono text-sm text-ink-700"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="primary" onClick={() => copy()} icon={copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}>
              {copied ? 'Copied' : 'Copy share link'}
            </Button>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-900 hover:bg-ink-100/60"
            >
              <ExternalLink className="size-4" aria-hidden /> Open experience
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {'share' in navigator && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Share2 className="size-4" aria-hidden />}
                onClick={() => navigator.share({ title: config.birthdayPerson ? `For ${config.birthdayPerson}` : 'A birthday surprise', url: link }).catch(() => undefined)}
              >
                Share…
              </Button>
            )}
            <Button variant="ghost" size="sm" loading={busy} onClick={() => void save().then((id) => id && toast('Link updated with your latest changes.', 'success'))}>
              Update with latest changes
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="brand" size="lg" className="w-full" loading={busy} onClick={() => void save()} icon={<Globe2 className="size-5" aria-hidden />}>
          Publish & create share link
        </Button>
      )}

      <div className="mt-6 border-t border-ink-200 pt-5">
        <p className="text-sm font-semibold text-ink-800">Backup</p>
        <p className="mt-1 text-xs text-ink-500">Move a birthday between devices, or keep a copy safe.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!local && (
            <Button variant="secondary" size="sm" onClick={() => downloadBackup(config, savedId)} icon={<Download className="size-4" aria-hidden />}>
              Download backup
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} icon={<FileUp className="size-4" aria-hidden />}>
            Import backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => void importFile(e.target.files?.[0])} />
        </div>
      </div>
    </Modal>
  );
}
