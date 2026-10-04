import { useEffect } from 'react';

/** Lazily injects a Google Fonts stylesheet so each template only loads its own type. */
export function useGoogleFonts(families: string[]): void {
  const key = families.join('|');
  useEffect(() => {
    if (!key) return;
    const href = `https://fonts.googleapis.com/css2?${key
      .split('|')
      .map((f) => `family=${f}`)
      .join('&')}&display=swap`;
    if (document.querySelector(`link[data-font-href="${CSS.escape(href)}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.fontHref = href;
    document.head.appendChild(link);
  }, [key]);
}
