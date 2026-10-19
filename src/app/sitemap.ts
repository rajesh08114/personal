import type { MetadataRoute } from 'next';
import { TEMPLATE_IDS } from '@/data/templateIds';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.PUBLIC_ORIGIN?.trim() || 'http://localhost:3000';
  return [
    { url: `${origin}/`, priority: 1 },
    { url: `${origin}/templates`, priority: 0.9 },
    { url: `${origin}/privacy`, priority: 0.2 },
    ...TEMPLATE_IDS.map((id) => ({ url: `${origin}/templates/${id}`, priority: 0.6 })),
  ];
}
