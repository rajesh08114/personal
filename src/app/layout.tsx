import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import '@/styles/index.css';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Manrope:wght@400;500;600;700&display=swap';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4efe6',
  colorScheme: 'light dark',
};

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(process.env.PUBLIC_ORIGIN?.trim() || 'http://localhost:3000'),
    title: 'Birthday Studio',
    description:
      'Make a personal, interactive birthday website in minutes: your photos and words, told as a newspaper, a film, a letter or a scrapbook.',
    manifest: '/manifest.webmanifest',
    icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
    openGraph: {
      type: 'website',
      siteName: 'Birthday Studio',
      title: 'Birthday Studio',
      description: 'Make a personal, interactive birthday website in minutes.',
      images: ['/og-image.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Pages render per request so each response can carry its own CSP nonce (see proxy.ts).
  await connection();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <noscript>
          <p style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
            Birthday Studio needs JavaScript to show the birthday experience.
          </p>
        </noscript>
      </body>
    </html>
  );
}
