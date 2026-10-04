import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { BirthdayConfig } from '@/types/birthday';
import { useDraft } from '@/store/DraftProvider';
import { normalizeConfig } from '@/data/normalizeConfig';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { CreatorBar, CreatorLink } from '@/components/experience/CreatorBar';
import { LoadingScreen } from '@/components/ui/Layout';
import { PREVIEW_MESSAGE, PREVIEW_READY } from '@/data/previewChannel';


/** `/preview` — full-screen preview of the draft. `?embed=1` powers the live preview frame. */
export default function PreviewPage() {
  const [params] = useSearchParams();
  return params.get('embed') === '1' ? <EmbeddedPreview /> : <DraftPreview />;
}

function DraftPreview() {
  const { config, ready } = useDraft();
  if (!ready) return <LoadingScreen />;
  return (
    <>
      <ExperienceShell config={config} mode="preview" />
      <CreatorBar label="Preview" backTo={{ to: '/create', label: 'Back to editor' }}>
        <CreatorLink to="/create?share=1" primary>
          Share
        </CreatorLink>
      </CreatorBar>
    </>
  );
}

/**
 * Rendered inside the builder's device frame. Receives the live config from the
 * parent window via postMessage, so every keystroke updates instantly.
 */
function EmbeddedPreview() {
  const { config: draft, ready } = useDraft();
  const [live, setLive] = useState<BirthdayConfig | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; config?: unknown } | null;
      if (data?.type === PREVIEW_MESSAGE) setLive(normalizeConfig(data.config));
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const config = live ?? (ready ? draft : null);
  if (!config) return <LoadingScreen />;
  return <ExperienceShell config={config} mode="embed" />;
}
