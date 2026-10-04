import { useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Paperclip } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const hand = 'font-t-display';

export default function LoveLetter() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh text-[#3b1d22]">
      <div aria-hidden className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#6e2433_0%,#3a121b_45%,#1c080d_100%)]">
        {[
          ['12%', '18%', 180, '#ffb38a'],
          ['78%', '12%', 120, '#ff8fa3'],
          ['86%', '66%', 220, '#ffcf9e'],
          ['6%', '72%', 160, '#ff8fa3'],
        ].map(([l, t, s, c], i) => (
          <span key={i} className="absolute rounded-full opacity-25 blur-3xl" style={{ left: l as string, top: t as string, width: s as number, height: s as number, background: c as string }} />
        ))}
        <Particles variant="embers" density={3} colors={['#ffcf9e', theme.accent]} />
      </div>
      <AnimatePresence mode="wait">{!opened ? <Envelope key="env" /> : <Letter key="letter" />}</AnimatePresence>
    </div>
  );
}

function Envelope() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  const [stage, setStage] = useState<'sealed' | 'broken' | 'open'>('sealed');
  const initial = config.birthdayPerson.trim().charAt(0).toUpperCase() || '♥';

  const breakSeal = () => {
    if (stage !== 'sealed') return;
    setStage('broken');
    window.setTimeout(() => setStage('open'), 500);
    window.setTimeout(open, 1900);
  };

  return (
    <motion.div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5" exit={{ opacity: 0, y: -40, transition: { duration: 0.8 } }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }} className={`${hand} mb-10 text-center text-4xl text-[#f6dccf] sm:text-5xl`}>
        {config.messages.intro.trim() || (
          <>
            A letter for <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </>
        )}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: stage === 'sealed' ? -2 : 0 }}
        transition={{ duration: 1.2, ease: EASE.out }}
        className="relative aspect-[3/2] w-[min(90vw,32rem)]"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="absolute inset-x-[5%] top-[8%] bottom-[8%] rounded-sm bg-[#fbf4e8] p-6 shadow"
          animate={stage === 'open' ? { y: '-55%', zIndex: 30 } : { y: 0, zIndex: 1 }}
          transition={{ delay: stage === 'open' ? 0.5 : 0, duration: 1, ease: EASE.out }}
        >
          <p className={`${hand} text-2xl text-[#7a2a3a]`}>My dearest {name}…</p>
          <div className="mt-4 space-y-3" aria-hidden>
            {[90, 75, 82, 60].map((w, i) => (
              <span key={i} className="block h-1.5 rounded bg-[#7a2a3a]/15" style={{ width: `${w}%` }} />
            ))}
          </div>
        </motion.div>
        <div className="paper-grain absolute inset-0 z-10 rounded-md bg-[#efdcc4] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)]" style={{ clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)' }} />
        <motion.div
          className="absolute inset-x-0 top-0 z-20 h-[56%] origin-top rounded-t-md bg-[#e6cdb0]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'hidden' }}
          animate={stage === 'open' ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
          transition={{ duration: 0.7, ease: EASE.inOut }}
        />
        <AnimatePresence>
          {stage === 'sealed' && (
            <motion.button
              type="button"
              onClick={breakSeal}
              aria-label="Break the wax seal to open your letter"
              exit={{ scale: 1.4, opacity: 0, rotate: 25, transition: { duration: 0.45 } }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute top-[44%] left-1/2 z-30 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#c9384f,var(--bd-primary)_55%,#5a1a28)] text-3xl text-[#f6dccf] shadow-[0_6px_14px_rgb(0_0_0/0.45),inset_0_-4px_8px_rgb(0_0_0/0.35)] sm:size-24"
            >
              <span className={hand}>{initial}</span>
              <span className="absolute inset-2 rounded-full border border-[#f6dccf]/30" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: stage === 'sealed' ? 1 : 0 }} transition={{ delay: 1.4 }} className="mt-10 text-lg text-[#f6dccf]/70 italic">
        Break the seal
      </motion.p>
    </motion.div>
  );
}

function Letter() {
  const { config, fx } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffb3c1']);
  const paragraphs = splitParagraphs(config.messages.main);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const [index, setIndex] = useState<number | null>(null);
  const date = formatBirthday(config.birthdayDate, { month: 'long', day: 'numeric' }) ?? new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  const hearts = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    fx.burst({ x: e.clientX, y: e.clientY, shape: 'heart', count: 8, colors, speed: 160, size: 14 });
  };

  // Interleave tucked photos between paragraphs.
  const blocks: Array<{ type: 'p'; text: string } | { type: 'photo'; i: number }> = [];
  const paras = paragraphs.length ? paragraphs : [''];
  const tucked: number[] = [];
  paras.forEach((text, i) => {
    blocks.push({ type: 'p', text });
    const from = Math.floor((i * memories.length) / paras.length);
    const to = Math.min(Math.floor(((i + 1) * memories.length) / paras.length), from + 2);
    for (let k = from; k < to; k++) {
      blocks.push({ type: 'photo', i: k });
      tucked.push(k);
    }
  });
  const rest = memories.filter((_, i) => !tucked.includes(i));

  return (
    <motion.main
      initial={{ opacity: 0, y: 80, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.4, ease: EASE.out }}
      className="relative z-10 px-3 py-16 sm:px-6 sm:py-24"
      onClick={hearts}
    >
      <article className="paper-grain relative mx-auto max-w-3xl rounded-sm bg-[#fbf4e8] px-6 pt-14 pb-20 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.8)] sm:px-16">
        <div className="absolute -top-6 right-4 w-36 rotate-[6deg] bg-white p-2 pb-6 shadow-lg sm:right-10 sm:w-44">
          <Paperclip className="absolute -top-4 left-6 size-8 -rotate-12 text-[#9a9a9a]" aria-hidden />
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add hero photo" tone="light" className="aspect-[4/5] w-full" />
        </div>
        <p className="text-sm tracking-[0.3em] text-[#7a2a3a]/70 uppercase">{date}</p>
        <motion.h1
          className={`${hand} mt-10 pr-36 text-5xl text-[var(--bd-primary)] sm:pr-44 sm:text-6xl`}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 2.4, ease: 'easeInOut', delay: 0.6 }}
        >
          My dearest <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />,
        </motion.h1>

        <div className="mt-12 space-y-8 text-[1.45rem] leading-[1.75] sm:text-[1.6rem]">
          {blocks.map((b, i) =>
            b.type === 'p' ? (
              <motion.p
                key={`p${i}`}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.3, ease: EASE.out }}
              >
                {b.text ? b.text : <Fill value="" placeholder={PLACEHOLDER.message} />}
              </motion.p>
            ) : (
              <TuckedPhoto key={`m${i}`} index={b.i} onOpen={() => setIndex(b.i)} />
            ),
          )}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} className="mt-16">
          <p className={`${hand} text-4xl text-[var(--bd-primary)] sm:text-5xl`}>Happy Birthday, with all my heart.</p>
          <p className="mt-8 text-xl italic">Forever yours,</p>
          <svg viewBox="0 0 500 110" className="mt-1 h-20 w-full max-w-sm" role="img" aria-label={config.senderName || PLACEHOLDER.sender}>
            <motion.text
              x="0"
              y="78"
              fontFamily="'Dancing Script', cursive"
              fontSize={config.senderName ? 72 : 34}
              fill="transparent"
              stroke="var(--bd-primary)"
              strokeWidth={1.1}
              initial={{ strokeDasharray: 1000, strokeDashoffset: 1000, fill: 'rgba(163,36,59,0)' }}
              whileInView={{ strokeDashoffset: 0, fill: 'rgba(163,36,59,1)' }}
              viewport={{ once: true }}
              transition={{ strokeDashoffset: { duration: 2.8, ease: 'easeInOut' }, fill: { delay: 2.2, duration: 1 } }}
            >
              {config.senderName || PLACEHOLDER.sender}
            </motion.text>
          </svg>
        </motion.div>

        <section aria-labelledby="ll-ps" className="mt-16 border-t border-dashed border-[#7a2a3a]/25 pt-10">
          <h2 id="ll-ps" className={`${hand} text-3xl text-[#7a2a3a]`}>
            P.S. — the moments I keep
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {timeline.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, rotate: i % 2 ? 3 : -3, y: 20 }}
                whileInView={{ opacity: 1, rotate: i % 2 ? 1.5 : -1.5, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#fffaf1] p-3 shadow-md"
              >
                <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="aspect-[16/10] w-full" />
                <p className={`${hand} mt-3 text-2xl`}>{t.titleText}</p>
                <p className="text-lg italic text-[#3b1d22]/75">{t.captionText}</p>
              </motion.li>
            ))}
            {rest.map((r) => (
              <li key={r.id} className="bg-[#fffaf1] p-3 shadow-md">
                <button type="button" onClick={() => setIndex(r.index)} className="block w-full text-left">
                  <PhotoSlot src={r.image} alt={r.titleText} label={r.slotLabel} tone="light" className="aspect-[16/10] w-full" />
                  <p className={`${hand} mt-3 text-2xl`}>{r.titleText}</p>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </article>
      <Hidden />
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${hand} text-3xl`} />
    </motion.main>
  );
}

function TuckedPhoto({ index, onOpen }: { index: number; onOpen: () => void }) {
  const { config } = useExperience();
  const m = getMemories(config)[index];
  const right = index % 2 === 1;
  return (
    <motion.figure
      initial={{ opacity: 0, x: right ? 40 : -40, rotate: right ? 8 : -8 }}
      whileInView={{ opacity: 1, x: 0, rotate: right ? 3 : -3 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.1, ease: EASE.out }}
      className={cn('w-56 bg-white p-2 pb-3 shadow-lg sm:w-64', right ? 'ml-auto' : '')}
    >
      <button type="button" onClick={onOpen} className="block w-full" aria-label={`Look closer at ${m.titleText}`}>
        <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="aspect-square w-full" />
      </button>
      <figcaption className={`${hand} mt-2 text-center text-xl text-[#3b1d22]`}>{m.titleText}</figcaption>
    </motion.figure>
  );
}

function Hidden() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffb3c1', '#ffffff']);
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto mt-16 max-w-2xl text-center" aria-live="polite">
      {!open ? (
        <button
          type="button"
          onClick={(e) => {
            setOpen(true);
            fx.burst({ x: e.clientX, y: e.clientY, shape: 'heart', count: 40, colors, speed: 380, size: 16 });
          }}
          className={`${hand} inline-flex h-14 items-center gap-3 rounded-full border border-[#f6dccf]/40 px-8 text-2xl text-[#f6dccf] transition-colors hover:bg-[#f6dccf]/10`}
        >
          <Heart className="size-5 fill-current" aria-hidden /> There’s something else in the envelope…
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 40, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ type: 'spring', stiffness: 80, damping: 12 }}>
          <div className="paper-grain mx-auto max-w-xl bg-[#fbf4e8] p-8 shadow-2xl">
            <Heart className="mx-auto size-7 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-hidden />
            <p className="mt-4 text-2xl leading-relaxed italic">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <div className="mt-6 overflow-hidden">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" tone="light" className="aspect-[4/3] w-full" />
            </div>
            <p className={`${hand} mt-5 text-2xl text-[#7a2a3a]`}>{config.messages.final}</p>
          </div>
          <button type="button" onClick={restart} className="mt-10 h-11 text-lg text-[#f6dccf]/60 italic hover:text-[#f6dccf]">
            fold the letter & read it again
          </button>
        </motion.div>
      )}
    </section>
  );
}
