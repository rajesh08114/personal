import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { nextBirthday } from '@/utils/date';
import { cn } from '@/utils/cn';
import { SPRING } from '@/animations/tokens';
import './capsule.css';

/**
 * Time Capsule — an old biscuit tin dug up from the garden. Masking tape, a
 * label-maker label, and inside: a typed letter, photos wrapped in tissue,
 * ticket stubs, and one envelope marked "open last".
 */

function sealDate(iso?: string) {
  const now = new Date();
  const m = iso ? /^\d{4}-(\d{2})-(\d{2})$/.exec(iso) : null;
  const d = m ? new Date(now.getFullYear(), Number(m[1]) - 1, Number(m[2])) : now;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

/** Embossed label-maker tape (the black plastic kind). */
function Label({ children, className, tilt = 0 }: { children: ReactNode; className?: string; tilt?: number }) {
  return (
    <span className={cn('tc-label', className)} style={{ rotate: `${tilt}deg` }}>
      {children}
    </span>
  );
}

export default function TimeCapsule() {
  const { opened } = useExperience();
  return (
    <div className="tc-soil min-h-dvh text-[#2a2620]">
      <AnimatePresence>{!opened && <Tin key="tin" />}</AnimatePresence>
      {opened && (
        <main className="relative mx-auto max-w-5xl px-4 pt-16 pb-24 sm:px-8">
          <Lid />
          <Letter />
          <Photos />
          <Stubs />
          <OpenLast />
        </main>
      )}
    </div>
  );
}

/** Opening: the tin, taped shut. Peel the tape, then lift the lid. */
function Tin() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  const [peeled, setPeeled] = useState(false);
  const [lifting, setLifting] = useState(false);

  const lift = () => {
    setLifting(true);
    window.setTimeout(open, 1700);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <div className="relative [perspective:1100px]">
        {/* The open tin underneath: dark inside, revealed as the lid comes away. */}
        <div aria-hidden className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle_at_50%_45%,#2c3a36,#141c1a_70%)] shadow-[inset_0_8px_24px_rgb(0_0_0/0.7)]" />
        {/* The lid's shadow on the table spreads and softens as it rises. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full bg-black/40"
          initial={false}
          animate={lifting ? { opacity: 0.18, scale: 1.12, y: 26 } : { opacity: 0, scale: 1, y: 0 }}
          transition={SPRING.heavy}
        />
        <motion.div
          className="tc-tin relative flex size-[min(78vw,22rem)] items-center justify-center rounded-full"
          style={{ transformOrigin: '50% 100%' }}
          initial={false}
          // A tight metal lid: it resists, pops free, then lifts and tips back on one edge.
          animate={lifting ? { y: [0, 2, -70], rotateX: [0, 0, 38], scale: [1, 1, 1.04] } : { y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.3, times: [0, 0.18, 1], ease: [0.3, 0, 0.15, 1] }}
        >
          <div className="tc-tin-inner flex size-[78%] flex-col items-center justify-center rounded-full text-center">
            <p className="tc-type text-xs tracking-[0.25em] text-[#f2ead8]/80 uppercase">Do not open until</p>
            <Label className="mt-3 text-sm sm:text-base" tilt={-2}>
              {sealDate(config.birthdayDate)}
            </Label>
            <Label className="mt-2 text-xs sm:text-sm" tilt={1.5}>
              FOR {name.toUpperCase()}
            </Label>
          </div>
          {/* Masking tape across the lid */}
          <AnimatePresence>
            {!peeled && (
              <motion.button
                type="button"
                onClick={() => setPeeled(true)}
                aria-label="Peel off the tape"
                exit={{ x: '60%', y: -30, rotate: 18, opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 1, 1] } }}
                className="tc-tape absolute top-[72%] left-[-8%] h-12 w-[116%] -translate-y-1/2 -rotate-[8deg]"
              >
                <span className="tc-hand text-lg text-[#5a4a2c]">peel me</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
        {lifting && <Dust />}
      </div>
      <div className="mt-10 h-14">
        {peeled && (
          <motion.button
            type="button"
            onClick={lift}
            disabled={lifting}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="tc-type h-12 border-b-2 border-[#2a2620] px-2 text-sm tracking-[0.2em] uppercase"
          >
            Lift the lid
          </motion.button>
        )}
      </div>
      <p className="tc-hand mt-2 text-xl text-[#2a2620]/70">{config.messages.intro.trim() || 'Buried a while ago. Dug up today.'}</p>
    </motion.div>
  );
}

