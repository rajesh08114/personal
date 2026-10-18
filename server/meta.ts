import type { BirthdayConfig } from '../src/types/birthday';

export interface PageMeta {
  title: string;
  description: string;
  url: string;
  image?: string;
  noindex?: boolean;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

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

/** Replaces the title and social tags in the built index.html. */
export function injectMeta(html: string, meta: PageMeta): string {
  const card = meta.image ? 'summary_large_image' : 'summary';
  const tags = [
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:url" content="${escape(meta.url)}" />`,
    meta.image ? `<meta property="og:image" content="${escape(meta.image)}" />` : '',
    `<meta name="twitter:card" content="${card}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '',
  ]
    .filter(Boolean)
    .join('\n    ');
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(/\s*<meta (property="og:(title|description|url|image)"|name="twitter:card")[^>]*>/g, '')
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${escape(meta.description)}"`,
    )
    .replace('</head>', `    ${tags}\n  </head>`);
}
