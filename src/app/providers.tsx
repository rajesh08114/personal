'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '@/store/AuthProvider';
import { DraftProvider } from '@/store/DraftProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/experience/ErrorBoundary';
import { installGlobalErrorReporting } from '@/utils/reportError';
import { isChunkLoadError, reloadOncePerSession } from '@/utils/lazyChunk';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    installGlobalErrorReporting();
    // A tab opened before a deploy may ask for chunks that no longer exist: reload once to pick up the new build.
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkLoadError(e.reason) && reloadOncePerSession()) e.preventDefault();
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <DraftProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </DraftProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
