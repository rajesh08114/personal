import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems, type ResolvedMemory } from '@/components/experience/content';
import { useScramble } from '@/hooks/useText';
import { TypeOn } from '@/components/experience/Motion';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import './future.css';

/**
 * Terminal 1983 — an amber-phosphor CRT in a beige case, late at night.
 * Log in, read a message that decodes on screen, browse files, run BIRTHDAY.EXE.
 */
const vt = 'font-t-display';

export default function DigitalFuture() {
  const { opened } = useExperience();
  return (
    <div className="df-screen relative min-h-dvh">
      <div aria-hidden className="df-scanlines pointer-events-none fixed inset-0 z-40" />
      <div aria-hidden className="df-bezel pointer-events-none fixed inset-0 z-40" />
      <AnimatePresence>{!opened && <Boot key="boot" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10 mx-auto max-w-5xl px-5 py-14 sm:px-10">
          <Subject />
          <Transmission />
          <Files />
          <Log />
          <Run />
        </main>
      )}
    </div>
  );
}

/** A box drawn the way terminals drew them. */
function Box({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn('df-box relative p-5 sm:p-7', className)}>
      {title && <p className={`${vt} df-box-title absolute -top-3.5 left-4 px-2 text-xl`}>{title}</p>}
      {children}
    </div>
  );
}

const bar = (pct: number, width = 24) => {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

function Cursor() {
  return <span aria-hidden className="df-cursor ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em]" />;
}

function Boot() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  const lines = [
    'BIOS 2.1  (C) 1983',
    'MEMORY TEST ........ 640K OK',
    config.messages.intro.trim() || 'BIRTHDAY PROTOCOL LOADED',
    `USER: ${name.toUpperCase()}`,
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 500 : 700);
    return () => window.clearTimeout(t);
  }, [shown, lines.length]);
  const ready = shown >= lines.length;

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Enter' && open();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, open]);

  return (
    <motion.div className="df-screen fixed inset-0 z-30 flex items-center justify-center px-6" exit={{ scaleY: 0.004, opacity: 0, transition: { duration: 0.35, ease: [0.7, 0, 1, 1] } }}>
      <div className="w-full max-w-xl">
        <div className={`${vt} min-h-44 space-y-1 text-2xl sm:text-3xl`} aria-live="polite">
          {lines.slice(0, shown).map((l, i) => (
            <p key={i}>
              <TypeOn text={l} perChar={0.014} />
            </p>
          ))}
          {!ready && <Cursor />}
        </div>
        <p className={`${vt} mt-4 text-2xl`} aria-hidden>
          {bar((shown / lines.length) * 100)}
        </p>
        <button
          type="button"
          disabled={!ready}
          onClick={open}
          className={cn(`${vt} df-key mt-10 h-14 w-full text-2xl transition-opacity`, ready ? 'opacity-100' : 'opacity-30')}
        >
          PRESS RETURN TO LOG IN{ready && <Cursor />}
        </button>
      </div>
    </motion.div>
  );
}

function Subject() {
  const { config } = useExperience();
  const { name, age, hasAge } = useBirthdayText();
  const rows: Array<[string, ReactNode]> = [
    ['NAME', <Fill key="n" value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />],
    ['KNOWN TO SENDER AS', <Fill key="r" value={config.relationship.toUpperCase()} placeholder={PLACEHOLDER.relationship} />],
    ['YEARS IN SERVICE', <span key="a" className={cn(!hasAge && 'bd-placeholder')}>{age}</span>],
    ['STATUS', 'EXCELLENT'],
  ];
  return (
    <section aria-label="User profile" className="grid items-center gap-10 pt-6 md:grid-cols-[0.9fr_1.1fr]">
      <Box title="USER.PIC">
        <PhotoSlot src={config.heroImage} alt={`${name}`} label="Add hero photo" tone="dark" priority className="df-photo aspect-square w-full" />
      </Box>
      <div>
        <p className={`${vt} text-2xl opacity-70`}>C:\&gt; WHOAMI</p>
        <h1 className={`${vt} mt-2 text-6xl leading-[0.95] sm:text-8xl`}>
          HAPPY BIRTHDAY,
          <br />
          <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
          <Cursor />
        </h1>
        <Box className="mt-10" title="PROFILE">
          <dl className={`${vt} space-y-1 text-xl sm:text-2xl`}>
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-4">
                <dt className="opacity-60">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Box>
      </div>
    </section>
  );
}

function Transmission() {
  const { config } = useExperience();
  const text = config.messages.main.trim() || PLACEHOLDER.message;
  const [decoded, setDecoded] = useState(false);
  const out = useScramble(text, decoded, Math.min(4000, 800 + text.length * 8));
  return (
    <section aria-labelledby="df-msg" className="pt-24">
      <Box title="MESSAGE.TXT">
        <h2 id="df-msg" className="sr-only">
          A message just for you
        </h2>
        <p className={`${vt} text-xl opacity-60`}>
          FROM: <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
        </p>
        <p className="df-body mt-5 text-lg leading-relaxed whitespace-pre-line sm:text-xl" aria-hidden={!decoded}>
          {out}
        </p>
        {decoded ? <p className="sr-only">{text}</p> : (
          <button type="button" onClick={() => setDecoded(true)} className={`${vt} df-key mt-8 h-12 px-6 text-2xl`}>
            TYPE MESSAGE.TXT
          </button>
        )}
      </Box>
    </section>
  );
}

