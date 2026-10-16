import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { reloadOncePerSession } from './utils/lazyChunk';
import { installGlobalErrorReporting } from './utils/reportError';
import './styles/index.css';

// Studio fonts are preloaded in index.html; applying them here keeps them off the critical rendering path.
const fontHref = document.querySelector<HTMLLinkElement>('link[rel="preload"][as="style"]')?.href;
if (fontHref) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontHref;
  document.head.appendChild(link);
}

// A tab opened before a deploy may ask for chunks that no longer exist. Vite reports that here; reload once.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOncePerSession()) event.preventDefault();
});

installGlobalErrorReporting();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
