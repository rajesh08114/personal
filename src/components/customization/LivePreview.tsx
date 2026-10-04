import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ExternalLink, Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react';
import type { BirthdayConfig } from '@/types/birthday';
import { PREVIEW_MESSAGE, PREVIEW_READY } from '@/data/previewChannel';
import { SegmentedControl } from '@/components/ui/Layout';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export type Device = 'desktop' | 'tablet' | 'mobile';
const SIZES: Record<Device, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 },
  tablet: { w: 820, h: 1180 },
  mobile: { w: 390, h: 844 },
};

interface LivePreviewProps {
  config: BirthdayConfig;
  device: Device;
  onDeviceChange: (d: Device) => void;
  className?: string;
}

/**
 * Real-time preview in a scaled device frame. The experience runs in an iframe so
 * responsive breakpoints behave exactly like a real phone, tablet or laptop.
 */
export function LivePreview({ config, device, onDeviceChange, className }: LivePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const configRef = useRef(config);
  const size = SIZES[device];

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const pad = 32;
      const s = Math.min((el.clientWidth - pad) / size.w, (el.clientHeight - pad) / size.h, 1);
      setScale(Math.max(0.15, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.w, size.h]);

  const send = () => {
    frameRef.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, config: configRef.current }, window.location.origin);
  };

  useEffect(() => {
    configRef.current = config;
    const t = window.setTimeout(send, 120);
    return () => window.clearTimeout(t);
  }, [config]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string } | null)?.type === PREVIEW_READY) send();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <SegmentedControl<Device>
          label="Preview device"
          value={device}
          onChange={onDeviceChange}
          className="bg-white/10 [&_button[aria-checked=false]]:text-white/70 [&_button[aria-checked=false]:hover]:text-white"
          options={[
            { value: 'desktop', label: 'Desktop', icon: <Monitor className="size-4" aria-hidden /> },
            { value: 'tablet', label: 'Tablet', icon: <Tablet className="size-4" aria-hidden /> },
            { value: 'mobile', label: 'Mobile', icon: <Smartphone className="size-4" aria-hidden /> },
          ]}
        />
        <div className="flex items-center gap-1">
          <IconButton
            label="Replay from the opening"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setLoaded(false);
              setReloadKey((k) => k + 1);
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
          </IconButton>
          <a
            href="/preview"
            target="_blank"
            rel="noreferrer"
            aria-label="Open full-screen preview in a new tab"
            title="Open full-screen preview"
            className="inline-flex size-11 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
      </div>
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className={cn(
            'relative shrink-0 overflow-hidden bg-black shadow-[0_40px_100px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10',
            device === 'desktop' ? 'rounded-xl' : 'rounded-[2.4rem]',
          )}
          style={{ width: size.w * scale, height: size.h * scale }}
        >
          <iframe
            key={reloadKey}
            ref={frameRef}
            src="/preview?embed=1"
            title="Live preview of your birthday website"
            allow="autoplay; microphone"
            onLoad={() => setLoaded(true)}
            className="absolute top-0 left-0 origin-top-left border-0 bg-black"
            style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}
          />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950 text-sm text-white/60" role="status">
              Loading preview…
            </div>
          )}
        </div>
      </div>
      <p className="px-4 pb-3 text-center text-xs text-white/40">
        Live preview · {size.w}×{size.h} at {Math.round(scale * 100)}% · changes appear instantly
      </p>
    </div>
  );
}
