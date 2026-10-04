import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Fingerprint, Heart, ScanLine, Unlock } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems, type ResolvedMemory } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { useScramble } from '@/hooks/useText';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import './future.css';

const mono = 'font-t-accent';

export default function DigitalFuture() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#04060d] text-[#d8f7ff]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="df-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--bd-primary-rgb)/0.18),transparent_60%),radial-gradient(ellipse_at_100%_100%,rgb(var(--bd-secondary-rgb)/0.15),transparent_55%)]" />
        <Particles variant="dust" density={3} colors={[theme.primary, theme.secondary]} />
      </div>
      <AnimatePresence>{!opened && <Boot key="boot" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Subject />
          <Transmission />
          <DataLogs />
          <MissionLog />
          <Status />
        </main>
      )}
    </div>
  );
}

function Panel({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn('df-panel relative border border-[var(--bd-primary)]/25 bg-[#071223]/70 p-5 backdrop-blur-md sm:p-7', className)}>
      {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c) => (
        <span key={c} aria-hidden className={cn('absolute size-4 border-[var(--bd-primary)]', c)} />
      ))}
      {title && <p className={`${mono} mb-4 text-xs tracking-[0.3em] text-[var(--bd-primary)]`}>// {title}</p>}
      {children}
    </div>
  );
}

function Glitch({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('df-glitch relative inline-block', className)} data-text={text}>
      {text}
    </span>
  );
}

function Boot() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  const lines = [
    `YEAR ${new Date().getFullYear()}`,
    config.messages.intro.trim() || 'BIRTHDAY PROTOCOL INITIATED',
    'LOADING MEMORY BANKS ........ OK',
    'CALIBRATING HAPPINESS ....... OK',
    `SUBJECT: ${name.toUpperCase()}`,
  ];
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 650);
    return () => window.clearTimeout(t);
  }, [shown, lines.length]);
  const ready = shown >= lines.length;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04060d] px-5" exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.5 } }}>
      <div className={cn('w-full max-w-xl', leaving && 'df-glitch-shake')}>
        <div className={`${mono} min-h-44 space-y-2 text-sm sm:text-base`} aria-live="polite">
          {lines.slice(0, shown).map((l, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={i === lines.length - 1 ? 'text-[var(--bd-accent)]' : 'text-[var(--bd-primary)]'}>
              &gt; {l}
            </motion.p>
          ))}
          {!ready && <span className="inline-block h-4 w-2 animate-pulse bg-[var(--bd-primary)]" />}
        </div>
        <div className="mt-6 h-1.5 bg-white/10">
          <motion.div className="h-full bg-gradient-to-r from-[var(--bd-primary)] to-[var(--bd-secondary)]" animate={{ width: `${(shown / lines.length) * 100}%` }} />
        </div>
        <motion.button
          type="button"
          disabled={!ready || leaving}
          onClick={() => {
            setLeaving(true);
            window.setTimeout(open, 600);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0.2 }}
          className={`${mono} mt-10 inline-flex h-14 w-full items-center justify-center gap-3 border border-[var(--bd-primary)] text-sm tracking-[0.3em] text-[var(--bd-primary)] transition-colors hover:bg-[var(--bd-primary)] hover:text-[#04060d]`}
        >
          <Fingerprint className="size-5" aria-hidden /> AUTHENTICATE
        </motion.button>
      </div>
    </motion.div>
  );
}

