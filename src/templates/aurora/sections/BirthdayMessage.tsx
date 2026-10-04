import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { TextReveal } from '@/components/experience/Motion';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';

export function BirthdayMessage() {
  const { config } = useExperience();
  const colors = useThemeColors();
  const paragraphs = splitParagraphs(config.messages.main);

  return (
    <section id="aurora-message" aria-labelledby="aurora-message-title" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <Particles variant="dust" density={3} colors={colors} />
      <div className="relative mx-auto max-w-3xl">
        <TextReveal
          id="aurora-message-title"
          as="h2"
          text="A message just for you…"
          className="text-center font-display text-4xl font-light text-white italic sm:text-6xl"
        />
        <motion.article
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: EASE.out }}
          className="glass relative mt-12 rounded-[2rem] p-7 shadow-[0_30px_80px_-30px_rgb(var(--bd-primary-rgb)/0.5)] sm:p-12"
        >
          <Quote className="absolute -top-5 left-8 size-10 rounded-full bg-[var(--bd-primary)] p-2.5 text-white" aria-hidden />
          <div className="space-y-6 font-display text-xl leading-[1.75] text-white/90 sm:text-2xl">
            {paragraphs.length === 0 ? (
              <p>
                <Fill value="" placeholder={PLACEHOLDER.message} />
              </p>
            ) : (
              paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.9, delay: 0.1, ease: EASE.out }}
                  className="whitespace-pre-line"
                >
                  {p}
                </motion.p>
              ))
            )}
          </div>
          <p className="mt-10 text-right text-sm font-semibold tracking-[0.2em] text-white/60 uppercase">
            — With love, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} className="text-[var(--bd-accent)]" />
          </p>
        </motion.article>
      </div>
    </section>
  );
}
