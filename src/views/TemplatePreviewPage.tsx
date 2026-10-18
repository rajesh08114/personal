'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { CreatorBar } from '@/components/experience/CreatorBar';
import { createSampleConfig } from '@/data/sampleConfig';
import { isTemplateId } from '@/data/normalizeConfig';
import { getTemplate, isLoveTemplate } from '@/templates/registry';
import { useDraft } from '@/store/DraftProvider';

/** `/templates/:id` — the complete experience with fictional sample content. */
export default function TemplatePreviewPage() {
  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const { patch } = useDraft();
  const valid = isTemplateId(id);
  const config = useMemo(() => (valid ? createSampleConfig(id, { love: isLoveTemplate(id) }) : null), [valid, id]);
  useEffect(() => {
    if (!valid) router.replace('/templates');
  }, [valid, router]);
  if (!valid || !config) return null;
  const template = getTemplate(id);

  return (
    <>
      <ExperienceShell key={id} config={config} mode="sample" />
      <CreatorBar label={`Sample · ${template.name}`} backTo={{ to: '/templates', label: 'All templates' }}>
        <button
          type="button"
          onClick={() => {
            patch({ templateId: id });
            router.push('/create');
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 font-semibold whitespace-nowrap text-ink-900 hover:bg-white/90"
        >
          <Check className="size-4" aria-hidden /> Use <span className="max-sm:hidden">this template</span>
        </button>
      </CreatorBar>
    </>
  );
}