function Lid() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-labelledby="tc-hello" className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
      <motion.figure initial={{ rotate: -6, y: 20, opacity: 0 }} animate={{ rotate: -3, y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="tc-print mx-auto w-full max-w-sm p-3 pb-12">
        <PhotoSlot src={config.heroImage} alt={`${name}`} label="Add the photo on top" tone="light" priority className="aspect-[4/5] w-full" />
        <figcaption className="tc-hand absolute bottom-3 left-4 text-xl">{name}, today</figcaption>
      </motion.figure>
      <div>
        <Label tilt={-1}>CAPSULE OPENED · {sealDate(config.birthdayDate)}</Label>
        <h1 id="tc-hello" className="tc-type mt-6 text-4xl leading-tight sm:text-6xl">
          Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />.
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-[#2a2620]/80">
          Everything in this tin was put here for you. Take your time going through it.
        </p>
      </div>
    </section>
  );
}

function Letter() {
  const { config } = useExperience();
  return (
    <section aria-labelledby="tc-letter" className="mt-24">
      <h2 id="tc-letter" className="sr-only">
        A typed letter
      </h2>
      <motion.article
        initial={{ opacity: 0, y: 40, rotate: 1.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="tc-typed relative mx-auto max-w-2xl px-6 py-10 sm:px-14 sm:py-14"
      >
        <span aria-hidden className="tc-tape-small absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-3deg]" />
        <p className="tc-type text-sm">
          To <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />,
        </p>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="tc-type mt-6 space-y-5 text-base leading-[1.9] sm:text-lg" />
        <p className="tc-type mt-8 text-sm">
          — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </p>
      </motion.article>
    </section>
  );
}

/** Photos wrapped in tissue paper. Tap one to unwrap it. */
function Photos() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [unwrapped, setUnwrapped] = useState<string[]>([]);
  return (
    <section aria-labelledby="tc-photos" className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="tc-photos" className="tc-type text-3xl sm:text-4xl">
          Wrapped in tissue
        </h2>
        {unwrapped.length < memories.length && (
          <button type="button" onClick={() => setUnwrapped(memories.map((m) => m.id))} className="tc-type h-11 text-xs tracking-[0.2em] uppercase underline underline-offset-4">
            Unwrap them all
          </button>
        )}
      </div>
      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((m, i) => {
          const open = unwrapped.includes(m.id);
          const tilt = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2][i % 6];
          return (
            <li key={m.id} style={{ rotate: `${tilt}deg` }}>
              <div className="tc-print relative p-2.5 pb-3">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="h-full w-full" />
                  <AnimatePresence>
                    {!open && (
                      <motion.button
                        type="button"
                        onClick={() => setUnwrapped((u) => [...u, m.id])}
                        aria-label={`Unwrap photo ${i + 1}`}
                        exit={{ y: '-105%', rotate: -4, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                        className="tc-tissue absolute inset-[-6%] flex items-center justify-center"
                      >
                        <span className="tc-hand text-xl text-[#6b5d48]">unwrap</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-3 min-h-16 px-1">
                  <Label className="text-[0.7rem]" tilt={-1}>
                    {(m.date || `No. ${i + 1}`).toUpperCase()}
                  </Label>
                  <p className={cn('mt-2 font-semibold transition-opacity', open ? 'opacity-100' : 'opacity-0')}>{m.titleText}</p>
                  <p className={cn('text-sm text-[#2a2620]/70 transition-opacity', open ? 'opacity-100' : 'opacity-0')}>
                    {m.captionText}
                    {m.place ? ` — ${m.place}` : ''}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The timeline as a bundle of ticket stubs held with a rubber band. */
function Stubs() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="tc-stubs" className="mt-24">
      <h2 id="tc-stubs" className="tc-type text-3xl sm:text-4xl">
        Ticket stubs, in order
      </h2>
      <ol className="mt-8 space-y-4">
        {items.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="tc-stub grid grid-cols-[5.5rem_1fr] sm:grid-cols-[8rem_1fr_9rem]"
            style={{ rotate: `${[-0.8, 0.6, -0.4, 0.9][i % 4]}deg` }}
          >
            <div className="flex flex-col items-center justify-center border-r-2 border-dashed border-[#2a2620]/30 p-3 text-center">
              <span className="tc-type text-[0.6rem] tracking-[0.2em] uppercase">Admit one</span>
              <span className="tc-type mt-1 text-lg font-bold">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="p-4">
              <p className="tc-type text-[0.65rem] tracking-[0.2em] text-[#2a2620]/60 uppercase">{[t.date, t.place].filter(Boolean).join(' · ') || 'Date unwritten'}</p>
              <p className="tc-type mt-1 text-lg font-bold">{t.titleText}</p>
              <p className="text-sm text-[#2a2620]/75">{t.captionText}</p>
            </div>
            {t.image && (
              <div className="hidden p-2 sm:block">
                <PhotoSlot src={t.image} alt={t.titleText} tone="light" className="h-full min-h-20 w-full" />
              </div>
            )}
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function useCountdown(iso?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  const today = new Date(now);
  let target = nextBirthday(iso, today);
  if (target && target.toDateString() === today.toDateString()) target = new Date(target.getFullYear() + 1, target.getMonth(), target.getDate());
  return target ? Math.ceil((target.getTime() - now) / 86_400_000) : null;
}

/** Final reveal: the envelope marked "open last". */
function OpenLast() {
  const { config, restart } = useExperience();
  const { name } = useBirthdayText();
  const [open, setOpen] = useState(false);
  const days = useCountdown(config.birthdayDate);

  return (
    <section aria-labelledby="tc-last" className="mt-28 flex flex-col items-center text-center">
      <h2 id="tc-last" className="sr-only">
        Open last
      </h2>
      {!open ? (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ rotate: -1, y: -3 }}
          className="tc-envelope relative flex aspect-[3/2] w-[min(88vw,26rem)] items-center justify-center"
          aria-label="Open the envelope marked open last"
        >
          <span className="tc-hand text-3xl text-[#2a2620]">open last</span>
          <span aria-hidden className="tc-wax absolute bottom-[22%] size-12 rounded-full" />
        </motion.button>
      ) : (
        <motion.article
          initial={{ y: 60, opacity: 0, rotate: 2 }}
          animate={{ y: 0, opacity: 1, rotate: -0.6 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          className="tc-typed w-full max-w-2xl px-6 py-10 text-left sm:px-12"
          role="status"
        >
          <div className={cn('grid gap-6', 'sm:grid-cols-[1fr_11rem]')}>
            <p className="tc-type text-lg leading-relaxed sm:text-xl">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <div className="tc-print rotate-2 p-2 pb-6">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A last photo for ${name}`} label="Add a last photo" tone="light" className="aspect-square w-full" />
            </div>
          </div>
          <p className="tc-hand mt-8 text-2xl">
            {config.messages.final.trim() || 'Happy birthday.'} — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </motion.article>
      )}
      <div className="mt-14">
        {days !== null ? (
          <Label tilt={-1.5}>NEXT OPENING IN {days} DAYS</Label>
        ) : (
          <p className="tc-type bd-placeholder text-sm">{PLACEHOLDER.date} — add it to start the countdown</p>
        )}
      </div>
      <button type="button" onClick={restart} className="tc-type mt-10 h-11 text-xs tracking-[0.2em] uppercase underline underline-offset-4">
        Put everything back in the tin
      </button>
    </section>
  );
}

/** A few motes of dust kicked up from the rim when the lid comes off, drifting slowly up and away. */
function Dust() {
  const { reducedMotion } = useExperience();
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 44;
        const y = 50 + Math.sin(angle) * 44;
        return (
          <motion.span
            key={i}
            className="absolute size-1 rounded-full bg-[#e9dcc0]"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.8, 0], x: Math.cos(angle) * (18 + (i % 4) * 8), y: -40 - (i % 5) * 14, scale: [0.6, 1, 1.3] }}
            transition={{ duration: 2.4 + (i % 3) * 0.5, delay: 0.25 + (i % 6) * 0.05, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}
