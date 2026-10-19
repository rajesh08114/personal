import type { Metadata } from 'next';
import { ProfileRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Profile — Birthday Studio', robots: { index: false } };

export default function Page() {
  return <ProfileRoute />;
}
