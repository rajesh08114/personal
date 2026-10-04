import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Particles } from '@/components/effects/Particles';
import { MorphParticles, type MorphTarget } from '@/components/effects/MorphParticles';
import { heartOutline, textPoints } from '@/components/effects/shapes';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './stars.css';

const serif = 'font-t-display';

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter(Boolean);
}

export default function MessageInTheStars() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#020611] text-[#e0f2fe]">
      <Aurora />
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && <Sky />}
    </div>
  );
}

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020611] via-[#06142b] to-[#0b1a33]" />
      <div className="ms-aurora ms-aurora-a" />
      <div className="ms-aurora ms-aurora-b" />
      <Particles variant="stars" density={10} colors={['#ffffff', '#e0f2fe']} />
      <span className="ms-shoot" style={{ top: '14%', animationDelay: '3s' }} />
      <span className="ms-shoot" style={{ top: '32%', animationDelay: '9s' }} />
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="text-xs tracking-[0.5em] text-[#e0f2fe]/60 uppercase">
        Tonight, the sky is listening
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.8 }} className={`${serif} mt-6 max-w-2xl text-4xl leading-snug sm:text-6xl`}>
        {config.messages.intro.trim() || 'I wrote you a message — and gave every word to the stars.'}
      </motion.h1>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-14 inline-flex h-13 items-center gap-2 rounded-full border border-[#e0f2fe]/40 bg-[#e0f2fe]/5 px-8 tracking-[0.2em] uppercase transition-colors hover:bg-[#e0f2fe] hover:text-[#020611]">
        <Sparkles className="size-4" aria-hidden /> Look up
      </motion.button>
    </motion.div>
  );
}

