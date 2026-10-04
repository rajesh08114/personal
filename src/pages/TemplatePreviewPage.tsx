import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Check } from 'lucide-react';
import { ExperienceShell } from '@/components/experience/ExperienceShell';
import { CreatorBar } from '@/components/experience/CreatorBar';
import { createSampleConfig } from '@/data/sampleConfig';
import { isTemplateId } from '@/data/normalizeConfig';
import { getTemplate } from '@/templates/registry';
import { useDraft } from '@/store/DraftProvider';

/** `/templates/:id` — the complete experience with fictional sample content. */
export default function TemplatePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patch } = useDraft();
  const valid = isTemplateId(id);
  const config = useMemo(() => (valid ? createSampleConfig(id) : null), [valid, id]);
  if (!valid || !config) return <Navigate to="/templates" replace />;
  const template = getTemplate(id);

  return (
    <>
      <ExperienceShell key={id} config={config} mode="sample" />
      <CreatorBar label={`Sample · ${template.name}`} backTo={{ to: '/templates', label: 'All templates' }}>
        <button
          type="button"
          onClick={() => {
            patch({ templateId: id });
            navigate('/create');
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 font-semibold whitespace-nowrap text-ink-900 hover:bg-white/90"
        >
          <Check className="size-4" aria-hidden /> Use <span className="max-sm:hidden">this template</span>
        </button>
      </CreatorBar>
    </>
  );
}
