import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TemplatePreviewRoute } from '@/views/client';
import { TEMPLATE_IDS } from '@/data/templateIds';
import { isTemplateId } from '@/data/normalizeConfig';

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!isTemplateId(id)) return {};
  // The registry holds client components, so the server works from the id alone.
  const name = id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { title: `${name} — Birthday Studio` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isTemplateId(id)) notFound();
  return <TemplatePreviewRoute />;
}
