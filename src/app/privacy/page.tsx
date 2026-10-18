import type { Metadata } from 'next';
import { PrivacyRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Birthday Studio — Privacy' };

export default function Page() {
  return <PrivacyRoute />;
}
