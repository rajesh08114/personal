'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { storageMode } from '@/data/repository';

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

/** `/privacy` — what is stored, where, and how to remove it. Kept short and factual. */
export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Birthday Studio — Privacy';
  }, []);
  const server = storageMode === 'server';

  return (
    <main className="min-h-dvh bg-[#f4efe6] px-6 py-16 text-[#2b2620]">
      <article className="mx-auto max-w-2xl space-y-5 leading-relaxed">
        <p className="font-mono text-xs tracking-[0.25em] text-[#8a7f70] uppercase">Privacy</p>
        <h1 className="font-display text-4xl">Your birthday, your data</h1>

        <h2 className="pt-4 text-xl font-semibold">While you create</h2>
        <p>
          Everything you type or upload in the studio (names, messages, photos, music) is saved in this
          browser’s storage (IndexedDB) so you don’t lose work. It isn’t sent anywhere while you edit. Photos
          are resized in your browser before they are saved.
        </p>

        <h2 className="pt-4 text-xl font-semibold">When you share</h2>
        {server ? (
          <p>
            Publishing a birthday uploads its content, including photos and music, to our server so the link
            opens on any device. Anyone who has the link can view it. Links are random and are never listed,
            indexed by search engines or shown to other people. Link previews in messaging apps show the
            birthday person’s name and main photo.
          </p>
        ) : (
          <p>
            In this version, shared birthdays stay in the browser that created them. Nothing is uploaded.
            Backup files you download contain every photo and message, so treat them like the photos
            themselves.
          </p>
        )}

        <h2 className="pt-4 text-xl font-semibold">Removing it</h2>
        <p>
          {server
            ? 'Open Share in the studio and choose Unpublish. The link stops working immediately, and the photos it used are deleted from the server within a day. '
            : ''}
          Clearing this site’s data in your browser settings removes your draft and any local links.
        </p>

        <h2 className="pt-4 text-xl font-semibold">What we don’t do</h2>
        <p>
          No ads, no tracking cookies and no selling of data. If something breaks, an anonymous technical
          report (error message, page path and browser version) may be sent so we can fix it. It never
          includes names, messages or photos. The microphone is only used, with your permission, to blow out
          the candles, and the audio never leaves your device.
        </p>

        {contact && (
          <p>
            Questions, or want something taken down? Email{' '}
            <a href={`mailto:${contact}`} className="underline">
              {contact}
            </a>
            .
          </p>
        )}

        <p className="pt-6">
          <Link href="/templates" className="font-semibold underline underline-offset-4">
            Back to templates
          </Link>
        </p>
      </article>
    </main>
  );
}
