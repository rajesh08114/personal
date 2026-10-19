import type { Metadata } from 'next';
import { RegisterRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Create your account — Birthday Studio', robots: { index: false } };

export default function Page() {
  return <RegisterRoute />;
}
