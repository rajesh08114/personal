import type { Metadata } from 'next';
import { TemplatesRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Choose your birthday experience — Birthday Studio' };

export default function Page() {
  return <TemplatesRoute />;
}
