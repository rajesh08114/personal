import { describe, expect, it } from 'vitest';
import { isChunkLoadError } from './lazyChunk';
import { TEMPLATES } from '@/templates/registry';
import { TEMPLATE_IDS } from '@/data/templateIds';

describe('lazy loading', () => {
  it('recognises stale-chunk errors from every major browser', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/x.js'))).toBe(true); // Chromium
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true); // Firefox
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true); // Safari
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('registers every template id once, each with lazy experience and thumbnail chunks', () => {
    expect(TEMPLATES.map((t) => t.id).sort()).toEqual([...TEMPLATE_IDS].sort());
    for (const t of TEMPLATES) {
      expect(typeof t.load, t.id).toBe('function');
      // React.lazy components are objects tagged with the lazy symbol; nothing is downloaded until render.
      expect(t.component.$$typeof, t.id).toBe(Symbol.for('react.lazy'));
      expect(t.Thumbnail.$$typeof, t.id).toBe(Symbol.for('react.lazy'));
    }
  });
});
