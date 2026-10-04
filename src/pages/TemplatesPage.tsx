import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { LoveTag, TemplateCategory } from '@/types/template';
import { CATEGORIES, LOVE_TAGS, TEMPLATES } from '@/templates/registry';
import { useDraft } from '@/store/DraftProvider';
import { cn } from '@/utils/cn';

const pad = (n: number) => String(n).padStart(2, '0');

/** `/templates` — the catalogue, laid out like a printed exhibition catalogue. */
export default function TemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory | 'all'>(() =>
    new URLSearchParams(window.location.search).get('c') === 'love' ? 'love' : 'all',
  );
  const [loveTag, setLoveTag] = useState<LoveTag | 'all'>('all');
  const { config, patch } = useDraft();
  const navigate = useNavigate();
  const byCategory = category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.categories.includes(category));
  const list = category === 'love' && loveTag !== 'all' ? byCategory.filter((t) => t.loveTags?.includes(loveTag)) : byCategory;

  useEffect(() => {
    document.title = 'Choose your birthday experience — Birthday Studio';
  }, []);

  return (
    <div className="min-h-dvh bg-[#f4efe6] text-[#24201b]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/templates" className="flex items-center gap-2 font-display text-lg font-semibold">
          <img src="/favicon.svg" alt="" className="size-8" /> Birthday Studio
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <Link to="/" className="inline-flex h-10 items-center px-3 text-sm font-semibold text-[#5b5348] hover:text-[#24201b] max-sm:hidden">
            My website
          </Link>
          <Link to="/create" className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#24201b] px-4 text-sm font-semibold text-[#f4efe6] hover:bg-[#3a342c]">
            Open studio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <section className="grid gap-6 border-b border-[#24201b] pt-10 pb-8 sm:pt-16 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[#8a7f70] uppercase">Catalogue · {TEMPLATES.length} works</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] font-light tracking-tight text-balance sm:text-7xl">
              Choose how the story is told.
            </h1>
          </div>
          <p className="max-w-md text-base leading-relaxed text-[#5b5348] md:justify-self-end">
            A newspaper, a film, a letter, a scrapbook, a night sky. Pick one; your names, photos and words move with you if
            you change your mind.
          </p>
        </section>

        <div className="no-scrollbar sticky top-0 z-20 -mx-4 flex gap-5 overflow-x-auto border-b border-[#24201b]/15 bg-[#f4efe6] px-4 sm:gap-7" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => {
                setCategory(c.id);
                setLoveTag('all');
              }}
              className={cn(
                '-mb-px h-12 shrink-0 border-b-2 text-sm font-semibold transition-colors',
                category === c.id ? 'border-[#24201b] text-[#24201b]' : 'border-transparent text-[#8a7f70] hover:text-[#24201b]',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {category === 'love' && (
          <section aria-labelledby="love-collection" className="grid gap-4 border-b border-[#24201b]/15 py-8 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 id="love-collection" className="font-display text-3xl leading-tight sm:text-4xl">
                For two people.
              </h2>
              <p className="mt-2 max-w-md text-[#5b5348]">
                Written for a partner: the story of how you met, the places you’ve been, and what you’d like to say out loud.
              </p>
            </div>
            <div className="flex flex-wrap content-end gap-2" role="group" aria-label="Filter love templates by mood">
              {LOVE_TAGS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={loveTag === t.id}
                  onClick={() => setLoveTag(t.id)}
                  className={cn(
                    'h-9 rounded-md border px-3 text-xs font-semibold transition-colors',
                    loveTag === t.id ? 'border-[#24201b] bg-[#24201b] text-[#f4efe6]' : 'border-[#24201b]/20 text-[#5b5348] hover:border-[#24201b]/50',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {list.length === 0 && <p className="py-16 text-center text-[#8a7f70]">Nothing in this mood yet. Try another filter.</p>}

        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => {
            const current = t.id === config.templateId;
            const number = TEMPLATES.indexOf(t) + 1;
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className="group flex flex-col"
              >
                <Link to={`/templates/${t.id}`} className="relative block aspect-[16/11] overflow-hidden rounded-sm bg-[#e4dccd]" aria-label={`Preview ${t.name}`}>
                  <t.Thumbnail />
                  {current && <span className="absolute top-3 left-3 bg-[#f4efe6] px-2 py-0.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase">In use</span>}
                </Link>
                <div className="mt-4 flex items-baseline gap-3 border-t border-[#24201b]/20 pt-3">
                  <span className="font-mono text-xs text-[#8a7f70]">No. {pad(number)}</span>
                  <h2 className="font-display text-2xl leading-tight">{t.name}</h2>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5b5348]">{t.tagline}</p>
                <p className="mt-2 text-xs text-[#8a7f70]">
                  {t.moods.join(', ')} · Best for {t.bestFor.charAt(0).toLowerCase() + t.bestFor.slice(1)}
                </p>
                <div className="mt-4 flex gap-4 text-sm font-semibold">
                  <Link to={`/templates/${t.id}`} className="inline-flex h-10 items-center underline decoration-[#24201b]/30 underline-offset-4 hover:decoration-[#24201b]">
                    Preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      patch({ templateId: t.id });
                      navigate('/create');
                    }}
                    className="inline-flex h-10 items-center gap-1 underline decoration-[#24201b]/30 underline-offset-4 hover:decoration-[#24201b]"
                  >
                    Use this one <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
