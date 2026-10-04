import type { BirthdayConfig, TemplateId } from '@/types/birthday';
import { createDefaultConfig } from './defaultConfig';
import { sampleArt } from './sampleArt';

/**
 * Fictional sample content used ONLY for template previews.
 * Real birthdays start from createDefaultConfig() with visible placeholders.
 */
export function createSampleConfig(templateId: TemplateId = 'aurora'): BirthdayConfig {
  const base = createDefaultConfig();
  const memoryCopy: Array<[string, string]> = [
    ['Road trip to the coast', "That day we'll never forget."],
    ['Midnight pancakes', 'Nobody remembers whose idea it was.'],
    ['The concert', 'We lost our voices and found a new favourite song.'],
    ['Rainy-day museum', 'You explained every painting wrong. Confidently.'],
    ['Graduation', 'Proud does not even begin to cover it.'],
    ['Sunday picnic', 'The ants enjoyed it too.'],
  ];
  return {
    ...base,
    templateId,
    birthdayPerson: 'Maya',
    senderName: 'Alex',
    relationship: 'Best friend',
    birthdayDate: '1999-10-12',
    age: 27,
    heroImage: sampleArt(0, 'Sample portrait'),
    finalImage: sampleArt(4, 'Sample photo', 'landscape'),
    messages: {
      intro: '',
      main: [
        'Happy birthday to the person who makes ordinary days feel like an adventure.',
        'Thank you for every late-night talk, every terrible joke, and every time you showed up exactly when I needed you.',
        'I hope this year gives back even a fraction of the joy you give everyone around you.',
      ].join('\n\n'),
      wish: 'May this year be your best one yet.',
      surprise:
        'No matter how many birthdays come and go, I hope you always remember how special you are.',
      final: 'Keep smiling. Keep dreaming. Keep being you.',
    },
    memories: base.memories.map((m, i) => ({
      ...m,
      image: sampleArt(i + 1, `Sample memory ${i + 1}`, i % 3 === 1 ? 'landscape' : 'portrait'),
      title: memoryCopy[i][0],
      description: memoryCopy[i][1],
    })),
    timeline: base.timeline.map((t, i) => ({
      ...t,
      image: i < 3 ? sampleArt(i + 5, 'Sample photo', 'landscape') : undefined,
    })),
  };
}
