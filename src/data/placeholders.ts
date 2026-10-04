/**
 * Visible placeholders for anything personal the creator hasn't filled in yet.
 * The experience never invents personal details — it shows these instead.
 */
export const PLACEHOLDER = {
  name: '[BIRTHDAY PERSON NAME]',
  sender: '[SENDER NAME]',
  relationship: '[RELATIONSHIP]',
  message: '[WRITE YOUR PERSONAL BIRTHDAY MESSAGE HERE]',
  surprise: '[WRITE YOUR FINAL SURPRISE MESSAGE]',
  memoryTitle: '[MEMORY TITLE]',
  memoryCaption: '[ADD A CAPTION FOR THIS MEMORY]',
  timelineTitle: '[CHAPTER TITLE]',
  timelineCaption: '[WHAT HAPPENED HERE?]',
  age: '[AGE]',
  date: '[BIRTHDAY DATE]',
} as const;

export function isPlaceholder(value: string): boolean {
  return /^\[[^\]]+\]$/.test(value.trim());
}
