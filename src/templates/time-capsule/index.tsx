import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock, LockOpen, Radio } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { useTypewriter } from '@/hooks/useText';
import { PLACEHOLDER } from '@/data/placeholders';
import { nextBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const mono = 'font-t-accent';
const glass = 'rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl';

/** The capsule is sealed on this year's birthday (or today when no date is set). */
function capsuleDate(iso?: string) {
  const now = new Date();
  const m = iso ? /^\d{4}-(\d{2})-(\d{2})$/.exec(iso) : null;
  const d = m ? new Date(now.getFullYear(), Number(m[1]) - 1, Number(m[2])) : now;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

export default function TimeCapsule() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#070b18] text-[#dfe7ff]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgb(110_231_249/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(110_231_249/0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-40 left-1/2 size-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--bd-secondary-rgb)/0.25),transparent_60%)]" />
        <Particles variant="dust" density={3} colors={[theme.primary, theme.secondary]} />
      </div>
      <AnimatePresence>{!opened && <Seal key="seal" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Header />
          <Transmission />
          <Pods />
          <Scrubber />
          <FinalCapsule />
        </main>
      )}
    </div>
  );
}

function Rings({ spinning }: { spinning: boolean }) {
  return (
    <div className="relative flex size-56 items-center justify-center sm:size-64" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn('absolute rounded-full border', i === 1 ? 'border-dashed' : '', 'border-[var(--bd-primary)]/50')}
          style={{ inset: i * 22 }}
          animate={{ rotate: spinning ? (i % 2 ? -540 : 540) : i % 2 ? -360 : 360 }}
          transition={{ duration: spinning ? 1.6 : 30 + i * 10, repeat: spinning ? 0 : Infinity, ease: spinning ? EASE.inOut : 'linear' }}
        />
      ))}
      <motion.span
        className="relative h-28 w-16 rounded-full bg-gradient-to-b from-[var(--bd-primary)] to-[var(--bd-secondary)] shadow-[0_0_40px_rgb(var(--bd-primary-rgb)/0.7)]"
        animate={spinning ? { scaleY: [1, 1.15, 0], opacity: [1, 1, 0] } : { scaleY: [1, 1.04, 1] }}
        transition={spinning ? { duration: 1.6 } : { duration: 3, repeat: Infinity }}
      />
    </div>
  );
}

function Seal() {
  const { config, open } = useExperience();
  const [unsealing, setUnsealing] = useState(false);
  const { output } = useTypewriter(config.messages.intro.trim() || 'A message from today, for you to remember forever.', true, 38);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b18]/90 px-6 text-center backdrop-blur" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <p className={`${mono} min-h-12 max-w-lg text-sm text-[#dfe7ff]/80 sm:text-base`} aria-live="polite">
        {output}
      </p>
      <div className="mt-8">
        <Rings spinning={unsealing} />
      </div>
      <h1 className={`${mono} mt-8 text-lg tracking-[0.3em] text-[var(--bd-primary)] sm:text-2xl`}>TIME CAPSULE — {capsuleDate(config.birthdayDate)}</h1>
      <button
        type="button"
        disabled={unsealing}
        onClick={() => {
          setUnsealing(true);
          window.setTimeout(open, 1700);
        }}
        className={`${mono} mt-10 inline-flex h-14 items-center gap-3 rounded-full border border-[var(--bd-primary)]/60 px-8 text-sm tracking-[0.25em] text-[var(--bd-primary)] uppercase transition-colors hover:bg-[var(--bd-primary)] hover:text-[#070b18]`}
      >
        <LockOpen className="size-4" aria-hidden /> Unseal capsule
      </button>
    </motion.div>
  );
}

function Header() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Happy birthday" className="flex min-h-dvh flex-col items-center justify-center px-5 py-20 text-center">
      <p className={`${mono} text-xs tracking-[0.35em] text-[var(--bd-primary)]`}>CAPSULE OPENED · {capsuleDate(config.birthdayDate)}</p>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE.out }} className={`${glass} mt-10 w-[min(84vw,22rem)] p-3`}>
        <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="aspect-square w-full rounded-2xl" />
        <div className={`${mono} flex justify-between px-1 pt-3 text-[0.65rem] text-[#dfe7ff]/50`}>
          <span>REC #0001</span>
          <span>ARCHIVED FOREVER</span>
        </div>
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }} className="mt-10 text-5xl leading-tight font-light sm:text-7xl">
        Happy Birthday,
        <br />
        <span className="bg-gradient-to-r from-[var(--bd-primary)] to-[var(--bd-secondary)] bg-clip-text font-semibold text-transparent">
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </span>
      </motion.h2>
    </section>
  );
}