function Subject() {
  const { config } = useExperience();
  const { name, age, hasAge } = useBirthdayText();
  const rows: Array<[string, ReactNode]> = [
    ['DESIGNATION', <Fill key="n" value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />],
    ['LINK TO SENDER', <Fill key="r" value={config.relationship.toUpperCase()} placeholder={PLACEHOLDER.relationship} />],
    ['CYCLES COMPLETED', <span key="a" className={cn(!hasAge && 'bd-placeholder')}>{age}</span>],
    ['STATUS', 'AMAZING'],
    ['THREAT LEVEL', 'DANGEROUSLY LOVABLE'],
  ];
  return (
    <section aria-label="Subject profile" className="grid min-h-[90dvh] items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <Panel title="SUBJECT SCAN">
        <div className="relative overflow-hidden">
          <PhotoSlot src={config.heroImage} alt={`Scan of ${name}`} label="Add hero photo" priority className="aspect-square w-full" imgClassName="saturate-[0.8] contrast-110" />
          <div aria-hidden className="df-scan pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[rgb(var(--bd-primary-rgb)/0.45)] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.25)_0_1px,transparent_1px_3px)]" />
          <ScanLine className="absolute top-3 right-3 size-6 text-[var(--bd-primary)]" aria-hidden />
        </div>
      </Panel>
      <div>
        <p className={`${mono} text-xs tracking-[0.35em] text-[var(--bd-secondary)]`}>SUBJECT IDENTIFIED</p>
        <h1 className="mt-3 text-5xl leading-none font-bold sm:text-7xl">
          <Glitch text="HAPPY BIRTHDAY," />
          <br />
          <span className="text-[var(--bd-primary)]">
            <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} />
          </span>
        </h1>
        <Panel className="mt-8" title="PROFILE DATA">
          <dl className={`${mono} space-y-3 text-sm`}>
            {rows.map(([k, v], i) => (
              <motion.div key={k} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2">
                <dt className="text-[#d8f7ff]/50">{k}</dt>
                <dd className="text-right text-[var(--bd-accent)]">{v}</dd>
              </motion.div>
            ))}
          </dl>
        </Panel>
      </div>
    </section>
  );
}

function Transmission() {
  const { config } = useExperience();
  const text = config.messages.main.trim() || PLACEHOLDER.message;
  const [decrypted, setDecrypted] = useState(false);
  const out = useScramble(text, decrypted, Math.min(4000, 800 + text.length * 8));
  return (
    <section aria-labelledby="df-msg" className="py-16">
      <Panel title="ENCRYPTED TRANSMISSION">
        <h2 id="df-msg" className="sr-only">
          A message just for you
        </h2>
        <p className={`${mono} text-xs text-[#d8f7ff]/50`}>
          SOURCE: <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} /> · PRIORITY: MAXIMUM
        </p>
        <p className={cn('mt-6 text-lg leading-relaxed whitespace-pre-line sm:text-xl', !decrypted && `${mono} text-[#d8f7ff]/40`)} aria-hidden={!decrypted}>
          {out}
        </p>
        {!decrypted && (
          <button
            type="button"
            onClick={() => setDecrypted(true)}
            className={`${mono} mt-8 inline-flex h-12 items-center gap-2 border border-[var(--bd-secondary)] px-6 text-xs tracking-[0.3em] text-[var(--bd-secondary)] hover:bg-[var(--bd-secondary)] hover:text-[#04060d]`}
          >
            <Unlock className="size-4" aria-hidden /> DECRYPT MESSAGE
          </button>
        )}
      </Panel>
    </section>
  );
}

function HoloCard({ m, onOpen }: { m: ResolvedMemory; onOpen: () => void }) {
  const [active, setActive] = useState(false);
  const title = useScramble(m.titleText, active, 700);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => setActive(true)}
      onFocus={() => setActive(true)}
      aria-label={`Open data log: ${m.titleText}`}
      className="df-holo group block w-full text-left"
    >
      <Panel className="!p-3 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="aspect-[4/3] w-full" imgClassName="transition-[filter] duration-500 hue-rotate-15 saturate-50 group-hover:hue-rotate-0 group-hover:saturate-100" />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.18)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-all duration-700 group-hover:bg-[position:-50%_0] group-hover:opacity-100" />
        </div>
        <p className={`${mono} mt-3 text-[0.65rem] tracking-widest text-[var(--bd-primary)]`}>LOG_{String(m.index + 1).padStart(4, '0')}.MEM</p>
        <p className="mt-1 font-semibold" aria-hidden>
          {active ? title : m.titleText.replace(/\S/g, '▒')}
        </p>
        <p className="mt-1 text-sm text-[#d8f7ff]/60">{active ? m.captionText : 'Hover or focus to decrypt'}</p>
      </Panel>
    </button>
  );
}

