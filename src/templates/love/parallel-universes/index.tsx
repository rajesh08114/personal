import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';
import './universes.css';

/**
 * Parallel Universes — four vintage science-fiction paperbacks on a shelf.
 * Same two characters, four different editions of the story. Every one ends the same way.
 */

interface Edition {
  imprint: string;
  title: string;
  price: string;
  /** Visual style of the cover. */
  style: 'grid' | 'pulp' | 'double' | 'modern';
}

const EDITIONS: Edition[] = [
  { imprint: 'Orbit Science Fiction', title: 'The Day We Met', price: '3/6', style: 'grid' },
  { imprint: 'Astounding Paperbacks', title: 'The Funniest Planet', price: '35¢', style: 'pulp' },
  { imprint: 'Double Star Books', title: 'Our Best Day', price: '40¢', style: 'double' },
  { imprint: 'Meridian Modern Classics', title: 'The Life We Imagine', price: '£1.25', style: 'modern' },
];

interface Entry {
  title: string;
  text: string;
  image?: string;
  date?: string;
  place?: string;
}

function useEntries(): Entry[] {
  const { config } = useExperience();
  const t = getTimeline(config);
  const m = getMemories(config);
  const paras = splitParagraphs(config.messages.main);
  const pick = (x?: { titleText: string; captionText: string; image?: string; date?: string; place?: string }): Entry => ({
    title: x?.titleText ?? PLACEHOLDER.memoryTitle,
    text: x?.captionText ?? PLACEHOLDER.memoryCaption,
    image: x?.image,
    date: x?.date,
    place: x?.place,
  });
  return [pick(t[0]), pick(m[1] ?? m[0]), pick(m[3] ?? m[0]), { title: 'The life we imagine', text: paras[paras.length - 1] ?? PLACEHOLDER.message, image: config.finalImage ?? config.heroImage }];
}

export default function ParallelUniverses() {
  const { opened } = useExperience();
  return (
    <div className="pu-room min-h-dvh text-[#2b2520]">
      <AnimatePresence>{!opened && <Spine key="spine" />}</AnimatePresence>
      {opened && <Shelf />}
    </div>
  );
}

/** A paperback cover in one of four period styles. */
function Cover({ edition, entry, names, className }: { edition: Edition; entry: Entry; names: string; className?: string }) {
  const photo = <PhotoSlot src={entry.image} alt="" label="Add a cover photo" tone="light" className={cn(edition.style === 'grid' || edition.style === 'pulp' ? 'pu-duo' : 'pu-mono', 'h-full w-full')} />;
  switch (edition.style) {
    case 'grid':
      return (
        <div className={cn('pu-cover flex flex-col bg-[#f2ebdc]', className)}>
          <div className="flex h-[18%] items-center justify-center bg-[#d9762b] px-2 text-center">
            <span className="pu-jost text-[0.6em] font-medium tracking-[0.2em] text-[#f2ebdc] uppercase">{edition.imprint}</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-[4%] px-[8%] py-[6%] text-center">
            <p className="pu-jost text-[1.1em] leading-tight font-semibold">{edition.title}</p>
            <div className="aspect-square w-[70%] overflow-hidden bg-[#d9762b]">{photo}</div>
            <p className="pu-jost text-[0.6em] tracking-[0.15em] uppercase">{names}</p>
          </div>
          <div className="h-[8%] bg-[#d9762b]" />
        </div>
      );
    case 'pulp':
      return (
        <div className={cn('pu-cover relative overflow-hidden bg-[#2f5d62]', className)}>
          <div className="absolute inset-0">{photo}</div>
          <div className="absolute inset-x-0 top-0 bg-[#2b2520] px-[6%] py-[4%]">
            <p className="pu-anton text-[1.5em] leading-none text-[#f2c14e] uppercase">{edition.title}</p>
          </div>
          <span className="pu-jost absolute right-[5%] bottom-[16%] flex size-[2.6em] items-center justify-center rounded-full bg-[#c8442f] text-[0.6em] font-bold text-[#f2ebdc]">{edition.price}</span>
          <p className="pu-jost absolute inset-x-0 bottom-0 bg-[#f2c14e] px-[6%] py-[3%] text-[0.55em] font-semibold tracking-[0.12em] uppercase">
            Two strangers. One small planet.
          </p>
        </div>
      );
    case 'double':
      return (
        <div className={cn('pu-cover relative overflow-hidden bg-[#a8342b]', className)}>
          <div className="pu-diagonal absolute inset-0 bg-[#1f4e79]">
            <div className="absolute inset-[12%_8%_30%_30%]">{photo}</div>
          </div>
          <p className="pu-anton absolute top-[5%] left-[6%] max-w-[60%] text-[1.15em] leading-[1.05] text-[#f2ebdc] uppercase">{edition.title}</p>
          <p className="pu-jost absolute right-[6%] bottom-[5%] text-right text-[0.55em] font-semibold tracking-[0.15em] text-[#f2ebdc] uppercase">
            A Double Star novel
            <br />
            {edition.price}
          </p>
        </div>
      );
    default:
      return (
        <div className={cn('pu-cover flex flex-col items-center justify-between bg-[#1c1b19] px-[8%] py-[9%] text-center text-[#e9e2d3]', className)}>
          <p className="pu-jost text-[0.55em] tracking-[0.3em] uppercase">{edition.imprint}</p>
          <div className="aspect-square w-[72%] overflow-hidden rounded-full ring-[0.3em] ring-[#c9a34a]">{photo}</div>
          <div>
            <p className="pu-jost text-[1.1em] leading-tight font-light lowercase">{edition.title}</p>
            <p className="pu-jost mt-[0.4em] text-[0.55em] tracking-[0.2em] text-[#c9a34a] uppercase">{names}</p>
          </div>
        </div>
      );
  }
}

