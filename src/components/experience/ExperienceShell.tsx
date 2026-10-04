import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import type { BirthdayConfig, ExperienceMode } from '@/types/birthday';
import { getTemplate } from '@/templates/registry';
import { resolveTheme, themeToCssVars } from '@/themes/resolveTheme';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { TIER_SCALE, useDeviceTier } from '@/hooks/useDeviceTier';
import { useAudioController } from '@/hooks/useAudioController';
import { getTurningAge } from '@/utils/date';
import { FxLayer, noopFx, type FxApi } from '@/components/effects/FxLayer';
import { ExperienceContext, type ExperienceValue } from './ExperienceContext';
import { MusicPlayer } from './MusicPlayer';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingScreen } from '@/components/ui/Layout';

const EFFECT_SCALE = { subtle: 0.55, normal: 1, lively: 1.4 } as const;

interface ExperienceShellProps {
  config: BirthdayConfig;
  mode: ExperienceMode;
  /** Start past the opening screen (used when replaying inside the editor). */
  startOpened?: boolean;
}

/**
 * Hosts any template: applies its theme + fonts, provides shared services
 * (effects canvas, music, reduced-motion, opening state) through ExperienceContext.
 */
export function ExperienceShell({ config, mode, startOpened = false }: ExperienceShellProps) {
  const template = getTemplate(config.templateId);
  const theme = useMemo(() => resolveTheme(config.theme, template.palette), [config.theme, template.palette]);
  const reducedMotion = usePrefersReducedMotion();
  const tier = useDeviceTier();
  const audio = useAudioController(config.music);
  const [opened, setOpened] = useState(startOpened);
  const fxRef = useRef<FxApi>(null);

  useGoogleFonts(template.fonts.google);

  // Switching templates restarts the story from its opening.
  useEffect(() => {
    setOpened(startOpened);
    window.scrollTo(0, 0);
  }, [config.templateId, startOpened]);

  // Keep the page still until the recipient opens their surprise.
  useEffect(() => {
    if (opened) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [opened]);

  const name = config.birthdayPerson.trim();
  useEffect(() => {
    if (mode === 'embed') return;
    document.title = name ? `Happy Birthday, ${name}!` : 'A birthday surprise';
  }, [name, mode]);

  const { play } = audio;
  const playMusic = useCallback(() => void play(), [play]);
  const open = useCallback(() => {
    setOpened(true);
    void play();
  }, [play]);

  const restart = useCallback(() => {
    fxRef.current?.clear();
    setOpened(false);
    window.scrollTo({ top: 0 });
  }, []);

  const effectsScale = EFFECT_SCALE[theme.effects];
  const fx = useMemo<FxApi>(
    () => ({
      confetti: (o) => fxRef.current?.confetti(o),
      cannons: (o) => fxRef.current?.cannons(o),
      rain: (o) => fxRef.current?.rain(o),
      burst: (o) => fxRef.current?.burst(o),
      fireworks: (o) => fxRef.current?.fireworks(o),
      clear: () => fxRef.current?.clear(),
    }),
    [],
  );

  const value = useMemo<ExperienceValue>(
    () => ({
      config,
      template,
      mode,
      theme,
      opened,
      open,
      restart,
      fx: reducedMotion ? noopFx : fx,
      effectsScale,
      reducedMotion,
      age: getTurningAge(config),
      audio: { available: audio.available, playing: audio.playing, getLevels: audio.getLevels, play: playMusic, pause: audio.pause },
    }),
    [config, template, mode, theme, opened, open, restart, fx, effectsScale, reducedMotion, audio.available, audio.playing, audio.getLevels, playMusic, audio.pause],
  );

  const Template = template.component;

  return (
    <MotionConfig reducedMotion="user">
      <ExperienceContext.Provider value={value}>
        <div
          className="relative min-h-dvh overflow-x-clip"
          style={{
            ...themeToCssVars(theme),
            fontFamily: template.fonts.body,
            ['--font-display-t' as string]: template.fonts.display,
            ['--font-accent-t' as string]: template.fonts.accent ?? template.fonts.display,
            ['--focus-color' as string]: theme.accent,
          }}
          data-template={template.id}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Template />
            </Suspense>
          </ErrorBoundary>
          <FxLayer ref={fxRef} scale={TIER_SCALE[tier] * effectsScale} enabled={!reducedMotion} />
          {audio.available && opened && <MusicPlayer audio={audio} tone={template.tone} songName={config.music.name} />}
        </div>
      </ExperienceContext.Provider>
    </MotionConfig>
  );
}
