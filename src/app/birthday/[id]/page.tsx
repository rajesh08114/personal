import { cache } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { BirthdayRoute } from '@/views/client';
import { BIRTHDAY_ID } from '../../../../server/store';
import { birthdayMeta } from '../../../../server/meta';
import { clientIp, getRuntime } from '../../../../server/runtime';

/**
 * With a server configured, links are looked up here so link previews (WhatsApp, iMessage, Slack)
 * can show the name and photo, and unknown links get a real 404. Without one, birthdays live in the
 * creator's browser, so the page just renders the client and lets it look in IndexedDB.
 */
const serverMode = !!process.env.NEXT_PUBLIC_BIRTHDAY_API_URL?.trim();

/**
 * One lookup per request, shared by the metadata and the page, and counted against the read rate limit.
 * Over the limit it skips the store: the page still renders and the client's own API request gets the 429.
 */
const lookup = cache(async (id: string) => {
  if (!serverMode) return { runtime: null, record: null, limited: false };
  const runtime = await getRuntime();
  try {
    runtime.api.limit(clientIp(await headers(), runtime.config.trustProxy), 'read');
  } catch {
    return { runtime, record: null, limited: true };
  }
  return { runtime, record: BIRTHDAY_ID.test(id) ? await runtime.store.get(id) : null, limited: false };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { runtime, record } = await lookup(id);
  const origin = runtime?.config.publicOrigin ?? process.env.PUBLIC_ORIGIN?.trim() ?? '';
  const meta = birthdayMeta(
    record?.config,
    `${origin}/birthday/${id}`,
    `${origin}/media/`,
    `${origin}/og-image.png`,
  );
  return {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
    openGraph: { title: meta.title, description: meta.description, url: meta.url, images: meta.image ? [meta.image] : [] },
    twitter: { card: meta.image ? 'summary_large_image' : 'summary' },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { record, limited } = await lookup(id);
  if (serverMode && !limited && !record) notFound();
  return <BirthdayRoute />;
}