/** Opening: a single spine poking out of the shelf. Pull it. */
function Spine() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <p className="pu-jost text-xs tracking-[0.3em] text-[#2b2520]/60 uppercase">A theory of everything</p>
      <h1 className="pu-serif mt-4 max-w-2xl text-3xl leading-tight sm:text-5xl">
        {config.messages.intro.trim() || 'In every universe, I would still choose you.'}
      </h1>
      <motion.button
        type="button"
        onClick={open}
        aria-label="Pull the books off the shelf"
        className="group mt-12 flex h-60 items-end gap-1"
        whileHover="pull"
      >
        {['#d9762b', '#2f5d62', '#a8342b', '#1c1b19'].map((c, i) => (
          <motion.span
            key={c}
            variants={{ pull: { y: i === 1 ? -26 : -4 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="pu-spine flex w-10 items-center justify-center sm:w-12"
            style={{ background: c, height: `${[90, 100, 94, 86][i]}%` }}
          >
            <span className="pu-jost rotate-90 text-[0.6rem] tracking-[0.25em] whitespace-nowrap text-[#f2ebdc] uppercase">{EDITIONS[i].title}</span>
          </motion.span>
        ))}
      </motion.button>
      <div className="pu-shelf h-4 w-64 sm:w-72" />
      <p className="pu-serif mt-6 text-lg italic">Pull one off the shelf.</p>
    </motion.div>
  );
}

function Shelf() {
  const { config } = useExperience();
  const { name, sender } = useBirthdayText();
  const entries = useEntries();
  const [book, setBook] = useState<number | null>(null);
  const [read, setRead] = useState<number[]>([]);
  const [ending, setEnding] = useState(false);
  const names = `${name} & ${sender}`;

  const openBook = (i: number) => {
    setBook(i);
    setRead((r) => (r.includes(i) ? r : [...r, i]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
      <AnimatePresence mode="wait">
        {book === null && !ending && (
          <motion.section key="shelf" aria-labelledby="pu-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h1 id="pu-title" className="pu-serif text-4xl sm:text-6xl">
              Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />.
            </h1>
            <p className="pu-serif mx-auto mt-3 max-w-xl text-lg text-[#2b2520]/75 italic">Four editions of the same story. Different covers, different worlds, the same two people.</p>
            <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:grid-cols-4">
              {EDITIONS.map((e, i) => (
                <li key={e.title}>
                  <motion.button
                    type="button"
                    onClick={() => openBook(i)}
                    aria-label={`Open edition ${i + 1}: ${e.title}`}
                    whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="block w-full text-left"
                  >
                    <Cover edition={e} entry={entries[i]} names={names} className="aspect-[2/3] w-full text-[clamp(0.8rem,2.6vw,1.05rem)]" />
                  </motion.button>
                  <p className="pu-jost mt-3 text-xs tracking-[0.15em] text-[#2b2520]/60 uppercase">
                    Edition {i + 1} {read.includes(i) && '· read'}
                  </p>
                </li>
              ))}
            </ul>
            <div className="pu-shelf mt-2 h-4 w-full" />
            <button
              type="button"
              onClick={() => setEnding(true)}
              className={cn(
                'pu-jost mt-14 h-12 border-b-2 px-2 text-sm font-medium tracking-[0.2em] uppercase transition-colors',
                read.length >= 2 ? 'border-[#2b2520]' : 'border-[#2b2520]/30 text-[#2b2520]/70',
              )}
            >
              Turn to the last page
            </button>
          </motion.section>
        )}

        {book !== null && (
          <motion.section key={`book-${book}`} aria-label={`Edition ${book + 1}: ${EDITIONS[book].title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OpenBook edition={EDITIONS[book]} entry={entries[book]} names={names} index={book} />
            <nav aria-label="Move between editions" className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setBook(null)} className="pu-jost inline-flex h-11 items-center gap-2 text-sm tracking-[0.1em] uppercase underline underline-offset-4">
                <ArrowLeft className="size-4" aria-hidden /> Back to the shelf
              </button>
              {book < EDITIONS.length - 1 ? (
                <button type="button" onClick={() => openBook(book + 1)} className="pu-jost inline-flex h-11 items-center gap-2 bg-[#2b2520] px-5 text-sm tracking-[0.1em] text-[#f2ebdc] uppercase">
                  Next edition <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBook(null);
                    setEnding(true);
                  }}
                  className="pu-jost inline-flex h-11 items-center gap-2 bg-[#2b2520] px-5 text-sm tracking-[0.1em] text-[#f2ebdc] uppercase"
                >
                  The last page <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </nav>
          </motion.section>
        )}

        {ending && <Ending key="end" entries={entries} names={names} />}
      </AnimatePresence>
    </main>
  );
}

/** The cover swings open on its spine to reveal the chapter. */
function OpenBook({ edition, entry, names, index }: { edition: Edition; entry: Entry; names: string; index: number }) {
  return (
    <div className="mx-auto grid max-w-5xl md:grid-cols-2 [perspective:2000px]">
      <div className="pu-page relative hidden p-8 md:block">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <PhotoSlot src={entry.image} alt={entry.title} label="Add a photo" tone="light" className="h-full w-full" />
        </div>
        <p className="pu-serif mt-3 text-center text-sm italic">Plate {index + 1}. {entry.place || entry.title}</p>
      </div>
      <div className="relative">
        <article className="pu-page min-h-[28rem] p-8 sm:p-12">
          <p className="pu-jost text-xs tracking-[0.25em] text-[#2b2520]/60 uppercase">Chapter {index + 1}</p>
          <h2 className="pu-serif mt-2 text-3xl leading-tight sm:text-4xl">{entry.title}</h2>
          {(entry.date || entry.place) && <p className="pu-jost mt-2 text-xs tracking-[0.2em] uppercase">{[entry.date, entry.place].filter(Boolean).join(' · ')}</p>}
          <div className="mt-5 aspect-[4/3] w-full overflow-hidden md:hidden">
            <PhotoSlot src={entry.image} alt={entry.title} label="Add a photo" tone="light" className="h-full w-full" />
          </div>
          <p className="pu-serif pu-dropcap mt-6 text-xl leading-relaxed">{entry.text}</p>
          <p className="pu-serif mt-6 text-[#2b2520]/70 italic">…and in this edition too, it was you.</p>
        </article>
        {/* The cover, hinged on the left, swings open. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 origin-left [backface-visibility:hidden]"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -165, opacity: [1, 1, 0] }}
          transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1], opacity: { times: [0, 0.8, 1], duration: 1.1 } }}
        >
          <Cover edition={edition} entry={entry} names={names} className="h-full w-full text-[1.4rem]" />
        </motion.div>
      </div>
    </div>
  );
}

/** Final reveal: the four books stack, and the last page is the same in all of them. */
function Ending({ entries, names }: { entries: Entry[]; names: string }) {
  const { config, restart } = useExperience();
  return (
    <motion.section aria-labelledby="pu-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
      <div className="relative h-56 w-36 sm:h-64 sm:w-44" aria-hidden>
        {EDITIONS.map((e, i) => (
          <motion.div
            key={e.title}
            className="absolute inset-0"
            initial={{ x: `${(i - 1.5) * 115}%`, rotate: 0 }}
            animate={{ x: `${(i - 1.5) * 3}%`, y: -i * 3, rotate: (i - 1.5) * 2.5 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.3, 0, 0.2, 1] }}
          >
            <Cover edition={e} entry={entries[i]} names={names} className="h-full w-full text-[0.8rem] shadow-lg" />
          </motion.div>
        ))}
      </div>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="pu-page mt-14 w-full max-w-2xl px-8 py-12 sm:px-14"
        role="status"
      >
        <p className="pu-jost text-xs tracking-[0.25em] text-[#2b2520]/60 uppercase">The last page — every edition</p>
        <h2 id="pu-final" className="pu-serif mt-4 text-4xl leading-tight sm:text-5xl">
          Out of every possible universe, I’d still choose you.
        </h2>
        <p className="pu-serif mt-6 text-xl leading-relaxed">
          <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
        </p>
        <p className="pu-serif mt-8 italic">
          — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />, in this universe and every other
        </p>
        <p className="pu-jost mt-10 text-xs tracking-[0.3em] uppercase">The end · to be continued</p>
      </motion.article>
      <button type="button" onClick={restart} className="pu-jost mt-10 h-11 text-xs tracking-[0.2em] uppercase underline underline-offset-4">
        Put the books back
      </button>
    </motion.section>
  );
}
