import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { Memory } from '@/types/birthday';
import { Input } from '@/components/ui/Field';
import { Button, IconButton } from '@/components/ui/Button';
import { ImageUploader } from './ImageUploader';

interface MemoryEditorProps {
  items: Memory[];
  onChange: (items: Memory[]) => void;
  create: () => Memory;
  max: number;
  /** Wording, e.g. "Memory" or "Chapter". */
  noun: string;
  titlePlaceholder: string;
  captionPlaceholder: string;
  emptyPhotoTitle: (index: number) => string;
}

/** Add, edit, reorder and remove memories (also used for timeline chapters). */
export function MemoryEditor({
  items,
  onChange,
  create,
  max,
  noun,
  titlePlaceholder,
  captionPlaceholder,
  emptyPhotoTitle,
}: MemoryEditorProps) {
  const update = (id: string, patch: Partial<Memory>) => onChange(items.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-2xl bg-paper-2 p-4 text-sm text-ink-600">
          No {noun.toLowerCase()}s yet. The website will show tasteful placeholders until you add one.
        </p>
      )}
      <ol className="space-y-4">
        {items.map((m, i) => (
          <li key={m.id} className="rounded-2xl border border-ink-200 bg-paper/60 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-[0.16em] text-ink-500 uppercase">
                {noun} {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-0.5">
                <IconButton size="sm" label={`Move ${noun.toLowerCase()} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="size-4" aria-hidden />
                </IconButton>
                <IconButton
                  size="sm"
                  label={`Move ${noun.toLowerCase()} ${i + 1} down`}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </IconButton>
                <IconButton
                  size="sm"
                  label={`Remove ${noun.toLowerCase()} ${i + 1}`}
                  onClick={() => onChange(items.filter((x) => x.id !== m.id))}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
              <ImageUploader
                value={m.image}
                onChange={(image) => update(m.id, { image })}
                label={`${noun} ${i + 1} photo`}
                emptyTitle={emptyPhotoTitle(i)}
                aspect="aspect-[4/3] sm:aspect-square"
                compact
              />
              <div className="space-y-3">
                <Input
                  label="Title"
                  maxLength={120}
                  value={m.title}
                  onChange={(e) => update(m.id, { title: e.target.value })}
                  placeholder={titlePlaceholder}
                />
                <Input
                  label="Caption"
                  maxLength={400}
                  value={m.description}
                  onChange={(e) => update(m.id, { description: e.target.value })}
                  placeholder={captionPlaceholder}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {items.length < max ? (
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden />} onClick={() => onChange([...items, create()])} className="w-full">
          Add another {noun.toLowerCase()}
        </Button>
      ) : (
        <p className="text-center text-xs text-ink-500">You’ve reached the maximum of {max}.</p>
      )}
    </div>
  );
}
