import type { BirthdayConfig } from '@/types/birthday';

export interface ReadinessItem {
  id: string;
  label: string;
  done: boolean;
  /** Builder section to jump to. */
  section: 'basics' | 'photos' | 'messages' | 'memories';
}

/** The essentials that make the website feel personal rather than a template. */
export function getReadiness(config: BirthdayConfig): ReadinessItem[] {
  const memoryPhotos = config.memories.filter((m) => m.image).length;
  return [
    { id: 'name', label: 'Birthday person’s name', done: Boolean(config.birthdayPerson.trim()), section: 'basics' },
    { id: 'sender', label: 'Your name', done: Boolean(config.senderName.trim()), section: 'basics' },
    { id: 'hero', label: 'Hero photo', done: Boolean(config.heroImage), section: 'photos' },
    { id: 'message', label: 'Personal message', done: Boolean(config.messages.main.trim()), section: 'messages' },
    { id: 'surprise', label: 'Final surprise message', done: Boolean(config.messages.surprise.trim()), section: 'messages' },
    { id: 'memories', label: 'At least 3 memory photos', done: memoryPhotos >= 3, section: 'memories' },
  ];
}