function Transmission() {
  const { config } = useExperience();
  const paras = splitParagraphs(config.messages.main);
  const text = (paras.length ? paras : [PLACEHOLDER.message]).join('\n\n');
  const [started, setStarted] = useState(false);
  const { output, done } = useTypewriter(text, started, 18);
  return (
    <section aria-labelledby="tc-log" className="px-5 py-20">
      <motion.div onViewportEnter={() => setStarted(true)} viewport={{ once: true, amount: 0.4 }} className={`${glass} mx-auto max-w-3xl p-6 sm:p-10`}>
        <div className="flex items-center gap-3">
          <Radio className="size-5 text-[var(--bd-primary)]" aria-hidden />
          <h2 id="tc-log" className={`${mono} text-sm tracking-[0.3em] text-[var(--bd-primary)]`}>
            TRANSMISSION LOG
          </h2>
          <span className="ml-auto size-2 animate-pulse rounded-full bg-[#4ade80]" aria-hidden />
        </div>
        <p className={`${mono} mt-2 text-xs text-[#dfe7ff]/40`}>
          FROM: <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} /> · TO: <Fill value={config.birthdayPerson.toUpperCase()} placeholder="[NAME]" />
        </p>
        <p className="mt-8 min-h-40 text-lg leading-relaxed whitespace-pre-line text-[#dfe7ff]/90 sm:text-xl" aria-hidden>
          {output}
          {!done && <span className="ml-0.5 inline-block h-5 w-2 animate-pulse bg-[var(--bd-primary)] align-middle" />}
        </p>
        <p className="sr-only">{text}</p>
      </motion.div>
    </section>
  );
}

