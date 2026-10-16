import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isChunkLoadError, reloadOncePerSession } from '@/utils/lazyChunk';
import { reportError } from '@/utils/reportError';

interface Props {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A chunk from a previous deploy: one reload fixes it, so don't report or show an error.
    if (isChunkLoadError(error) && reloadOncePerSession()) return;
    reportError(error, info.componentStack?.split('\n').slice(0, 6).join('\n'));
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-ink-100">
        <p className="font-display text-3xl">Something went a little sideways.</p>
        <p className="max-w-md text-ink-300">This part of the birthday couldn’t be displayed. Reloading usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-white px-6 py-3 font-semibold text-ink-900"
        >
          Reload
        </button>
      </div>
    );
  }
}
