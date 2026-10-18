import type { Metadata } from 'next';
import { PreviewRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Birthday Studio — Preview', robots: { index: false } };

export default function Page() {
  return <PreviewRoute />;
}