function Pods() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [opened, setOpened] = useState<string[]>([]);
  return (
    <section aria-labelledby="tc-pods" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`${mono} text-xs tracking-[0.3em] text-[var(--bd-primary)]`}>ARCHIVE · {memories.length} PODS</p>
            <h2 id="tc-pods" className="mt-2 text-4xl font-light sm:text-5xl">
              Some moments worth remembering
            </h2>
          </div>
          {opened.length < memories.length && (
            <button type="button" onClick={() => setOpened(memories.map((m) => m.id))} className={`${mono} h-11 rounded-full border border-white/15 px-5 text-xs tracking-widest hover:bg-white/10`}>
              OPEN ALL PODS
            </button>
          )}
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m, i) => {
            const isOpen = opened.includes(m.id);
            return (
              <li key={m.id} className={`${glass} overflow-hidden`}>
                <div className={`${mono} flex items-center justify-between px-5 pt-4 text-[0.65rem] tracking-widest text-[#dfe7ff]/50`}>
                  <span>CAPSULE #{String(i + 1).padStart(3, '0')}</span>
                  <span className={isOpen ? 'text-[#4ade80]' : ''}>{isOpen ? 'OPENED' : 'SEALED'}</span>
                </div>
                <div className="relative m-4 aspect-[4/3] overflow-hidden rounded-2xl">
                  <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="h-full w-full" />
                  <AnimatePresence>
                    {!isOpen && (
                      <>
                        <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/2 border-r border-[var(--bd-primary)]/40 bg-[#0d1428]" exit={{ x: '-100%' }} transition={{ duration: 0.8, ease: EASE.inOut }} />
                        <motion.span aria-hidden className="absolute inset-y-0 right-0 w-1/2 border-l border-[var(--bd-primary)]/40 bg-[#0d1428]" exit={{ x: '100%' }} transition={{ duration: 0.8, ease: EASE.inOut }} />
                        <motion.button
                          type="button"
                          exit={{ opacity: 0 }}
                          onClick={() => setOpened((o) => [...o, m.id])}
                          aria-label={`Open capsule ${i + 1}`}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--bd-primary)]"
                        >
                          <span className="inline-flex size-14 items-center justify-center rounded-full border border-[var(--bd-primary)]/50 bg-[#070b18]/60 shadow-[0_0_20px_rgb(var(--bd-primary-rgb)/0.4)]">
                            <Lock className="size-6" aria-hidden />
                          </span>
                          <span className={`${mono} text-xs tracking-widest`}>TAP TO OPEN</span>
                        </motion.button>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-5 pb-5">
                  <p className="font-semibold">{isOpen ? m.titleText : '— — —'}</p>
                  <p className="text-sm text-[#dfe7ff]/60">{isOpen ? m.captionText : 'Contents sealed'}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Scrubber() {
  const { config } = useExperience();
  const items = getTimeline(config);
  const [i, setI] = useState(0);
  const item = items[Math.min(i, items.length - 1)];
  const go = (d: number) => setI((v) => Math.max(0, Math.min(items.length - 1, v + d)));
  return (
    <section aria-labelledby="tc-time" className="px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <p className={`${mono} text-xs tracking-[0.3em] text-[var(--bd-primary)]`}>TIMELINE NAVIGATION</p>
        <h2 id="tc-time" className="mt-2 text-4xl font-light sm:text-5xl">
          Our little story
        </h2>
        <div
          role="tablist"
          aria-label="Timeline chapters"
          className="relative mt-10 flex justify-between"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(1);
            if (e.key === 'ArrowLeft') go(-1);
          }}
        >
          <span aria-hidden className="absolute inset-x-4 top-4 h-px bg-white/15" />
          <motion.span aria-hidden className="absolute top-4 left-4 h-px bg-[var(--bd-primary)]" animate={{ width: items.length > 1 ? `calc(${(i / (items.length - 1)) * 100}% - ${(i / (items.length - 1)) * 2}rem)` : 0 }} />
          {items.map((t, k) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={k === i}
              tabIndex={k === i ? 0 : -1}
              onClick={() => setI(k)}
              className="relative flex min-w-11 flex-col items-center gap-2"
            >
              <span className={cn('size-8 rounded-full border-2 transition-all', k <= i ? 'border-[var(--bd-primary)] bg-[var(--bd-primary)] shadow-[0_0_16px_var(--bd-primary)]' : 'border-white/30 bg-[#070b18]')} />
              <span className={`${mono} text-[0.65rem] tracking-widest text-[#dfe7ff]/60`}>T+{String(k + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.article key={item.id} role="tabpanel" initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} className={`${glass} mt-8 grid gap-6 p-5 sm:grid-cols-2 sm:p-6`}>
            <PhotoSlot src={item.image} alt={item.titleText} label="Add a photo" className="aspect-[4/3] w-full rounded-2xl" />
            <div className="flex flex-col justify-center">
              <p className={`${mono} text-xs tracking-widest text-[var(--bd-primary)]`}>ENTRY {String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-3xl font-light">{item.titleText}</h3>
              <p className="mt-3 text-[#dfe7ff]/70">{item.captionText}</p>
              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous entry" className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 hover:bg-white/10 disabled:opacity-30">
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} disabled={i === items.length - 1} aria-label="Next entry" className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 hover:bg-white/10 disabled:opacity-30">
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Countdown({ iso }: { iso?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const today = new Date(now);
  let target = nextBirthday(iso, today);
  if (target && target.toDateString() === today.toDateString()) target = new Date(target.getFullYear() + 1, target.getMonth(), target.getDate());
  if (!target) return <p className={`${mono} bd-placeholder text-sm`}>{PLACEHOLDER.date} — add it to start the countdown</p>;
  const diff = Math.max(0, target.getTime() - now);
  const parts = [
    ['DAYS', Math.floor(diff / 86_400_000)],
    ['HRS', Math.floor(diff / 3_600_000) % 24],
    ['MIN', Math.floor(diff / 60_000) % 60],
    ['SEC', Math.floor(diff / 1000) % 60],
  ] as const;
  return (
    <div className="flex justify-center gap-3" aria-label={`Next opening in ${parts[0][1]} days`}>
      {parts.map(([l, v]) => (
        <div key={l} className={`${glass} w-18 py-3 sm:w-22`}>
          <p className={`${mono} text-2xl text-[var(--bd-accent)] tabular-nums sm:text-3xl`}>{String(v).padStart(2, '0')}</p>
          <p className={`${mono} text-[0.6rem] tracking-widest text-[#dfe7ff]/50`}>{l}</p>
        </div>
      ))}
    </div>
  );
}

function FinalCapsule() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="tc-final" className="flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <p className={`${mono} text-xs tracking-[0.35em] text-[var(--bd-primary)]`}>FINAL CAPSULE</p>
      <h2 id="tc-final" className="mt-4 text-4xl font-light sm:text-6xl">
        Open this again someday.
      </h2>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            fx.confetti({ x: 0.5, y: 0.55, colors, count: 160, spread: 120 });
            fx.fireworks({ colors, duration: 3, rockets: 6 });
          }}
          className="group mt-12 flex flex-col items-center gap-4"
          aria-label="Open the final capsule"
        >
          <Rings spinning={false} />
          <span className={`${mono} text-xs tracking-[0.3em] text-[#dfe7ff]/70 group-hover:text-[var(--bd-primary)]`}>TAP TO OPEN</span>
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE.out }} className="mt-12 flex w-full max-w-2xl flex-col items-center" role="status">
          <div className={`${glass} w-full p-6 sm:p-10`}>
            <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" className="aspect-[16/10] w-full rounded-2xl" />
            <p className="mt-8 text-2xl leading-relaxed font-light">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <p className={`${mono} mt-6 text-xs tracking-widest text-[#dfe7ff]/50`}>
              SEALED WITH LOVE BY <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
            </p>
          </div>
          <p className="mt-10 text-lg text-[#dfe7ff]/70">{config.messages.final}</p>
          <p className={`${mono} mt-10 mb-4 text-xs tracking-[0.3em] text-[var(--bd-primary)]`}>NEXT OPENING IN</p>
          <Countdown iso={config.birthdayDate} />
          <button type="button" onClick={restart} className={`${mono} mt-12 h-11 text-xs tracking-[0.3em] text-[#dfe7ff]/50 hover:text-[#dfe7ff]`}>
            RESEAL THE CAPSULE
          </button>
        </motion.div>
      )}
    </section>
  );
}
