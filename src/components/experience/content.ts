import type { BirthdayConfig, Memory, TimelineItem } from '@/types/birthday';
import { PLACEHOLDER } from '@/data/placeholders';
import type { LightboxItem } from './Lightbox';

export interface ResolvedMemory extends Memory {
  index: number;
  /** Label for the empty upload state, e.g. "Photo 03 · Upload memory". */
  slotLabel: string;
  titleText: string;
  captionText: string;
  hasTitle: boolean;
  hasCaption: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The creator's memories, or `fallbackCount` placeholder slots if they removed them all —
 * so a gallery is never an empty section.
 */
export function getMemories(config: BirthdayConfig, fallbackCount = 6): ResolvedMemory[] {
  const list: Memory[] = config.memories.length
    ? config.memories
    : Array.from({ length: fallbackCount }, (_, i) => ({ id: `ph-${i}`, title: '', description: '' }));
  return list.map((m, i) => ({
    ...m,
    index: i,
    slotLabel: `Photo ${pad(i + 1)} · Upload memory`,
    titleText: m.title.trim() || PLACEHOLDER.memoryTitle,
    captionText: m.description.trim() || PLACEHOLDER.memoryCaption,
    hasTitle: Boolean(m.title.trim()),
    hasCaption: Boolean(m.description.trim()),
  }));
}

export interface ResolvedTimelineItem extends TimelineItem {
  index: number;
  titleText: string;
  captionText: string;
}

export function getTimeline(config: BirthdayConfig): ResolvedTimelineItem[] {
  const list: TimelineItem[] = config.timeline.length
    ? config.timeline
    : [{ id: 'ph-0', title: '', description: '' }];
  return list.map((t, i) => ({
    ...t,
    index: i,
    titleText: t.title.trim() || PLACEHOLDER.timelineTitle,
    captionText: t.description.trim() || PLACEHOLDER.timelineCaption,
  }));
}

export function toLightboxItems(memories: ResolvedMemory[]): LightboxItem[] {
  return memories.map((m) => ({ id: m.id, src: m.image, title: m.titleText, caption: m.captionText }));
}
