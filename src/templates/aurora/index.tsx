import { AnimatePresence } from 'motion/react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { CursorGlow, ScrollProgress } from '@/components/effects/Interactive';
import { Particles } from '@/components/effects/Particles';
import { OpeningExperience } from './sections/OpeningExperience';
import { HeroSection } from './sections/HeroSection';
import { BirthdayMessage } from './sections/BirthdayMessage';
import { PhotoGallery } from './sections/PhotoGallery';
import { MemoryTimeline } from './sections/MemoryTimeline';
import { CakeSection } from './sections/CakeSection';
import { SurpriseReveal } from './sections/SurpriseReveal';
import { FinalMessage } from './sections/FinalMessage';
import './aurora.css';

/**
 * Aurora Surprise — the signature experience.
 * ACT 1 Surprise → ACT 2 Birthday → ACT 3 Memories → ACT 4 Wish → ACT 5 Final Surprise → ACT 6 Message.
 */
export default function AuroraTemplate() {
  const { opened } = useExperience();
  const colors = useThemeColors();

  return (
    <div className="relative text-white">
      <div className="aurora-bg" aria-hidden>
        <div className="aurora-blob a" />
        <div className="aurora-blob b" />
        <div className="aurora-blob c" />
        <Particles variant="stars" density={4} colors={['#ffffff', ...colors]} />
      </div>

      <AnimatePresence>{!opened && <OpeningExperience key="opening" />}</AnimatePresence>

      {opened && (
        <main className="relative z-10">
          <ScrollProgress />
          <CursorGlow />
          <HeroSection />
          <BirthdayMessage />
          <PhotoGallery />
          <MemoryTimeline />
          <CakeSection />
          <SurpriseReveal />
          <FinalMessage />
        </main>
      )}
    </div>
  );
}
