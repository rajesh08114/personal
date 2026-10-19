'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, Music, TriangleAlert } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { accountApi } from '@/data/accounts';
import type { Library, LibraryItem } from '@/data/api/accountApi';
import { useAuth } from '@/store/AuthProvider';
import { errorMessage } from '@/utils/media';
import { formatBytes } from '@/utils/format';

/** True when the signed-in user has a media library to choose from. */
export function useLibraryEnabled(): boolean {
  const auth = useAuth();
  return !!accountApi && auth.accountsEnabled && !!auth.user;
}

interface LibraryPickerProps {
  open: boolean;
  onClose: () => void;
  kind: 'image' | 'audio';
  onPick: (item: LibraryItem) => void;
}

/** Choose a photo or song the user uploaded before, instead of uploading it again. */
export function LibraryPicker({ open, onClose, kind, onPick }: LibraryPickerProps) {
  const [library, setLibrary] = useState<Library | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !accountApi) return;
    let cancelled = false;
    setLibrary(null);
    setError(null);
    accountApi
      .library()
      .then((l) => !cancelled && setLibrary(l))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const items = library?.items.filter((i) => i.kind === kind) ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={kind === 'image' ? 'Your photos' : 'Your music'}
      description="Everything you’ve uploaded to your library. It’s private to your account."
      className="sm:max-w-2xl"
    >
      {error ? (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-rose-700">
          <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden /> {error}
        </p>
      ) : !library ? (
        <p role="status" className="flex items-center gap-2 text-sm text-ink-600">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading your library…
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-600">
          Nothing here yet. {kind === 'image' ? 'Photos' : 'Songs'} you upload in the studio are kept in your library.
        </p>
      ) : kind === 'image' ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="group block w-full overflow-hidden rounded-xl border border-ink-200 bg-white text-left hover:border-brand focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={item.url} alt={item.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <span className="block truncate px-2.5 py-1.5 text-xs font-medium text-ink-700">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left hover:border-brand focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Music className="size-5 shrink-0 text-brand" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">{item.name}</span>
                <span className="text-xs text-ink-500">{formatBytes(item.size)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
