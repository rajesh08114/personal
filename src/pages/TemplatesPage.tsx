import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Eye, Sparkles } from 'lucide-react';
import type { TemplateCategory } from '@/types/template';
import { CATEGORIES, TEMPLATES } from '@/templates/registry';
import { useDraft } from '@/store/DraftProvider';
import { Particles } from '@/components/effects/Particles';
import { cn } from '@/utils/cn';

/** `/templates` — "Choose your birthday experience". */
export default function TemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const { config, patch } = useDraft();
  const navigate = useNavigate();
  const list = category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.categories.includes(category));

  useEffect(() => {
    document.title = 'Choose your birthday experience — Birthday Studio';
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-ink-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(184_58_100/0.35),transparent_60%)]" />
        <div className="absolute top-20 -right-40 size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.25),transparent_60%)]" />
        <Particles variant="stars" density={4} colors={['#ffffff', '#f6c66a']} />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/templates" className="flex items-center gap-2 font-display text-lg font-semibold">
          <img src="/favicon.svg" alt="" className="size-8" /> Birthday Studio
        </Link>
        <nav className="flex items-center gap-2" aria-label="Main">
          <Link to="/" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white max-sm:hidden">
            My website
          </Link>
          <Link to="/create" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-white/90">
            Open studio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <section className="mx-auto max-w-3xl pt-10 pb-12 text-center sm:pt-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-gold-soft uppercase"
          >
            <Sparkles className="size-3.5" aria-hidden /> {TEMPLATES.length} handcrafted experiences
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-display text-5xl leading-[1.05] font-light tracking-tight text-balance sm:text-7xl"
          >
            Choose your <em className="text-gold-soft">birthday</em> experience
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-5 max-w-xl text-lg text-ink-300 text-pretty"
          >
            Not colour swaps — each one has its own story, layout, motion and celebration. Your photos and words carry over
            to every template.
          </motion.p>
        </section>

        <div className="no-scrollbar sticky top-0 z-20 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-ink-950/80 px-4 py-3 backdrop-blur sm:justify-center" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors duration-200',
                category === c.id ? 'bg-white text-ink-900' : 'bg-white/5 text-white/75 ring-1 ring-white/10 hover:bg-white/10 hover:text-white',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => {
            const current = t.id === config.templateId;
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_rgb(184_58_100/0.5)]"
              >
                <Link to={`/templates/${t.id}`} className="relative block aspect-[16/11] overflow-hidden" aria-label={`Preview ${t.name}`}>
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]">
                    <t.Thumbnail />
                  </div>
                  {current && (
                    <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-900">In use</span>
                  )}
                  <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100">
                    <Eye className="size-3.5" aria-hidden /> Preview
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-2xl">{t.name}</h2>
                    <span className="shrink-0 text-xs text-white/40">{t.animations.language}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">{t.tagline}</p>
                  <p className="mt-3 text-xs font-semibold tracking-wide text-gold-soft">{t.moods.join(' • ')}</p>
                  <p className="mt-2 text-xs text-white/50">
                    <span className="text-white/70">Best for:</span> {t.bestFor}
                  </p>
                  <div className="mt-5 flex gap-2 pt-1">
                    <Link
                      to={`/templates/${t.id}`}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/15"
                    >
                      <Eye className="size-4" aria-hidden /> Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        patch({ templateId: t.id });
                        navigate('/create');
                      }}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-semibold text-ink-900 hover:bg-white/90"
                    >
                      Use template
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
