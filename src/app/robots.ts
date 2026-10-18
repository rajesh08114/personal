import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.PUBLIC_ORIGIN?.trim();
  return {
    // Personal birthday pages and the editor preview are private.
    rules: { userAgent: '*', disallow: ['/birthday/', '/preview', '/create', '/api/', '/media/'] },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
