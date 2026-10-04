import { motion } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

/** ACT 6 — The Birthday Message. A slow, cinematic ending. */
export function FinalMessage() {
  const { config, restart } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors();
  const image = config.finalImage ?? config.heroImage;

  return (
    <footer className="relative overflow-hidden px-5 pt-24 pb-32 sm:px-8 sm:pt-32">
      <Particles variant="embers" density={4} colors={colors} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(14px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.6, ease: EASE.out }}
          className="font-display text-5xl leading-none font-light tracking-tight text-white uppercase sm:text-7xl lg:text-8xl"
        >
          Happy Birthday,
          <span className="mt-3 block italic normal-case">
            <span className="aurora-gradient-text">
              <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
            </span>
            <Heart className="ml-3 inline size-10 -translate-y-1 fill-[var(--bd-primary)] text-[var(--bd-primary)] sm:size-14" aria-hidden />
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="mt-8 font-display text-2xl text-white/80 italic sm:text-3xl"
        >
          {config.messages.final.trim() || 'Keep smiling. Keep dreaming. Keep being you.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, clipPath: 'inset(20% 20% 20% 20% round 2rem)' }}
          whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 2rem)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: EASE.out }}
          className="mt-14 w-full overflow-hidden rounded-[2rem] shadow-[0_40px_120px_-30px_rgb(var(--bd-primary-rgb)/0.6)]"
        >
          <PhotoSlot src={image} alt={`A final photo for ${name}`} label="Add a final photo" className="aspect-[16/10] w-full" />
        </motion.div>

        <div className="mt-16 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-[0.25em] text-white/60 uppercase">
            Made with <Heart className="mx-1 inline size-4 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-label="love" /> by
          </p>
          <svg viewBox="0 0 600 120" className="h-24 w-full max-w-lg" role="img" aria-label={sender}>
            <motion.text
              x="50%"
              y="70%"
              textAnchor="middle"
              className="font-display italic"
              fontSize={config.senderName ? 72 : 40}
              fill="transparent"
              stroke="var(--bd-accent)"
              strokeWidth={1.2}
              initial={{ strokeDasharray: 1200, strokeDashoffset: 1200, fill: 'rgba(255,255,255,0)' }}
              whileInView={{ strokeDashoffset: 0, fill: 'rgba(255,255,255,0.95)' }}
              viewport={{ once: true }}
              transition={{ strokeDashoffset: { duration: 2.6, ease: 'easeInOut' }, fill: { duration: 1.2, delay: 2 } }}
            >
              {sender}
            </motion.text>
          </svg>
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-12 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-4" aria-hidden /> Experience it again
        </button>
      </div>
    </footer>
  );
}
