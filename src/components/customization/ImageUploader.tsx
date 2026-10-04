import { useId, useRef, useState, type DragEvent } from 'react';
import { Crop, ImagePlus, LoaderCircle, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import type { PhotoFraming } from '@/types/birthday';
import { framingStyle } from '@/components/experience/photoFraming';
import { PhotoEditor } from './PhotoEditor';
import { compressImage, errorMessage, IMAGE_ACCEPT } from '@/utils/media';
import { cn } from '@/utils/cn';

interface ImageUploaderProps {
  value?: string;
  /** Called with the new photo (or undefined when removed). Parents should reset framing here too. */
  onChange: (value: string | undefined) => void;
  framing?: PhotoFraming;
  /** Enables the "Adjust" photo editor. */
  onFramingChange?: (framing: PhotoFraming | undefined) => void;
  /** Accessible name, e.g. "Hero photo". */
  label: string;
  /** Friendly empty-state title, e.g. "Add your hero photo". */
  emptyTitle: string;
  emptyHint?: string;
  aspect?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Drag-and-drop or tap-to-pick photo uploader. Validates type/size, compresses
 * the image, shows a preview with Replace / Remove, and explains any problem kindly.
 */
export function ImageUploader({
  value,
  onChange,
  framing,
  onFramingChange,
  label,
  emptyTitle,
  emptyHint = 'JPG, PNG or WEBP · drag & drop or tap',
  aspect = 'aspect-[4/3]',
  className,
  compact,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const errorId = useId();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  const pick = () => inputRef.current?.click();

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'group relative overflow-hidden rounded-2xl transition-all duration-200',
          aspect,
          dragging && 'ring-4 ring-brand/30',
        )}
      >
        {value ? (
          <>
            <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" style={framingStyle(framing)} />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-linear-to-t from-black/60 to-transparent p-2 pt-8">
              {onFramingChange && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/95 text-xs font-semibold text-ink-900 shadow hover:bg-white',
                    compact ? 'w-9 justify-center' : 'px-3',
                  )}
                  aria-label={`Adjust ${label.toLowerCase()}`}
                >
                  <Crop className="size-3.5" aria-hidden /> {!compact && 'Adjust'}
                </button>
              )}
              <button
                type="button"
                onClick={pick}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/95 text-xs font-semibold text-ink-900 shadow hover:bg-white',
                  compact || onFramingChange ? 'w-9 justify-center' : 'px-3',
                )}
                aria-label={`Replace ${label.toLowerCase()}`}
                title="Replace"
              >
                <RefreshCw className="size-3.5" aria-hidden /> {!compact && !onFramingChange && 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setError(null);
                }}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-white/95 text-rose-700 shadow hover:bg-white"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pick}
            aria-describedby={error ? errorId : undefined}
            aria-label={`${emptyTitle} (${label})`}
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 text-center transition-colors duration-200',
              dragging ? 'border-brand bg-brand-soft' : 'border-ink-200 bg-paper-2/60 hover:border-brand/50 hover:bg-brand-soft/50',
            )}
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-brand shadow-sm transition-transform duration-200 group-hover:scale-110">
              <ImagePlus className="size-5" aria-hidden />
            </span>
            <span className={cn('font-semibold text-ink-800', compact ? 'text-xs' : 'text-sm')}>{emptyTitle}</span>
            {!compact && <span className="text-xs text-ink-500">{emptyHint}</span>}
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm" role="status">
            <LoaderCircle className="size-6 animate-spin text-brand" aria-hidden />
            <span className="text-xs font-semibold text-ink-700">Optimising photo…</span>
          </div>
        )}
      </div>
      {onFramingChange && (
        <PhotoEditor open={editing} src={value} framing={framing} label={label} onClose={() => setEditing(false)} onSave={onFramingChange} />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-700">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