function Sky() {
  const { config, theme, restart, reducedMotion } = useExperience();
  const { name, sender } = useBirthdayText();
  const lines = useMemo(() => {
    const s = sentences(config.messages.main);
    return [...(s.length ? s : [PLACEHOLDER.message]), config.messages.surprise.trim() || PLACEHOLDER.surprise];
  }, [config.messages.main, config.messages.surprise]);
  const [sent, setSent] = useState(0);
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [flying, setFlying] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [phase, setPhase] = useState<'writing' | 'name' | 'done'>('writing');
  const [nameTarget, setNameTarget] = useState<MorphTarget | null>(null);

  const all = [...lines.slice(0, sent), ...extra];
  const total = lines.length + extra.length;
  const pts = useMemo(() => heartOutline(Math.max(total, 6)).map(([x, y]) => [8 + x * 84, 6 + y * 80] as [number, number]), [total]);

  useEffect(() => {
    let cancelled = false;
    textPoints(name, { fontFamily: "'Lustria', serif", weight: 400, count: 900 }).then((t) => !cancelled && setNameTarget({ ...t, fill: 0.84 }));
    return () => {
      cancelled = true;
    };
  }, [name]);

  const send = () => {
    if (flying !== null || sent >= lines.length) return;
    setFlying(sent);
    window.setTimeout(
      () => {
        setSent((n) => n + 1);
        setFlying(null);
      },
      reducedMotion ? 0 : 1100,
    );
  };

  const writeBack = (e: FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    setExtra((x) => [...x, v]);
    setDraft('');
  };

  const finish = () => {
    setPhase('name');
    window.setTimeout(() => setPhase('done'), 3800);
  };

  const done = sent >= lines.length;

  return (
    <main className="relative z-10">
      <section aria-labelledby="ms-title" className="relative flex min-h-dvh flex-col">
        <header className="px-5 pt-16 text-center">
          <h1 id="ms-title" className={`${serif} text-3xl sm:text-5xl`}>
            For <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />, written across the sky
          </h1>
          <p className="mt-2 text-sm text-[#e0f2fe]/60" aria-live="polite">
            {sent} of {lines.length} lines in the stars
          </p>
        </header>

        <div className="relative mx-auto w-full max-w-5xl flex-1" style={{ minHeight: '50dvh' }}>
          <AnimatePresence>
            {phase !== 'writing' && (
              <motion.div key="morph" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <MorphParticles target={nameTarget} colors={['#ffffff', theme.primary, theme.accent]} count={950} size={1.3} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.svg viewBox="0 0 100 92" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" animate={{ opacity: phase === 'writing' ? 1 : 0 }} transition={{ duration: 1 }} role="group" aria-label="Constellation of your message">
            {all.slice(1).map((_, i) => (
              <motion.line key={`l${i}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]} stroke="#e0f2fe" strokeOpacity={0.35} strokeWidth={0.25} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
            ))}
            {all.length === total && total > 2 && <motion.line x1={pts[total - 1][0]} y1={pts[total - 1][1]} x2={pts[0][0]} y2={pts[0][1]} stroke="#e0f2fe" strokeOpacity={0.35} strokeWidth={0.25} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />}
            {all.map((line, i) => (
              <g key={`s${i}`} role="button" tabIndex={0} aria-label={`Star ${i + 1}: ${line}`} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} className="cursor-pointer outline-none">
                <circle cx={pts[i][0]} cy={pts[i][1]} r={3.2} fill="transparent" />
                <motion.circle cx={pts[i][0]} cy={pts[i][1]} fill={i >= lines.length ? theme.accent : '#ffffff'} initial={{ r: 0 }} animate={{ r: hover === i ? 1.6 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} style={{ filter: 'drop-shadow(0 0 1.2px #fff)' }} />
              </g>
            ))}
          </motion.svg>
          {flying !== null && (
            <motion.span aria-hidden className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_8px_rgb(224_242_254/0.8)]" initial={{ left: '50%', top: '100%', scale: 2 }} animate={{ left: `${pts[flying][0]}%`, top: `${(pts[flying][1] / 92) * 100}%`, scale: 0.6 }} transition={{ duration: 1.05, ease: EASE.out }} />
          )}
          <AnimatePresence>
            {hover !== null && phase === 'writing' && all[hover] && (
              <motion.p key={hover} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-4 bottom-2 mx-auto max-w-xl rounded-2xl bg-[#020611]/80 px-4 py-3 text-center italic" role="status">
                “{all[hover]}”
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mx-auto w-full max-w-2xl px-5 pb-16">
          <AnimatePresence mode="wait">
            {phase === 'writing' && !done && (
              <motion.div key={`line-${sent}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: flying === null ? 1 : 0, y: flying === null ? 0 : -30 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-[#e0f2fe]/15 bg-[#06142b]/70 p-6 text-center">
                <p className="text-xs tracking-[0.3em] text-[#e0f2fe]/50 uppercase">Line {sent + 1}</p>
                <p className={`${serif} mt-3 text-2xl leading-snug sm:text-3xl`}>{lines[sent]}</p>
                <button type="button" onClick={send} disabled={flying !== null} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#e0f2fe] px-6 font-semibold text-[#020611]">
                  <Send className="size-4" aria-hidden /> Send it to the sky
                </button>
              </motion.div>
            )}
            {phase === 'writing' && done && (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className={`${serif} text-2xl`}>Every word is up there now.</p>
                <form onSubmit={writeBack} className="mx-auto mt-6 flex max-w-md gap-2">
                  <label htmlFor="ms-write" className="sr-only">
                    Write a line back to the sky
                  </label>
                  <input id="ms-write" value={draft} maxLength={80} onChange={(e) => setDraft(e.target.value)} placeholder="Write a line back…" className="h-12 min-w-0 flex-1 rounded-full border border-[#e0f2fe]/25 bg-[#e0f2fe]/5 px-5 placeholder:text-[#e0f2fe]/40 focus:border-[var(--bd-accent)] focus:outline-none" />
                  <button type="submit" aria-label="Add your line as a star" className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--bd-accent)] text-[#020611]">
                    <Send className="size-4" aria-hidden />
                  </button>
                </form>
                <button type="button" onClick={finish} className="mt-8 h-12 rounded-full border border-[#e0f2fe]/40 px-8 tracking-[0.2em] uppercase hover:bg-[#e0f2fe] hover:text-[#020611]">
                  Turn the sky into a name
                </button>
              </motion.div>
            )}
            {phase === 'done' && (
              <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} className="text-center" role="status">
                <h2 className={`${serif} text-4xl sm:text-6xl`}>Happy Birthday, My Love</h2>
                <div className="mx-auto mt-8 size-40 overflow-hidden rounded-full ring-1 ring-[#e0f2fe]/40 shadow-[0_0_60px_rgb(224_242_254/0.25)]">
                  <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Hero photo" className="h-full w-full" />
                </div>
                <p className="mt-6 text-[#e0f2fe]/70 italic">
                  {config.messages.final} — {sender}
                </p>
                <button type="button" onClick={restart} className={cn('mt-8 h-11 text-xs tracking-[0.35em] text-[#e0f2fe]/50 uppercase hover:text-[#e0f2fe]')}>
                  Write it in the stars again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
