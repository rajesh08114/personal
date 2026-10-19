import type { BirthdayConfig } from '@/types/birthday';

/**
 * Applies `fn` to every photo and song URL in a config and returns a new config.
 * `fn` returning undefined removes that media (and its framing).
 * Used by the client to swap embedded data URLs for uploaded ones, and by the server to
 * keep only media it hosts.
 */
export async function mapConfigMedia(
  config: BirthdayConfig,
  fn: (url: string) => Promise<string | undefined> | string | undefined,
): Promise<BirthdayConfig> {
  const map = async (url: string | undefined) => (url ? fn(url) : undefined);
  const items = <T extends { image?: string; framing?: unknown }>(list: T[]) =>
    Promise.all(
      list.map(async (item) => {
        const image = await map(item.image);
        return { ...item, image, framing: image ? item.framing : undefined };
      }),
    );
  const [heroImage, finalImage, musicUrl, memories, timeline] = await Promise.all([
    map(config.heroImage),
    map(config.finalImage),
    map(config.music.url),
    items(config.memories),
    items(config.timeline),
  ]);
  return {
    ...config,
    heroImage,
    heroFraming: heroImage ? config.heroFraming : undefined,
    finalImage,
    finalFraming: finalImage ? config.finalFraming : undefined,
    memories,
    timeline,
    music: { ...config.music, url: musicUrl },
  };
}

/** Splits a base64 data URL into its MIME type and bytes. Returns null for anything else. */
export function parseDataUrl(url: string): { type: string; bytes: Uint8Array } | null {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+)(?:;[^,]*)?;base64,(.*)$/is.exec(url);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { type: match[1].toLowerCase(), bytes };
}

const LIBRARY_PATH = /^\/api\/library\/[a-f0-9]{24}\/file$/;

/** Swaps the user's library references for data URLs, so a backup file carries its photos and music with it. */
export function inlineLibraryMedia(config: BirthdayConfig): Promise<BirthdayConfig> {
  return mapConfigMedia(config, async (url) => {
    if (!LIBRARY_PATH.test(url)) return url;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new Promise<string | undefined>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  });
}
