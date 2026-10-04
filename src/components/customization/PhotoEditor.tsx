import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import type { PhotoFraming } from '@/types/birthday';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DEFAULT_FRAMING, framingStyle } from '@/components/experience/photoFraming';
import { normalizeFraming } from '@/data/normalizeConfig';
import { cn } from '@/utils/cn';

interface PhotoEditorProps {
  open: boolean;
  src?: string;
  framing?: PhotoFraming;
  label: string;
  onClose: () => void;
  /** Receives undefined when the photo is back to its default framing. */
  onSave: (framing: PhotoFraming | undefined) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/** Drag to reposition, pinch/scroll to zoom, fit/fill, straighten. Settings apply in every template. */
export function PhotoEditor({ open, src, framing, label, onClose, onSave }: PhotoEditorProps) {
  return (
    <Modal open={open} onClose={onClose} title="Adjust photo" description={`Frame your ${label.toLowerCase()}.`} className="sm:max-w-2xl">
      {src && (
        <EditorBody
          src={src}
          initial={framing}
          onCancel={onClose}
          onDone={(f) => {
            onSave(normalizeFraming(f));
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function EditorBody({ src, initial, onCancel, onDone }: { src: string; initial?: PhotoFraming; onCancel: () => void; onDone: (f: PhotoFraming) => void }) {
  const [f, setF] = useState<PhotoFraming>(() => structuredClone(initial ?? DEFAULT_FRAMING));
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  const setZoom = (zoom: number) => setF((p) => ({ ...p, zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }));

  /**
   * Converts an on-screen drag (px) into a focal-point change (%), so the photo
   * tracks the finger exactly. Accounts for object-fit overflow and zoom.
   */
  const pan = (dx: number, dy: number) => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img?.naturalWidth) return;
    const { width: W, height: H } = frame.getBoundingClientRect();
    const { naturalWidth: iw, naturalHeight: ih } = img;
    setF((p) => {
      const base = p.fit === 'cover' ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
      const denX = W * (p.zoom - 1) + p.zoom * (iw * base - W);
      const denY = H * (p.zoom - 1) + p.zoom * (ih * base - H);
      return {
        ...p,
        position: {
          x: Math.abs(denX) < 1 ? p.position.x : clamp(p.position.x - (dx * 100) / denX, 0, 100),
          y: Math.abs(denY) < 1 ? p.position.y : clamp(p.position.y - (dy * 100) / denY, 0, 100),
        },
      };
    });
  };

  // Wheel / trackpad zoom (needs a non-passive listener to stop the page scrolling).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setF((p) => ({ ...p, zoom: clamp(p.zoom * Math.exp(-e.deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM) }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const pts = pointers.current;
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    if (pts.size === 1) {
      pan(e.clientX - prev.x, e.clientY - prev.y);
    } else if (pts.size === 2) {
      const other = [...pts.entries()].find(([id]) => id !== e.pointerId)?.[1];
      if (other) {
        const before = Math.hypot(prev.x - other.x, prev.y - other.y);
        const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        if (before > 0) setF((p) => ({ ...p, zoom: clamp(p.zoom * (after / before), MIN_ZOOM, MAX_ZOOM) }));
      }
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const move = (dx: number, dy: number) =>
      setF((p) => ({ ...p, position: { x: clamp(p.position.x + dx, 0, 100), y: clamp(p.position.y + dy, 0, 100) } }));
    const actions: Record<string, () => void> = {
      ArrowLeft: () => move(step, 0),
      ArrowRight: () => move(-step, 0),
      ArrowUp: () => move(0, step),
      ArrowDown: () => move(0, -step),
      '+': () => setZoom(f.zoom + 0.1),
      '=': () => setZoom(f.zoom + 0.1),
      '-': () => setZoom(f.zoom - 0.1),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const style = framingStyle(f);

  return (
    <div className="space-y-5">
      <div
        ref={frameRef}
        tabIndex={0}
        role="group"
        aria-label="Photo position. Drag to move, scroll or pinch to zoom. Arrow keys move, plus and minus zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          'relative mx-auto aspect-[4/3] w-full touch-none overflow-hidden rounded-md bg-ink-900 select-none',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <img ref={imgRef} src={src} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" style={style} />
        {/* Rule-of-thirds guide while moving. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-200',
            'bg-[linear-gradient(to_right,transparent_33.1%,rgb(255_255_255/0.45)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.45)_66.7%,transparent_66.9%),linear-gradient(to_bottom,transparent_33.1%,rgb(255_255_255/0.45)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.45)_66.7%,transparent_66.9%)]',
            dragging ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div className="flex items-end justify-center gap-4" aria-hidden>
        {[
          ['aspect-square w-14', 'Square'],
          ['aspect-[4/5] w-12', 'Print'],
          ['aspect-video w-20', 'Wide'],
        ].map(([cls, name]) => (
          <figure key={name} className="text-center">
            <div className={cn('overflow-hidden rounded-sm bg-ink-900', cls)}>
              <img src={src} alt="" className="h-full w-full object-cover" style={style} />
            </div>
            <figcaption className="mt-1 text-[0.65rem] font-medium tracking-wide text-ink-500 uppercase">{name}</figcaption>
          </figure>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink-800">
          Zoom <span className="font-normal text-ink-500 tabular-nums">{f.zoom.toFixed(1)}×</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={f.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-2 block w-full accent-ink-900"
          />
        </label>
        <label className="block text-sm font-semibold text-ink-800">
          Rotate <span className="font-normal text-ink-500 tabular-nums">{(f.rotation ?? 0).toFixed(1)}°</span>
          <input
            type="range"
            min={-45}
            max={45}
            step={0.5}
            value={f.rotation ?? 0}
            onChange={(e) => setF((p) => ({ ...p, rotation: Number(e.target.value) }))}
            className="mt-2 block w-full accent-ink-900"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Fit" className="inline-flex rounded-md border border-ink-200 p-0.5">
          {(['cover', 'contain'] as const).map((fit) => (
            <button
              key={fit}
              type="button"
              aria-pressed={f.fit === fit}
              onClick={() => setF((p) => ({ ...p, fit }))}
              className={cn(
                'h-9 rounded px-3 text-sm font-semibold transition-colors',
                f.fit === fit ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              {fit === 'cover' ? 'Fill frame' : 'Show whole photo'}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setF(structuredClone(DEFAULT_FRAMING))} icon={<RotateCcw className="size-4" aria-hidden />}>
          Reset
        </Button>
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-200 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onDone(f)}>
          Done
        </Button>
      </div>
    </div>
  );
}
