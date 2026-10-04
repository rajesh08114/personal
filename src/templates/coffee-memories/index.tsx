import { useCallback, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Coffee, ConciergeBell } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { BirthdayCake, DEFAULT_CAKE_SKIN } from '@/components/experience/BirthdayCake';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './coffee.css';

const serif = 'font-t-display';
const chalk = 'font-t-accent';
type OrderId = 'special' | 'latte' | 'blend' | 'dessert';
const MENU: Array<{ id: OrderId; name: string; desc: string }> = [
  { id: 'special', name: 'Today’s Special', desc: 'A message, brewed just for you' },
  { id: 'latte', name: 'Memory Latte', desc: 'Our favourite moments, extra foam' },
  { id: 'blend', name: 'House Blend', desc: 'Our little story, slow roasted' },
  { id: 'dessert', name: 'Sweet Dessert', desc: 'A cupcake & the final surprise' },
];

export default function CoffeeMemories() {
  const { opened } = useExperience();
  const [served, setServed] = useState<OrderId[]>([]);
  const order = useCallback((id: OrderId) => {
    setServed((s) => (s.includes(id) ? s : [...s, id]));
    window.setTimeout(() => document.getElementById(`cm-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }, []);
  return (
    <div className="relative min-h-dvh bg-[#f3e6d3] text-[#3b2a1e]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_220_160/0.55),transparent_60%)]" />
      <AnimatePresence>{!opened && <Doorway key="d" />}</AnimatePresence>
      {opened && (
        <main className="relative z-10">
          <Welcome />
          <Menu served={served} onOrder={order} onOrderAll={() => setServed(MENU.map((m) => m.id))} />
          <div className="cm-table">
            <AnimatePresence>
              {MENU.filter((m) => served.includes(m.id)).map((m) => (
                <motion.div key={m.id} id={`cm-${m.id}`} className="scroll-mt-6" initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE.out }}>
                  {m.id === 'special' && <Special />}
                  {m.id === 'latte' && <Latte />}
                  {m.id === 'blend' && <Blend />}
                  {m.id === 'dessert' && <Dessert />}
                </motion.div>
              ))}
            </AnimatePresence>
            {served.length === 0 && <p className={`${chalk} py-16 text-center text-3xl text-[#f3e6d3]/80`}>Your table is ready — order something from the menu above ☕</p>}
          </div>
        </main>
      )}
    </div>
  );
}

function Steam({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute flex gap-2', className)}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="cm-steam block h-10 w-2 rounded-full bg-white/70 blur-[2px]" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </span>
  );
}

function Cup({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('relative block', className)}>
      <Steam className="-top-14 left-1/2 -translate-x-1/2" />
      <span className="relative block h-20 w-24 rounded-b-[2.5rem] bg-white shadow-[0_10px_20px_-6px_rgb(59_42_30/0.4)]">
        <span className="absolute inset-x-2 top-1.5 h-4 rounded-[50%] bg-[#6f4a32]" />
        <span className="absolute top-4 -right-5 h-10 w-7 rounded-r-full border-[6px] border-white" />
      </span>
      <span className="mx-auto mt-1 block h-3 w-36 rounded-[50%] bg-white/90 shadow" />
    </span>
  );
}

function Doorway() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2b1d14] px-6 text-center text-[#f3e6d3]" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
        <Cup className="mx-auto" />
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1.4 }} className={`${serif} mt-12 text-4xl sm:text-5xl`}>
        {config.messages.intro.trim() || 'Your favourite table is waiting…'}
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.04 }}
        className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--bd-accent)] px-8 font-semibold text-[#2b1d14]"
      >
        <Coffee className="size-5" aria-hidden /> Take a seat
      </motion.button>
    </motion.div>
  );
}

