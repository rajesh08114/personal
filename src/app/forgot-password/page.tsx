import type { Metadata } from 'next';
import { ForgotPasswordRoute } from '@/views/client';

export const metadata: Metadata = { title: 'Reset your password — Birthday Studio', robots: { index: false }, referrer: 'no-referrer' };

export default function Page() {
  return <ForgotPasswordRoute />;
}
