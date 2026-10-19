import type { Metadata } from 'next';
import { LoginRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Log in — Birthday Studio', robots: { index: false } };

export default function Page() {
  return <LoginRoute />;
}
