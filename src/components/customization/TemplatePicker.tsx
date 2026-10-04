import { useState } from 'react';
import { Check, Eye } from 'lucide-react';
import type { TemplateId } from '@/types/birthday';
import { CATEGORIES, TEMPLATES } from '@/templates/registry';
import type { TemplateCategory } from '@/types/template';
import { cn } from '@/utils/cn';

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

/** Compact template switcher inside the builder. Switching keeps all content. */
export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const list = category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.categories.includes(category));

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500">Switching templates keeps every photo and message — only the experience changes.</p>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Template categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'h-9 shrink-0 rounded-full px-3.5 text-xs font-semibold transition-colors',
              category === c.id ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {list.map((t) => {
          const active = t.id === value;
          return (
            <li key={t.id} className="group relative">
              <button
                type="button"
                onClick={() => onChange(t.id)}
                aria-pressed={active}
                className={cn(
                  'block w-full overflow-hidden rounded-2xl border text-left transition-all duration-200',
                  active ? 'border-brand ring-2 ring-brand/25' : 'border-ink-200 hover:border-ink-300 hover:shadow-md',
                )}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <t.Thumbnail />
                </div>
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2">
                  <span className="truncate text-xs font-semibold text-ink-900">{t.name}</span>
                  {active && <Check className="size-4 shrink-0 text-brand" aria-label="Selected" />}
                </div>
              </button>
              <a
                href={`/templates/${t.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Preview ${t.name} with sample content`}
                className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
              >
                <Eye className="size-4" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
