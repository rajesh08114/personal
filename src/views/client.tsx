'use client';

import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/ui/Layout';

/**
 * The pages read browser-only state (IndexedDB drafts, window size, audio), so they render on the
 * client only; the server sends the loading screen. Each page is its own chunk.
 * (next/dynamic needs its options as an inline object literal.)
 */
const Dark = () => <LoadingScreen />;
const Light = () => <LoadingScreen dark={false} />;

export const ExperienceRoute = dynamic(() => import('./ExperiencePage'), { ssr: false, loading: Dark });
export const CreateRoute = dynamic(() => import('./CreatePage'), { ssr: false, loading: Light });
export const PreviewRoute = dynamic(() => import('./PreviewPage'), { ssr: false, loading: Dark });
export const TemplatesRoute = dynamic(() => import('./TemplatesPage'), { ssr: false, loading: Light });
export const TemplatePreviewRoute = dynamic(() => import('./TemplatePreviewPage'), { ssr: false, loading: Dark });
export const BirthdayRoute = dynamic(() => import('./BirthdayPage'), { ssr: false, loading: Dark });
export const PrivacyRoute = dynamic(() => import('./PrivacyPage'), { ssr: false, loading: Light });
