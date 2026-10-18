import type { BirthdayConfig } from '../src/types/birthday';

export interface PageMeta {
  title: string;
  description: string;
  url: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Link-preview tags for a shared birthday (what WhatsApp, iMessage or Slack show).
 * Only the first name and a hosted hero photo are used; messages stay private.
 */
export function birthdayMeta(
  config: BirthdayConfig | undefined,
  url: string,
  mediaPrefix: string,
  fallbackImage?: string,
): PageMeta {
  const name = config?.birthdayPerson.trim();
  const from = config?.senderName.trim();
  const image =
    config?.heroImage?.startsWith(mediaPrefix) && /\.(webp|jpg|png)$/.test(config.heroImage)
      ? config.heroImage
      : undefined;
  return {
    title: name ? `Happy Birthday, ${name}!` : 'A birthday surprise',
    description: from
      ? `${from} made you a birthday surprise. Open it 🎁`
      : 'Someone made you a birthday surprise. Open it 🎁',
    url,
    image: image ?? fallbackImage,
    noindex: true,
  };
}
