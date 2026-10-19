import type { Metadata } from 'next';
import { DashboardRoute } from '@/views/client';

export const metadata: Metadata = { title: 'My birthdays — Birthday Studio', robots: { index: false } };

export default function Page() {
  return <DashboardRoute />;
}
