import type { BirthdayConfig, Memory, TimelineItem } from '@/types/birthday';
import { createId } from '@/utils/id';

export const MAX_MEMORIES = 12;
export const MAX_TIMELINE = 6;

export function createMemory(partial: Partial<Memory> = {}): Memory {
  return { id: createId(8), title: '', description: '', ...partial };
}

export function createTimelineItem(partial: Partial<TimelineItem> = {}): TimelineItem {
  return { id: createId(8), title: '', description: '', ...partial };
}

/** Generic story beats — template copy, not personal information. Fully editable. */
const DEFAULT_TIMELINE: Array<Pick<TimelineItem, 'title' | 'description'>> = [
  { title: 'The Beginning', description: 'Where everything started.' },
  { title: 'The Crazy Moments', description: 'Too many memories to count.' },
  { title: 'The Best Memories', description: 'Some moments deserve to stay forever.' },
  { title: 'Today', description: 'Another year of being amazing.' },
];

/** A brand-new, empty birthday. Every personal field shows a placeholder. */
export function createDefaultConfig(): BirthdayConfig {
  return {
    version: 1,
    templateId: 'birthday-edition',
    birthdayPerson: '',
    senderName: '',
    relationship: '',
    birthdayDate: undefined,
    age: undefined,
    heroImage: undefined,
    finalImage: undefined,
    messages: {
      intro: '',
      main: '',
      wish: 'May this year be your best one yet.',
      surprise: '',
      final: 'Keep smiling. Keep dreaming. Keep being you.',
    },
    memories: Array.from({ length: 6 }, () => createMemory()),
    timeline: DEFAULT_TIMELINE.map((t) => createTimelineItem(t)),
    theme: { preset: 'template', primary: '#d9467a', secondary: '#7c3aed', accent: '#f6c66a' },
    music: { enabled: true, volume: 0.6 },
  };
}
