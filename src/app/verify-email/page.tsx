import type { Metadata } from 'next';
import { VerifyEmailRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Confirm your email — Birthday Studio', robots: { index: false }, referrer: 'no-referrer' };

export default function Page() {
  return <VerifyEmailRoute />;
}