function DataLogs() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section aria-labelledby="df-logs" className="py-16">
      <p className={`${mono} text-xs tracking-[0.35em] text-[var(--bd-secondary)]`}>ARCHIVE ACCESS GRANTED</p>
      <h2 id="df-logs" className="mt-2 text-4xl font-bold sm:text-5xl">
        Data logs: moments worth remembering
      </h2>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((m, i) => (
          <motion.li key={m.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}>
            <HoloCard m={m} onOpen={() => setIndex(i)} />
          </motion.li>
        ))}
      </ul>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} />
    </section>
  );
}

function MissionLog() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section aria-labelledby="df-mission" className="py-16">
      <h2 id="df-mission" className="text-4xl font-bold sm:text-5xl">
        Mission log
      </h2>
      <ol className="mt-10 space-y-5">
        {items.map((t, i) => (
          <motion.li key={t.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }}>
            <Panel className="grid items-center gap-5 sm:grid-cols-[10rem_1fr_auto]">
              <PhotoSlot src={t.image} alt={t.titleText} label="Add photo" className="aspect-[4/3] w-full" />
              <div>
                <p className={`${mono} text-xs text-[var(--bd-primary)]`}>
                  ENTRY {String(i + 1).padStart(4, '0')} // T+{(i + 1) * 365}D
                </p>
                <h3 className="mt-1 text-2xl font-semibold">{t.titleText}</h3>
                <p className="text-[#d8f7ff]/65">{t.captionText}</p>
              </div>
              <span className={`${mono} text-xs text-[var(--bd-accent)]`}>[ARCHIVED]</span>
            </Panel>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Status() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [progress, setProgress] = useState<number | null>(null);
  const complete = progress !== null && progress >= 100;

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 4)), 45);
    return () => window.clearTimeout(t);
  }, [progress]);

  const fired = useRef(false);
  useEffect(() => {
    if (!complete || fired.current) return;
    fired.current = true;
    fx.cannons({ colors, count: 220, shapes: ['pixel'] });
    fx.fireworks({ colors, duration: 4, rockets: 10 });
  }, [complete, fx, colors]);

  return (
    <section aria-labelledby="df-status" className="flex min-h-dvh flex-col justify-center py-16">
      <Panel title="SYSTEM STATUS" className="mx-auto w-full max-w-3xl">
        <h2 id="df-status" className={`${mono} text-lg sm:text-2xl`}>
          MISSION: MAKE <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} /> SMILE
        </h2>
        <div className="mt-6 h-3 bg-white/10" role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Mission progress">
          <div className="h-full bg-gradient-to-r from-[var(--bd-primary)] via-[var(--bd-secondary)] to-[var(--bd-accent)] transition-[width] duration-75" style={{ width: `${progress ?? 0}%` }} />
        </div>
        <p className={`${mono} mt-3 text-sm`} aria-live="polite">
          STATUS:{' '}
          {complete ? (
            <span className="text-[var(--bd-accent)]">
              COMPLETE <Heart className="inline size-4 fill-current" aria-label="love" />
            </span>
          ) : progress === null ? (
            'AWAITING COMMAND'
          ) : (
            `EXECUTING… ${progress}%`
          )}
        </p>
        {progress === null && (
          <button
            type="button"
            onClick={() => setProgress(0)}
            className={`${mono} mt-8 inline-flex h-14 w-full items-center justify-center border border-[var(--bd-accent)] text-sm tracking-[0.3em] text-[var(--bd-accent)] hover:bg-[var(--bd-accent)] hover:text-[#04060d]`}
          >
            EXECUTE BIRTHDAY.EXE
          </button>
        )}
        <AnimatePresence>
          {complete && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 grid gap-6 md:grid-cols-2">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" className="aspect-square w-full" />
              <div className="flex flex-col justify-center">
                <p className="text-3xl font-bold">
                  <Glitch text="HAPPY BIRTHDAY" />
                </p>
                <p className="mt-4 text-lg leading-relaxed">
                  <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
                </p>
                <p className={`${mono} mt-4 text-xs text-[#d8f7ff]/50`}>{config.messages.final}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
      <div className="mt-10 text-center">
        <button type="button" onClick={restart} className={`${mono} h-11 text-xs tracking-[0.3em] text-[#d8f7ff]/50 hover:text-[#d8f7ff]`}>
          &gt; REBOOT SYSTEM
        </button>
      </div>
    </section>
  );
}
