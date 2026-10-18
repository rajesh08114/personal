'use client';

import { useEffect } from 'react';
import { reportError } from '@/utils/reportError';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => reportError(error, 'global-error'), [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            padding: '1.5rem',
            background: '#0f0b14',
            color: '#f2eef3',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div>
            <p style={{ fontSize: '1.75rem' }}>Something went a little sideways.</p>
            <p style={{ color: '#bdb5c4' }}>Reloading usually fixes it.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: 999, border: 0, fontWeight: 600 }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
