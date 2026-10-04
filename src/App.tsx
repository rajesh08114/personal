import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { DraftProvider } from '@/store/DraftProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { LoadingScreen } from '@/components/ui/Layout';
import { ErrorBoundary } from '@/components/experience/ErrorBoundary';

const ExperiencePage = lazy(() => import('@/pages/ExperiencePage'));
const CreatePage = lazy(() => import('@/pages/CreatePage'));
const PreviewPage = lazy(() => import('@/pages/PreviewPage'));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));
const TemplatePreviewPage = lazy(() => import('@/pages/TemplatePreviewPage'));
const BirthdayPage = lazy(() => import('@/pages/BirthdayPage'));

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center">
      <p className="font-display text-6xl text-white">404</p>
      <p className="text-ink-300">This page wandered off to a party somewhere.</p>
      <Link to="/templates" className="mt-2 rounded-full bg-white px-6 py-3 font-semibold text-ink-900">
        Browse birthday templates
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DraftProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<ExperiencePage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/:id" element={<TemplatePreviewPage />} />
                <Route path="/birthday/:id" element={<BirthdayPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </DraftProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