function Welcome() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section aria-label="Welcome" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-20 pb-12 md:grid-cols-2">
      <div className="text-center md:text-left">
        <p className={`${chalk} text-3xl text-[var(--bd-primary)]`}>Café de</p>
        <h1 className={`${serif} text-5xl leading-tight sm:text-7xl`}>
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h1>
        <p className="mt-4 text-xl italic">Open today only — to celebrate a very special birthday.</p>
      </div>
      <motion.div initial={{ rotate: -4, opacity: 0, y: 30 }} animate={{ rotate: -2, opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE.out }} className="relative mx-auto w-[min(80vw,22rem)] bg-white p-3 pb-10 shadow-xl">
        <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="aspect-square w-full" />
        <p className={`${chalk} absolute inset-x-0 bottom-2 text-center text-2xl`}>Guest of honour ♡</p>
      </motion.div>
    </section>
  );
}

function Menu({ served, onOrder, onOrderAll }: { served: OrderId[]; onOrder: (id: OrderId) => void; onOrderAll: () => void }) {
  return (
    <section aria-labelledby="cm-menu" className="px-5 pb-16">
      <div className="mx-auto max-w-3xl rounded-xl border-[12px] border-[#8b5e3c] bg-[#1f2a24] p-6 text-[#f5efe3] shadow-[0_30px_60px_-20px_rgb(59_42_30/0.6)] sm:p-10">
        <h2 id="cm-menu" className={`${chalk} text-center text-5xl`}>
          ~ Today’s Menu ~
        </h2>
        <ul className="mt-8 space-y-3">
          {MENU.map((m) => {
            const done = served.includes(m.id);
            return (
              <li key={m.id}>
                <button type="button" onClick={() => onOrder(m.id)} className="group flex w-full items-baseline gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/5">
                  <span className={`${chalk} text-3xl`}>{m.name}</span>
                  <span aria-hidden className="mb-2 flex-1 border-b-2 border-dotted border-[#f5efe3]/30" />
                  <span className={`${chalk} text-2xl ${done ? 'text-[var(--bd-accent)]' : 'text-[#f5efe3]/70 group-hover:text-[var(--bd-accent)]'}`}>{done ? 'served ✓' : 'order'}</span>
                </button>
                <p className="-mt-1 px-3 text-sm text-[#f5efe3]/60 italic">{m.desc}</p>
              </li>
            );
          })}
        </ul>
        {served.length < MENU.length && (
          <div className="mt-8 text-center">
            <button type="button" onClick={onOrderAll} className={`${chalk} inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#f5efe3]/40 px-6 text-2xl hover:bg-white/5`}>
              <ConciergeBell className="size-5" aria-hidden /> I’ll have everything
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function OrderUp({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <p className={`${chalk} text-center text-2xl text-[var(--bd-accent)]`}>order up!</p>
      <h2 className={`${serif} text-center text-4xl text-[#f3e6d3] sm:text-5xl`}>{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Special() {
  const { config } = useExperience();
  return (
    <OrderUp title="Today’s Special">
      <div className="mx-auto grid max-w-3xl items-end gap-8 md:grid-cols-[1fr_auto]">
        <article className="paper-grain rotate-[-1deg] bg-[#fffaf0] p-8 shadow-2xl sm:p-10">
          <p className={`${chalk} text-3xl text-[var(--bd-primary)]`}>A message just for you…</p>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-4 space-y-4 text-lg leading-relaxed" />
          <p className={`${chalk} mt-6 text-right text-3xl`}>
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </article>
        <Cup className="mx-auto mb-4" />
      </div>
    </OrderUp>
  );
}

function Latte() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <OrderUp title="Memory Latte">
      <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {memories.map((m, i) => (
          <motion.li key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }} className="relative">
            <button type="button" onClick={() => setIndex(i)} className="group block w-full bg-white p-2 pb-3 text-left shadow-lg transition-transform hover:-translate-y-1 hover:rotate-1" aria-label={`Open memory: ${m.titleText}`}>
              <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="aspect-square w-full" />
              <p className={`${chalk} mt-2 text-xl`}>{m.titleText}</p>
            </button>
            <span className={`${chalk} absolute -top-3 -right-2 rotate-12 rounded-sm bg-[var(--bd-accent)] px-2 text-lg text-[#2b1d14] shadow`}>priceless</span>
          </motion.li>
        ))}
      </ul>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={chalk} />
    </OrderUp>
  );
}

function Blend() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <OrderUp title="House Blend">
      <ol className="grid gap-6 sm:grid-cols-2">
        {items.map((t, i) => (
          <li key={t.id} className="relative overflow-hidden rounded-2xl bg-[#fffaf0] p-4 shadow-lg">
            <span aria-hidden className="absolute -top-6 -right-6 size-28 rounded-full border-[10px] border-[#8b5e3c]/15" />
            <p className={`${chalk} text-xl text-[var(--bd-primary)]`}>roast no. {i + 1}</p>
            <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="mt-2 aspect-[16/10] w-full rounded-xl" />
            <h3 className={`${serif} mt-3 text-2xl`}>{t.titleText}</h3>
            <p className="italic">{t.captionText}</p>
          </li>
        ))}
      </ol>
    </OrderUp>
  );
}

function Dessert() {
  const { config, fx, restart } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors(['#ff9ebb', '#9be7ff', '#ffe066']);
  const [blown, setBlown] = useState(false);
  const onAllOut = useCallback(() => {
    setBlown(true);
    fx.cannons({ colors, count: 180, shapes: ['rect', 'circle'] });
  }, [fx, colors]);

  return (
    <OrderUp title="Sweet Dessert">
      <div className="mx-auto max-w-md text-center text-[#f3e6d3]">
        <p className="text-lg italic">One cupcake, one candle, one wish.</p>
        <BirthdayCake
          shape="cupcake"
          candles={1}
          tone="dark"
          onAllOut={onAllOut}
          className="mt-6"
          skin={{ ...DEFAULT_CAKE_SKIN, frosting: '#fff1e6', sponge: '#c08a5b', spongeDark: '#8b5e3c', drip: '#ffd6e2', plate: 'rgba(255,255,255,0.7)' }}
        />
      </div>
      <AnimatePresence>
        {blown && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="mx-auto mt-12 max-w-md" role="status">
            <p className={`${chalk} text-center text-4xl text-[var(--bd-accent)]`}>{config.messages.wish}</p>
            <div className="cm-receipt mt-8 bg-[#fffdf7] px-7 pt-8 pb-10 font-mono text-sm text-[#3b2a1e] shadow-2xl">
              <p className="text-center text-base font-bold tracking-widest">CAFÉ DE {name.toUpperCase()}</p>
              <p className="text-center text-xs">{new Date().toLocaleDateString()}</p>
              <div className="my-4 border-t border-dashed border-[#3b2a1e]/40" />
              {[
                ['1x Today’s special', '♡'],
                ['1x Memory latte', '♡'],
                ['1x House blend', '♡'],
                ['1x Birthday cupcake', '♡'],
              ].map(([a, b]) => (
                <p key={a} className="flex justify-between">
                  <span>{a}</span>
                  <span>{b}</span>
                </p>
              ))}
              <div className="my-4 border-t border-dashed border-[#3b2a1e]/40" />
              <p className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span>PRICELESS</span>
              </p>
              <div className="my-4 border-t border-dashed border-[#3b2a1e]/40" />
              <div className="overflow-hidden">
                <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" tone="light" className="aspect-[4/3] w-full grayscale-[0.2]" />
              </div>
              <p className={`${chalk} mt-5 text-center text-2xl leading-snug`}>
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <p className="mt-4 text-center text-xs">SERVED WITH LOVE BY {sender.toUpperCase()}</p>
              <p className="mt-1 text-center text-xs">{config.messages.final}</p>
            </div>
            <div className="mt-8 text-center">
              <button type="button" onClick={restart} className={`${chalk} h-11 text-2xl text-[#f3e6d3] underline underline-offset-4`}>
                come back anytime
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrderUp>
  );
}
