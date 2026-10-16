import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { DraftProvider } from '@/store/DraftProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { LoadingScreen } from '@/components/ui/Layout';
import { ErrorBoundary } from '@/components/experience/ErrorBoundary';
import { pageLoaders } from '@/routes';

const ExperiencePage = lazy(pageLoaders.experience);
const CreatePage = lazy(pageLoaders.create);
const PreviewPage = lazy(pageLoaders.preview);
const TemplatesPage = lazy(pageLoaders.templates);
const TemplatePreviewPage = lazy(pageLoaders.templatePreview);
const BirthdayPage = lazy(pageLoaders.birthday);

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f4efe6] px-6 text-center text-[#24201b]">
      <p className="font-display text-6xl">404</p>
      <p className="text-[#5b5348]">This page wandered off to a party somewhere.</p>
      <Link to="/templates" className="mt-2 rounded-md bg-[#24201b] px-6 py-3 font-semibold text-[#f4efe6]">
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
