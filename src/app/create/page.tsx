import type { Metadata } from 'next';
import { CreateRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Birthday Studio — Create', robots: { index: false } };

export default function Page() {
  return <CreateRoute />;
}
