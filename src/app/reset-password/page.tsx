import type { Metadata } from 'next';
import { ResetPasswordRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Choose a new password — Birthday Studio', robots: { index: false }, referrer: 'no-referrer' };

export default function Page() {
  return <ResetPasswordRoute />;
}
