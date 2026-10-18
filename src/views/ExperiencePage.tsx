'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/store/DraftProvider';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { CreatorBar, CreatorLink } from '@/components/experience/CreatorBar';
import { LoadingScreen } from '@/components/ui/Layout';

/** `/` — the birthday experience built from the creator's current draft. */
export default function ExperiencePage() {
  const router = useRouter();
  const { config, ready, shareId } = useDraft();
  // A first-time visitor has nothing to show yet: start them in the gallery instead of a page of placeholders.
  const untouched = !config.birthdayPerson.trim() && !config.heroImage && !shareId && !config.memories.some((m) => m.image);
  useEffect(() => {
    if (ready && untouched) router.replace('/templates');
  }, [ready, untouched, router]);
  if (!ready || untouched) return <LoadingScreen />;
  return (
    <>
      <ExperienceShell config={config} mode="live" />
      <CreatorBar label="Your birthday website">
        <CreatorLink to="/templates" icon="grid">
          <span className="max-sm:sr-only">Templates</span>
        </CreatorLink>
        <CreatorLink to="/create" icon="edit" primary>
          Personalise
        </CreatorLink>
      </CreatorBar>
    </>
  );
}
