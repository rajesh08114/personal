import type { BirthdayConfig, TemplateId } from '@/types/birthday';
import { createDefaultConfig } from './defaultConfig';

type Copy = { title: string; description: string; date?: string; place?: string };

// Each caption is written for the photo it sits on, so previews never show "Graduation" over a banquet hall.
const FRIEND_MEMORIES: Copy[] = [
  { title: 'Festival weekend', description: "That day we'll never forget.", date: 'Aug 2019', place: 'Big Sur' },
  { title: 'Group hugs only', description: 'Nobody remembers whose idea it was.', date: 'Jan 2020', place: 'Your kitchen' },
  { title: 'The concert', description: 'We lost our voices and found a new favourite song.', date: 'May 2021', place: 'The Greek' },
  { title: 'Rooftop sunset', description: 'Arms up, phones down, everyone loud.', date: 'Nov 2021', place: 'The rooftop' },
  { title: 'Summer fields', description: 'Proud does not even begin to cover it.', date: 'Jun 2022', place: 'Countryside' },
  { title: 'The big dinner', description: 'The table was set long before the first toast.', date: 'Apr 2023', place: 'Garden hall' },
];

const LOVE_MEMORIES: Copy[] = [
  { title: 'The day we met', description: 'You laughed at my terrible joke. I knew I was in trouble.', date: '14 Mar 2020', place: 'The corner café' },
  { title: 'Dancing in the woods', description: 'No music. Just us, and you stepping on my feet.', date: 'Jul 2020', place: 'Sintra' },
  { title: 'The promise', description: 'Small ring, enormous feelings.', date: 'Dec 2020', place: 'Our first apartment' },
  { title: 'Lights in the dark', description: 'You cried. I pretended I didn’t.', date: 'Feb 2022', place: 'Tromsø' },
  { title: 'Dinner under the stars', description: 'Candles, a blanket and nowhere to be.', date: 'Oct 2023', place: 'The lakeside' },
  { title: 'The best ordinary day', description: 'Nothing happened, and it was perfect.', date: 'Every day', place: 'Wherever you are' },
];

const LOVE_TIMELINE: Copy[] = [
  { title: 'The Beginning', description: 'A coffee that turned into a five-hour conversation.', date: '14 Mar 2020', place: 'The corner café' },
  { title: 'The First Memory', description: 'Our first “I love you”, whispered by accident.', date: 'Jun 2020', place: 'The pier' },
  { title: 'The Crazy Moments', description: 'Flat tyres, lost luggage and laughing through all of it.', date: '2021 – 2023', place: 'Everywhere' },
  { title: 'Today', description: 'Still my favourite person in every room.', date: 'Today', place: 'Right here' },
];

const FRIEND_PHOTOS = [
  '/people/mem_roadtrip.webp',
  '/people/mem_pancakes.webp',
  '/people/mem_concert.webp',
  '/people/couple_sunset.webp',
  '/people/love_lights.webp',
  '/people/birthday_cake.webp',
];

const LOVE_PHOTOS = [
  '/people/love_day_met.webp',
  '/people/love_forest_dance.webp',
  '/people/love_trip.webp',
  '/people/love_sunday.webp',
  '/people/love_stars_dinner.webp',
  '/people/love_forest_dance.webp',
];

/**
 * Fictional sample content used ONLY for template previews.
 * Real birthdays start from createDefaultConfig() with visible placeholders.
 */
export function createSampleConfig(templateId: TemplateId = 'birthday-edition', opts: { love?: boolean } = {}): BirthdayConfig {
  const base = createDefaultConfig();
  const love = Boolean(opts.love);
  const memories = love ? LOVE_MEMORIES : FRIEND_MEMORIES;
  return {
    ...base,
    templateId,
    birthdayPerson: love ? 'Emma' : 'Maya',
    senderName: love ? 'Noah' : 'Alex',
    relationship: love ? 'Partner' : 'Best friend',
    birthdayDate: '1999-10-12',
    age: 27,
    heroImage: love ? '/people/love_forest_dance.webp' : '/people/maya_hero.webp',
    finalImage: love ? '/people/love_stars_dinner.webp' : '/people/birthday_cake.webp',
    messages: {
      intro: '',
      main: love
        ? [
            'Happy birthday to the person who turned my ordinary life into my favourite story.',
            'Thank you for the slow mornings, the late-night talks, and for choosing me — again and again.',
            'I love who I am when I’m with you, and I can’t wait for every chapter still to come.',
          ].join('\n\n')
        : [
            'Happy birthday to the person who makes ordinary days feel like an adventure.',
            'Thank you for every late-night talk, every terrible joke, and every time you showed up exactly when I needed you.',
            'I hope this year gives back even a fraction of the joy you give everyone around you.',
          ].join('\n\n'),
      wish: 'May this year be your best one yet.',
      surprise: love
        ? 'The best thing in my life is having you in it. Today, tomorrow, always.'
        : 'No matter how many birthdays come and go, I hope you always remember how special you are.',
      final: love ? 'Forever isn’t long enough with you.' : 'Keep smiling. Keep dreaming. Keep being you.',
    },
    memories: base.memories.map((m, i) => ({
      ...m,
      image: love ? LOVE_PHOTOS[i % LOVE_PHOTOS.length] : FRIEND_PHOTOS[i % FRIEND_PHOTOS.length],
      ...memories[i],
    })),
    timeline: base.timeline.map((t, i) => ({
      ...t,
      ...(love ? LOVE_TIMELINE[i] : { date: ['2016', '2018', '2021', 'Today'][i] }),
      image: i < 3 ? (love ? LOVE_PHOTOS[i] : FRIEND_PHOTOS[i]) : undefined,
    })),
  };
}
