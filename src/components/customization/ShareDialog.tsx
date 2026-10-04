import { useRef, useState } from 'react';
import { Check, CircleAlert, Copy, Download, ExternalLink, FileUp, Link2, Share2 } from 'lucide-react';
import type { BirthdayConfig } from '@/types/birthday';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { birthdayRepository } from '@/data/repository';
import { normalizeConfig } from '@/data/normalizeConfig';
import { getReadiness } from '@/utils/readiness';
import { errorMessage } from '@/utils/media';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  shareId?: string;
  onSaved: (id: string) => void;
  onImport: (config: BirthdayConfig) => void;
  onJump: (section: string) => void;
}

export function ShareDialog({ open, onClose, config, shareId, onSaved, onImport, onJump }: ShareDialogProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<string | null>(shareId ? `${window.location.origin}/birthday/${shareId}` : null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const missing = getReadiness(config).filter((r) => !r.done);

  const save = async () => {
    setSaving(true);
    try {
      const id = await birthdayRepository.save(config, shareId);
      onSaved(id);
      setLink(`${window.location.origin}/birthday/${id}`);
      toast(shareId ? 'Your birthday link has been updated.' : 'Your birthday link is ready!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Copy failed — select the link and copy it manually.', 'error');
    }
  };

  const nativeShare = async () => {
    if (!link) return;
    try {
      await navigator.share({
        title: config.birthdayPerson ? `Happy Birthday, ${config.birthdayPerson}!` : 'A birthday surprise',
        text: 'Someone made something special for you…',
        url: link,
      });
    } catch {
      /* user cancelled */
    }
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(config)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-${(config.birthdayPerson || 'surprise').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      onImport(normalizeConfig(parsed));
      toast('Birthday imported.', 'success');
      onClose();
    } catch {
      toast('That file isn’t a valid birthday backup.', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share birthday website" description="Create a private link to send to the birthday person.">
      {missing.length > 0 && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CircleAlert className="size-4" aria-hidden /> A few personal touches are still placeholders
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
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-800">You can share anyway — anything missing shows as a visible placeholder.</p>
        </div>
      )}

      {link ? (
        <div className="space-y-3">
          <label htmlFor="share-link" className="text-sm font-semibold text-ink-800">
            Your birthday link
          </label>
          <div className="flex gap-2">
            <input
              id="share-link"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="h-11 min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 font-mono text-sm text-ink-700"
            />
            <Button variant="primary" onClick={copy} icon={copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {'share' in navigator && (
              <Button variant="secondary" size="sm" onClick={nativeShare} icon={<Share2 className="size-4" aria-hidden />}>
                Share…
              </Button>
            )}
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-900 hover:bg-ink-100/60"
            >
              <ExternalLink className="size-4" aria-hidden /> Open
            </a>
            <Button variant="ghost" size="sm" onClick={save} loading={saving}>
              Update link with latest changes
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="brand" size="lg" className="w-full" onClick={save} loading={saving} icon={<Link2 className="size-5" aria-hidden />}>
          Create birthday link
        </Button>
      )}

      {birthdayRepository.kind === 'local' && (
        <p className="mt-4 rounded-xl bg-paper-2 p-3 text-xs leading-relaxed text-ink-600">
          Links are saved in this browser until a backend is connected (see README). To move a birthday to another device,
          download a backup below and import it there.
        </p>
      )}

      <div className="mt-6 border-t border-ink-200 pt-5">
        <p className="text-sm font-semibold text-ink-800">Backup</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportFile} icon={<Download className="size-4" aria-hidden />}>
            Download backup
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} icon={<FileUp className="size-4" aria-hidden />}>
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => void importFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </Modal>
  );
}
