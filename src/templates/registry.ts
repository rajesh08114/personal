import type { TemplateId } from '@/types/birthday';
import type { BirthdayTemplate, TemplateCategory } from '@/types/template';
import { auroraTemplate } from './aurora/meta';
import { starryNightTemplate } from './starry-night/meta';
import { polaroidMemoriesTemplate } from './polaroid-memories/meta';
import { cinematicFilmTemplate } from './cinematic-film/meta';
import { balloonFestivalTemplate } from './balloon-festival/meta';
import { scrapbookTemplate } from './scrapbook/meta';
import { minimalLuxuryTemplate } from './minimal-luxury/meta';
import { gameNightTemplate } from './game-night/meta';
import { loveLetterTemplate } from './love-letter/meta';
import { neonPartyTemplate } from './neon-party/meta';
import { gardenOfWishesTemplate } from './garden-of-wishes/meta';
import { filmRollTemplate } from './film-roll/meta';
import { timeCapsuleTemplate } from './time-capsule/meta';
import { comicBookTemplate } from './comic-book/meta';
import { fairytaleTemplate } from './fairytale/meta';
import { festivalTemplate } from './festival/meta';
import { cosmicJourneyTemplate } from './cosmic-journey/meta';
import { coffeeMemoriesTemplate } from './coffee-memories/meta';
import { digitalFutureTemplate } from './digital-future/meta';

/**
 * Every available birthday experience. Metadata + thumbnails load eagerly (they're tiny);
 * each template's actual experience is code-split and loaded on demand.
 */
export const TEMPLATES: BirthdayTemplate[] = [auroraTemplate, starryNightTemplate, polaroidMemoriesTemplate, cinematicFilmTemplate, balloonFestivalTemplate, scrapbookTemplate, minimalLuxuryTemplate, gameNightTemplate, loveLetterTemplate, neonPartyTemplate, gardenOfWishesTemplate, filmRollTemplate, timeCapsuleTemplate, comicBookTemplate, fairytaleTemplate, festivalTemplate, cosmicJourneyTemplate, coffeeMemoriesTemplate, digitalFutureTemplate];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: TemplateId): BirthdayTemplate {
  return BY_ID.get(id) ?? auroraTemplate;
}

export const CATEGORIES: Array<{ id: TemplateCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'fun', label: 'Fun' },
  { id: 'memories', label: 'Memories' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'creative', label: 'Creative' },
  { id: 'cozy', label: 'Cozy' },
];
