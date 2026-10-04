import { useDraft } from '@/store/DraftProvider';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { CreatorBar, CreatorLink } from '@/components/experience/CreatorBar';
import { LoadingScreen } from '@/components/ui/Layout';

/** `/` — the birthday experience built from the creator's current draft. */
export default function ExperiencePage() {
  const { config, ready } = useDraft();
  if (!ready) return <LoadingScreen />;
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
