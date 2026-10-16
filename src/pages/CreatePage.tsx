import { Suspense, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  CloudAlert,
  Eye,
  LayoutGrid,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Share2,
  CircleCheck,
} from 'lucide-react';
import { useDraft } from '@/store/DraftProvider';
import { BirthdayForm, type SectionId } from '@/components/customization/BirthdayForm';
import { LivePreview, type Device } from '@/components/customization/LivePreview';
import { Button } from '@/components/ui/Button';
import { LoadingScreen, SegmentedControl } from '@/components/ui/Layout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getReadiness } from '@/utils/readiness';
import { localRepository, storageMode } from '@/data/repository';
import { lazyChunk } from '@/utils/lazyChunk';

// Only needed once the creator clicks Share, so it is its own chunk.
const ShareDialog = lazyChunk(() =>
  import('@/components/customization/ShareDialog').then((m) => ({ default: m.ShareDialog })),
);
import { cn } from '@/utils/cn';

/** `/create` — the Birthday Studio: customise everything with a live preview. */
export default function CreatePage() {
  const { config, ready, status, saveError, shareId, setConfig, setShareId, reset } = useDraft();
  const [params, setParams] = useSearchParams();
  const [openSection, setOpenSection] = useState<SectionId | null>('basics');
  const [shareOpen, setShareOpen] = useState(params.get('share') === '1');
  // Keep the dialog mounted after first open so its close animation and saved link survive.
  const [shareMounted, setShareMounted] = useState(shareOpen);
  if (shareOpen && !shareMounted) setShareMounted(true);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [device, setDevice] = useState<Device>('desktop');

  useEffect(() => {
    document.title = 'Birthday Studio — Create';
  }, []);

  useEffect(() => {
    if (!isDesktop) setDevice('mobile');
  }, [isDesktop]);

  useEffect(() => {
    if (params.get('share') === '1') {
      setShareOpen(true);
      params.delete('share');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  if (!ready) return <LoadingScreen dark={false} label="Opening your studio…" />;

  const readiness = getReadiness(config);
  const done = readiness.filter((r) => r.done).length;

  const jumpTo = (section: string) => {
    setOpenSection(section as SectionId);
    setMobileView('edit');
    window.setTimeout(
      () =>
        document.getElementById(`editor-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      80,
    );
  };

  return (
    <div className="flex h-dvh flex-col bg-paper text-ink-900">
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-ink-200 bg-paper/90 px-4 backdrop-blur sm:px-6">
        <Link
          to="/templates"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <img src="/favicon.svg" alt="" className="size-8" />
          <span className="max-sm:sr-only">Birthday Studio</span>
        </Link>
        <SaveIndicator status={status} error={saveError} />
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/templates"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 max-md:hidden"
          >
            <LayoutGrid className="size-4" aria-hidden /> Templates
          </Link>
          <Link
            to="/preview"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 hover:bg-ink-100/60"
          >
            <Eye className="size-4" aria-hidden /> <span className="max-sm:sr-only">Preview</span>
          </Link>
          <Button
            variant="brand"
            size="sm"
            onClick={() => setShareOpen(true)}
            icon={<Share2 className="size-4" aria-hidden />}
          >
            Share
          </Button>
        </div>
      </header>

      {!isDesktop && (
        <div className="flex justify-center border-b border-ink-200 bg-paper px-4 py-2">
          <SegmentedControl
            label="Editor view"
            value={mobileView}
            onChange={setMobileView}
            className="w-full max-w-xs [&>button]:flex-1 [&>button]:justify-center"
            showLabels
            options={[
              { value: 'edit', label: 'Edit', icon: <Pencil className="size-4" aria-hidden /> },
              { value: 'preview', label: 'Preview', icon: <Eye className="size-4" aria-hidden /> },
            ]}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <main
          className={cn(
            'min-h-0 overflow-y-auto lg:w-[30rem] lg:shrink-0 lg:border-r lg:border-ink-200 xl:w-[34rem]',
            !isDesktop && mobileView !== 'edit' ? 'hidden' : 'w-full',
          )}
        >
          <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Make it theirs</h1>
              <p className="mt-1 text-sm text-ink-500">
                Everything saves automatically. The preview updates as you type.
              </p>
            </div>
            <Readiness done={done} total={readiness.length} items={readiness} onJump={jumpTo} />
            <BirthdayForm
              config={config}
              setConfig={setConfig}
              openSection={openSection}
              onToggle={(id) => setOpenSection((cur) => (cur === id ? null : id))}
            />
            <div className="flex flex-col items-center gap-3 pt-4 pb-10">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={() => setShareOpen(true)}
                icon={<Share2 className="size-5" aria-hidden />}
              >
                Share birthday website
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Start over? This clears every photo and message in this draft.'))
                    reset();
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-ink-500 hover:bg-ink-100 hover:text-ink-800"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Start over
              </button>
            </div>
          </div>
        </main>

        {(isDesktop || mobileView === 'preview') && (
          <aside className="min-h-0 flex-1 bg-[#2a2622]" aria-label="Live preview">
            <LivePreview config={config} device={device} onDeviceChange={setDevice} className="h-full" />
          </aside>
        )}
      </div>

      {(shareOpen || shareMounted) && (
        <Suspense fallback={null}>
          <ShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            config={config}
            shareId={shareId}
            onSaved={setShareId}
            onImport={(c, importedId) => {
              setConfig(c);
              if (!importedId) return;
              // Keep the original link working: in local mode, restore the birthday under its old id in this browser.
              setShareId(importedId);
              if (storageMode === 'local') void localRepository.save(c, importedId);
            }}
            onJump={jumpTo}
          />
        </Suspense>
      )}
    </div>
  );
}

function SaveIndicator({ status, error }: { status: string; error: string | null }) {
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-medium text-ink-500"
      role="status"
      aria-live="polite"
      title={error ?? undefined}
    >
      {status === 'saving' && (
        <>
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      )}
      {status === 'saved' && (
        <>
          <CircleCheck className="size-3.5 text-emerald-600" aria-hidden />{' '}
          <span className="max-sm:sr-only">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudAlert className="size-3.5 text-rose-600" aria-hidden />{' '}
          <span className="text-rose-700">Not saved</span>
        </>
      )}
    </span>
  );
}

function Readiness({
  done,
  total,
  items,
  onJump,
}: {
  done: number;
  total: number;
  items: ReturnType<typeof getReadiness>;
  onJump: (section: string) => void;
}) {
  const pct = Math.round((done / total) * 100);
  const next = items.find((i) => !i.done);
  return (
    <div className="rounded-3xl bg-ink-900 p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {done === total ? 'Ready to make them smile' : `${done} of ${total} personal touches`}
        </p>
        <span className="text-xs tabular-nums text-white/60">{pct}%</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Personalisation progress"
      >
        <div
          className="h-full rounded-full bg-gold-soft transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {next && (
        <button
          type="button"
          onClick={() => onJump(next.section)}
          className="mt-3 text-xs font-semibold text-gold-soft hover:underline"
        >
          Next: {next.label} →
        </button>
      )}
    </div>
  );
}
