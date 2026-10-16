import { useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { TypeOn } from '@/components/experience/Motion';
import { EASE, SPRING } from '@/animations/tokens';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday, nextBirthday } from '@/utils/date';
import { cn } from '@/utils/cn';
import './edition.css';

/**
 * The Birthday Edition — a one-copy broadsheet printed for one person.
 * Inspired by mid-century front pages and the "newspaper from the day you were born" gift.
 */
export default function BirthdayEdition() {
  const { opened } = useExperience();
  return (
    <div className="be-desk flow-root min-h-dvh text-[#1d1b18]">
      <AnimatePresence>{!opened && <FoldedPaper key="fold" />}</AnimatePresence>
      {opened && <FrontPage />}
    </div>
  );
}

function useEditionDate(): string {
  const { config } = useExperience();
  const day = config.birthdayDate ? nextBirthday(config.birthdayDate, new Date(Date.now() - 864e5 * 2)) : new Date();
  return (day ?? new Date()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Opening: the paper lies folded on the doormat, masthead up. Tapping it lifts the bottom half
 * out from underneath and swings it down on the fold. The shadow the top half casts on the
 * bottom half fades as the angle opens, which is what sells the paper as a physical sheet.
 */
function FoldedPaper() {
  const { open, reducedMotion } = useExperience();
  const { name, age, hasAge, hasName } = useBirthdayText();
  const [unfolding, setUnfolding] = useState(false);
  const angle = useMotionValue(-180);
  const shade = useTransform(angle, [-180, -90, 0], [0.6, 0.45, 0]);
  const crease = useTransform(angle, [-180, 0], [0.35, 0.08]);
  const headline = `${hasName ? name : PLACEHOLDER.name} ${hasAge ? `turns ${age}` : 'celebrates'}`.toUpperCase();

  const unfold = () => {
    if (unfolding) return;
    setUnfolding(true);
    if (reducedMotion) {
      angle.set(0);
      open();
      return;
    }
    void animate(angle, 0, { type: 'spring', stiffness: 70, damping: 14, mass: 1.4 }).then(() => window.setTimeout(open, 650));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-6 py-10"
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <motion.button
        type="button"
        onClick={unfold}
        aria-label={`Unfold today’s paper for ${name}`}
        className="group relative w-full max-w-sm text-left [perspective:1400px]"
        initial={{ y: 30, rotate: -4, opacity: 0 }}
        animate={unfolding ? { y: 0, rotate: 0, opacity: 1 } : { y: 0, rotate: -3, opacity: 1 }}
        exit={{ scale: 1.08, y: -24, transition: { duration: 0.45, ease: EASE.out } }}
        transition={SPRING.paper}
        whileHover={unfolding ? undefined : { rotate: -1.5, y: -4 }}
      >
        {/* Top half: masthead, always facing up. */}
        <div className="be-paper relative z-10 px-6 pt-5 pb-6 shadow-[0_18px_30px_-12px_rgb(40_30_20/0.45)]">
          <p className="be-masthead text-center text-4xl leading-none">The Birthday Edition</p>
          <div className="mt-2 border-y-2 border-double border-[#1d1b18] py-1 text-center text-[0.6rem] tracking-[0.2em] uppercase">
            One copy printed · Delivered by hand
          </div>
          <div aria-hidden className="mt-3 space-y-1.5">
            {[100, 92, 96].map((w, i) => (
              <div key={i} className="h-1 bg-[#1d1b18]/15" style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* The crease darkens while the sheet is folded. */}
          <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-linear-to-t from-[#1d1b18] to-transparent" style={{ opacity: crease }} />
          {!unfolding && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#1d1b18] px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#efe9dc] uppercase transition-transform group-hover:-translate-y-0.5">
              Unfold the paper
            </div>
          )}
        </div>
        {/* Bottom half: hinged on the fold, swings down from behind the top half. */}
        <motion.div
          aria-hidden={!unfolding}
          className="be-paper relative origin-top px-6 pt-4 pb-6 [backface-visibility:hidden] [transform-style:preserve-3d]"
          style={{ rotateX: angle }}
        >
          <p className="be-head text-2xl leading-tight font-bold">
            {unfolding ? <TypeOn text={headline} delay={0.35} perChar={0.035} /> : headline}
          </p>
          <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
            <div className="be-photo aspect-[4/3] bg-[#cfc6b4]" />
            <div aria-hidden className="space-y-1.5">
              {[100, 90, 96, 80, 92, 60].map((w, i) => (
                <div key={i} className="h-1 bg-[#1d1b18]/15" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {/* Shadow cast by the top half; it lifts away as the sheet opens. */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#1d1b18] to-[#1d1b18]/30" style={{ opacity: shade }} />
        </motion.div>
      </motion.button>
      <p className="mt-10 text-sm text-[#1d1b18]/60 italic">Left on your doorstep this morning.</p>
    </motion.div>
  );
}

function FrontPage() {
  const { config, restart } = useExperience();
  const { name, age, hasAge, hasName, sender, relationship } = useBirthdayText();
  const date = useEditionDate();
  const memories = getMemories(config, 3);
  const timeline = getTimeline(config);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const born = formatBirthday(config.birthdayDate, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.main
      initial={{ opacity: 0, rotateX: 12, y: 40 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ transformOrigin: '50% 0%', transformPerspective: 1600 }}
      className="be-paper mx-auto max-w-6xl px-4 pt-6 pb-16 shadow-[0_30px_60px_-30px_rgb(40_30_20/0.5)] sm:my-8 sm:px-10"
    >
      {/* Masthead */}
      <header className="text-center">
        <div className="flex items-end justify-between gap-4 text-[0.6rem] tracking-[0.15em] uppercase sm:text-xs">
          <span className="max-w-[9rem] text-left">Weather: clear skies, chance of cake</span>
          <span className="max-w-[9rem] text-right">Price: one hug</span>
        </div>
        <h1 className="be-masthead mt-2 text-[clamp(2.6rem,10vw,6.5rem)] leading-[0.9]">The Birthday Edition</h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-y-[3px] border-double border-[#1d1b18] py-1.5 text-[0.62rem] tracking-[0.18em] uppercase sm:justify-between sm:text-xs">
          <span>{hasAge ? `Vol. ${age}` : 'Special edition'}</span>
          <span>{date}</span>
          <span>One copy printed</span>
        </div>
      </header>

      {/* Lead story */}
      <section aria-labelledby="be-headline" className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 id="be-headline" className="be-head text-[clamp(2.2rem,7vw,5rem)] leading-[0.95] font-bold uppercase">
            {hasName ? (
              <TypeOn text={`${name} ${hasAge ? `turns ${age}` : 'celebrates a birthday'}`} delay={0.5} perChar={0.03} />
            ) : (
              <>
                <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> {hasAge ? `turns ${age}` : 'celebrates a birthday'}
              </>
            )}
          </h2>
          <p className="be-head mt-3 text-lg leading-snug italic sm:text-2xl">
            {config.messages.intro.trim() || 'Friends and family report widespread happiness; celebrations expected to continue all day.'}
          </p>
          <figure className="mt-5">
            <PhotoSlot src={config.heroImage} alt={`${name}, pictured today`} label="Add the front-page photo" tone="light" priority className="be-photo aspect-[3/2] w-full" />
            <figcaption className="mt-1.5 border-b border-[#1d1b18]/30 pb-2 text-xs italic">
              Pictured: {name}{born ? `, born ${born}` : ''}. Photograph courtesy of {sender}.
            </figcaption>
          </figure>
        </div>

        <aside className="border-[#1d1b18]/40 lg:col-span-4 lg:border-l lg:pl-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase">In this edition</p>
          <ol className="mt-2 divide-y divide-[#1d1b18]/20 border-y border-[#1d1b18]/40 text-sm">
            <li className="flex justify-between py-1.5"><span>A letter from {sender}</span><span>A1</span></li>
            <li className="flex justify-between py-1.5"><span>From the archive</span><span>A2</span></li>
            <li className="flex justify-between py-1.5"><span>Chronology</span><span>A3</span></li>
            <li className="flex justify-between py-1.5"><span>Classifieds</span><span>A4</span></li>
          </ol>
          <div className="mt-6 border-2 border-[#1d1b18] p-4 text-center">
            <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase">Today’s forecast</p>
            <p className="be-head mt-2 text-5xl font-bold">100%</p>
            <p className="text-sm italic">chance of being loved</p>
          </div>
          <blockquote className="mt-6 border-t-4 border-[#1d1b18] pt-3">
            <p className="be-head text-xl leading-snug italic">
              “<Fill value={config.messages.wish} placeholder="[A ONE-LINE WISH FOR THE YEAR AHEAD]" />”
            </p>
            <footer className="mt-2 text-xs tracking-[0.15em] uppercase">— {sender}, {relationship}</footer>
          </blockquote>
        </aside>
      </section>

      {/* The letter, set as the lead article */}
      <section aria-labelledby="be-letter" className="mt-10 border-t-2 border-[#1d1b18] pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="be-letter" className="be-head text-2xl font-bold sm:text-3xl">A letter, printed in full</h2>
          <p className="text-xs tracking-[0.15em] uppercase">
            By <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />, {relationship} correspondent
          </p>
        </div>
        <Paragraphs
          value={config.messages.main}
          placeholder={PLACEHOLDER.message}
          className="be-columns mt-4 text-[1.02rem] leading-relaxed"
          paragraphClassName="mb-3 text-justify hyphens-auto"
        />
      </section>

      {/* Memories as archive photographs */}
      <section aria-labelledby="be-archive" className="mt-10 border-t-2 border-[#1d1b18] pt-4">
        <h2 id="be-archive" className="be-head text-2xl font-bold sm:text-3xl">From the archive</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m) => (
            <article key={m.id} className="border-t border-[#1d1b18]/40 pt-3">
              <p className="text-[0.65rem] tracking-[0.2em] uppercase">{[m.date, m.place].filter(Boolean).join(' — ') || 'Date unknown'}</p>
              <h3 className="be-head mt-1 text-xl leading-tight font-bold">{m.titleText}</h3>
              <button type="button" onClick={() => setLightbox(m.index)} aria-label={`Enlarge: ${m.titleText}`} className="mt-2 block w-full">
                <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="be-photo aspect-[4/3] w-full" />
              </button>
              <p className="mt-2 text-sm leading-relaxed">{m.captionText}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Chronology */}
      <section aria-labelledby="be-chrono" className="mt-10 border-t-2 border-[#1d1b18] pt-4">
        <h2 id="be-chrono" className="be-head text-2xl font-bold sm:text-3xl">Chronology</h2>
        <ol className="mt-3 divide-y divide-[#1d1b18]/25">
          {timeline.map((t) => (
            <li key={t.id} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <span className="be-head text-sm font-bold uppercase">{t.date || `Chapter ${t.index + 1}`}</span>
              <span>
                <strong className="be-head text-lg">{t.titleText}.</strong> <span className="text-sm">{t.captionText}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Classifieds />
      <StopPress />

      <div className="mt-12 text-center">
        <button type="button" onClick={restart} className="h-11 text-xs font-bold tracking-[0.2em] uppercase underline underline-offset-4">
          Fold the paper back up
        </button>
      </div>

      <Lightbox items={toLightboxItems(memories)} index={lightbox} onIndexChange={setLightbox} />
    </motion.main>
  );
}

/** A4 — a notice with tear-off tabs. Tearing one reveals the wish. */
function Classifieds() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const [torn, setTorn] = useState<number[]>([]);
  const tabs = 6;
  const anyTorn = torn.length > 0;

  return (
    <section aria-labelledby="be-classifieds" className="mt-10 border-t-2 border-[#1d1b18] pt-4">
      <h2 id="be-classifieds" className="be-head text-2xl font-bold sm:text-3xl">Classifieds</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4 text-sm leading-relaxed">
          <p><strong className="uppercase">Wanted:</strong> one more year exactly like the last, only better. Apply in person.</p>
          <p><strong className="uppercase">Found:</strong> a great deal of affection for {name}. Owner need not claim; it’s theirs.</p>
          <p><strong className="uppercase">Notice:</strong> candles will be lit this evening. Wishes must be made before blowing.</p>
        </div>
        <div className="border border-dashed border-[#1d1b18]/60 bg-[#f6f1e6]">
          <div className="p-4 text-center">
            <p className="be-head text-2xl font-bold uppercase">Make a wish</p>
            <p className="mt-1 text-sm italic">Take a tab. One per birthday, but nobody’s counting.</p>
            <AnimatePresence>
              {anyTorn && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="be-head mt-3 text-lg leading-snug" aria-live="polite">
                  <Fill value={config.messages.wish} placeholder="[A ONE-LINE WISH FOR THE YEAR AHEAD]" />
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex border-t border-dashed border-[#1d1b18]/60">
            {Array.from({ length: tabs }, (_, i) => {
              const gone = torn.includes(i);
              return (
                <div key={i} className="relative h-28 flex-1 border-r border-dashed border-[#1d1b18]/60 last:border-r-0">
                  <AnimatePresence>
                    {!gone && (
                      <motion.button
                        type="button"
                        onClick={() => setTorn((t) => [...t, i])}
                        aria-label={`Tear off wish tab ${i + 1}`}
                        exit={{ y: 120, rotate: i % 2 ? 24 : -18, opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 1, 1] } }}
                        className="absolute inset-0 flex items-center justify-center bg-[#f6f1e6] hover:bg-[#ece5d5]"
                      >
                        <span className="be-head rotate-[-90deg] text-xs font-bold tracking-[0.15em] whitespace-nowrap uppercase">Wish · {i + 1}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The final reveal: stop the presses — a late-news slip is pasted onto the page. */
function StopPress() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const [stopped, setStopped] = useState(false);
  const photo = config.finalImage ?? config.heroImage;

  return (
    <section aria-labelledby="be-stop" className="mt-12 border-t-[3px] border-double border-[#1d1b18] pt-6 text-center">
      <h2 id="be-stop" className="sr-only">Late news</h2>
      {!stopped ? (
        <button
          type="button"
          onClick={() => setStopped(true)}
          className="be-head inline-flex h-14 items-center border-2 border-[#1d1b18] px-8 text-lg font-bold tracking-[0.12em] uppercase transition-colors hover:bg-[#1d1b18] hover:text-[#efe9dc]"
        >
          Stop the presses
        </button>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: -60, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -1.5 }}
          transition={{ type: 'spring', damping: 16, stiffness: 140 }}
          className="relative mx-auto max-w-2xl bg-[#fbf8f1] px-6 py-8 text-left shadow-[0_14px_24px_-14px_rgb(40_30_20/0.6)] sm:px-10"
        >
          <motion.span
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.25, ease: [0.5, 0, 0.75, 0] }}
            className="be-stamp absolute -top-5 right-4 rotate-[8deg] border-[3px] px-3 py-1 text-xl font-bold tracking-[0.2em] uppercase sm:text-2xl"
          >
            Late extra
          </motion.span>
          <p className="text-xs font-bold tracking-[0.25em] uppercase">Stop press</p>
          <h3 className="be-head mt-2 text-3xl leading-tight font-bold sm:text-4xl">A final word for {name}</h3>
          <div className={cn('mt-4 grid gap-5', photo && 'sm:grid-cols-[1fr_12rem]')}>
            <p className="text-lg leading-relaxed">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            {photo && <PhotoSlot src={photo} alt={name} tone="light" className="be-photo aspect-[4/5] w-full" />}
          </div>
          <p className="be-head mt-6 border-t border-[#1d1b18]/30 pt-3 text-lg italic">
            {config.messages.final.trim() || 'Happy birthday.'} — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </motion.article>
      )}
    </section>
  );
}