function FileCard({ m, onOpen }: { m: ResolvedMemory; onOpen: () => void }) {
  const [active, setActive] = useState(false);
  const title = useScramble(m.titleText, active, 600);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => setActive(true)}
      onFocus={() => setActive(true)}
      aria-label={`Open file: ${m.titleText}`}
      className="group block w-full text-left"
    >
      <Box className="!p-3 transition-colors group-hover:bg-[rgb(255_176_0/0.06)]">
        <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="df-photo aspect-[4/3] w-full" />
        <p className={`${vt} mt-3 text-lg opacity-60`}>
          MEM{String(m.index + 1).padStart(4, '0')}.PIC {m.date ? `  ${m.date.toUpperCase()}` : ''}
        </p>
        <p className={`${vt} text-2xl leading-tight`} aria-hidden>
          {active ? title : m.titleText.toUpperCase()}
        </p>
        <p className="df-body mt-1 text-sm opacity-75">{m.captionText}</p>
      </Box>
    </button>
  );
}

function Files() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section aria-labelledby="df-files" className="pt-24">
      <p className={`${vt} text-2xl opacity-70`}>C:\&gt; DIR MEMORIES</p>
      <h2 id="df-files" className={`${vt} mt-1 text-5xl sm:text-6xl`}>
        {memories.length} FILE(S) FOUND
      </h2>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((m, i) => (
          <li key={m.id}>
            <FileCard m={m} onOpen={() => setIndex(i)} />
          </li>
        ))}
      </ul>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} />
    </section>
  );
}

function Log() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="df-log" className="pt-24">
      <p className={`${vt} text-2xl opacity-70`}>C:\&gt; TYPE HISTORY.LOG</p>
      <h2 id="df-log" className="sr-only">
        History
      </h2>
      <ol className={`${vt} mt-4 space-y-4 text-xl sm:text-2xl`}>
        {items.map((t, i) => (
          <motion.li key={t.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.15, delay: 0.1 }} className="grid gap-x-6 sm:grid-cols-[9rem_1fr]">
            <span className="opacity-60">[{(t.date || `ENTRY ${i + 1}`).toUpperCase()}]</span>
            <span>
              {t.titleText.toUpperCase()} <span className="df-body text-base opacity-75 sm:text-lg">— {t.captionText}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

const CAKE = [
  '       (   (   (       ',
  '       |   |   |       ',
  '    .--+---+---+--.    ',
  '    |  *  *  *  * |    ',
  '  .-+-------------+-.  ',
  '  |  HAPPY BIRTHDAY |  ',
  '  `-----------------\'  ',
];

/** Final reveal: run the program, print a cake, then the surprise. */
function Run() {
  const { config, restart } = useExperience();
  const { name } = useBirthdayText();
  const [progress, setProgress] = useState<number | null>(null);
  const [printed, setPrinted] = useState(0);
  const complete = progress !== null && progress >= 100;

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 5)), 60);
    return () => window.clearTimeout(t);
  }, [progress]);

  useEffect(() => {
    if (!complete || printed >= CAKE.length) return;
    const t = window.setTimeout(() => setPrinted((n) => n + 1), 120);
    return () => window.clearTimeout(t);
  }, [complete, printed]);

  const done = complete && printed >= CAKE.length;

  return (
    <section aria-labelledby="df-run" className="pt-24 pb-10">
      <Box title="BIRTHDAY.EXE">
        <h2 id="df-run" className={`${vt} text-2xl sm:text-3xl`}>
          C:\&gt; RUN BIRTHDAY.EXE /FOR:<Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
        </h2>
        {progress === null ? (
          <button type="button" onClick={() => setProgress(0)} className={`${vt} df-key mt-8 h-14 w-full text-2xl`}>
            PRESS TO RUN
          </button>
        ) : (
          <p className={`${vt} mt-6 text-2xl`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Running">
            {bar(progress)} {progress}%
          </p>
        )}
        {complete && (
          <pre className={`${vt} mt-6 overflow-x-auto text-lg leading-tight sm:text-2xl`} aria-label="A cake made of text">
            {CAKE.slice(0, printed).join('\n')}
          </pre>
        )}
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr]" role="status">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" className="df-photo aspect-square w-full" />
              <div className="flex flex-col justify-center">
                <p className="df-body text-xl leading-relaxed">
                  <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
                </p>
                <p className={`${vt} mt-6 text-2xl`}>
                  {config.messages.final.trim() || 'HAPPY BIRTHDAY.'} — <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
                </p>
                <p className={`${vt} mt-4 text-xl opacity-60`}>
                  PROGRAM TERMINATED NORMALLY.
                  <Cursor />
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <div className="mt-10 text-center">
        <button type="button" onClick={restart} className={`${vt} h-11 text-xl opacity-60 hover:opacity-100`}>
          C:\&gt; REBOOT
        </button>
      </div>
    </section>
  );
}
