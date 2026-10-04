import type { TemplateId } from '@/types/birthday';
import type { BirthdayTemplate, LoveTag, TemplateCategory } from '@/types/template';
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
import { ourStoryTemplate } from './love/our-story/meta';
import { twoSoulsTemplate } from './love/two-souls/meta';
import { memoryGalleryTemplate } from './love/memory-gallery/meta';
import { midnightDateTemplate } from './love/midnight-date/meta';
import { roseGardenTemplate } from './love/rose-garden/meta';
import { polaroidWallTemplate } from './love/polaroid-wall/meta';
import { foreverTimelineTemplate } from './love/forever-timeline/meta';
import { constellationOfUsTemplate } from './love/constellation-of-us/meta';
import { secretGardenTemplate } from './love/secret-garden/meta';
import { vinylLoveTemplate } from './love/vinyl-love/meta';
import { candlelightDinnerTemplate } from './love/candlelight-dinner/meta';
import { parallelUniversesTemplate } from './love/parallel-universes/meta';
import { messageInTheStarsTemplate } from './love/message-in-the-stars/meta';
import { giftBoxTemplate } from './love/gift-box/meta';
import { cinemaDateTemplate } from './love/cinema-date/meta';
import { digitalHeartbeatTemplate } from './love/digital-heartbeat/meta';
import { foreverLetterboxTemplate } from './love/forever-letterbox/meta';
import { handwrittenJournalTemplate } from './love/handwritten-journal/meta';
import { ourLittleUniverseTemplate } from './love/our-little-universe/meta';

/**
 * Every available birthday experience. Metadata + thumbnails load eagerly (they're tiny);
 * each template's actual experience is code-split and loaded on demand.
 */
export const TEMPLATES: BirthdayTemplate[] = [auroraTemplate, starryNightTemplate, polaroidMemoriesTemplate, cinematicFilmTemplate, balloonFestivalTemplate, scrapbookTemplate, minimalLuxuryTemplate, gameNightTemplate, loveLetterTemplate, neonPartyTemplate, gardenOfWishesTemplate, filmRollTemplate, timeCapsuleTemplate, comicBookTemplate, fairytaleTemplate, festivalTemplate, cosmicJourneyTemplate, coffeeMemoriesTemplate, digitalFutureTemplate, ourStoryTemplate, twoSoulsTemplate, memoryGalleryTemplate, midnightDateTemplate, roseGardenTemplate, polaroidWallTemplate, foreverTimelineTemplate, constellationOfUsTemplate, secretGardenTemplate, vinylLoveTemplate, candlelightDinnerTemplate, parallelUniversesTemplate, messageInTheStarsTemplate, giftBoxTemplate, cinemaDateTemplate, digitalHeartbeatTemplate, foreverLetterboxTemplate, handwrittenJournalTemplate, ourLittleUniverseTemplate];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: TemplateId): BirthdayTemplate {
  return BY_ID.get(id) ?? auroraTemplate;
}

export const CATEGORIES: Array<{ id: TemplateCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'love', label: 'Love & Romance' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'fun', label: 'Fun' },
  { id: 'memories', label: 'Memories' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'creative', label: 'Creative' },
  { id: 'cozy', label: 'Cozy' },
];

export const LOVE_TAGS: Array<{ id: LoveTag | 'all'; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'cute', label: 'Cute' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'magical', label: 'Magical' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'creative', label: 'Creative' },
  { id: 'premium', label: 'Premium' },
];

export const isLoveTemplate = (id: TemplateId) => getTemplate(id).categories.includes('love');
