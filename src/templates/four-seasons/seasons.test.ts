import { describe, expect, it } from 'vitest';
import {
  between,
  birthdaySeason,
  blendLook,
  clusterLook,
  LOOKS,
  mix,
  seasonOfMonth,
  seasonWeights,
  splitAcrossSeasons,
  yearEndingIn,
} from './seasons';

describe('four seasons', () => {
  it('maps months to meteorological seasons, flipped in the south', () => {
    expect([12, 1, 2, 3, 6, 9, 11].map((m) => seasonOfMonth(m))).toEqual([
      'winter',
      'winter',
      'winter',
      'spring',
      'summer',
      'autumn',
      'autumn',
    ]);
    expect(seasonOfMonth(7, 'south')).toBe('winter');
    expect(seasonOfMonth(12, 'south')).toBe('summer');
  });

  it('finds the birthday season, defaulting to winter without a date', () => {
    expect(birthdaySeason('1999-10-12')).toBe('autumn');
    expect(birthdaySeason('1999-10-12', 'south')).toBe('spring');
    expect(birthdaySeason(undefined)).toBe('winter');
    expect(birthdaySeason('not a date')).toBe('winter');
  });

  it('plays one full year that comes home to the birthday season', () => {
    expect(yearEndingIn('winter')).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect(yearEndingIn('autumn')).toEqual(['winter', 'spring', 'summer', 'autumn']);
    expect(new Set(yearEndingIn('spring')).size).toBe(4);
  });

  it('shares memories evenly and in order, for any count from 0 to 12', () => {
    expect(splitAcrossSeasons([1, 2, 3, 4, 5])).toEqual([[1, 2], [3], [4], [5]]);
    expect(splitAcrossSeasons([]).every((g) => g.length === 0)).toBe(true);
    for (let n = 0; n <= 12; n++) {
      const groups = splitAcrossSeasons(Array.from({ length: n }, (_, i) => i));
      expect(groups.flat()).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(
        Math.max(...groups.map((g) => g.length)) - Math.min(...groups.map((g) => g.length)),
      ).toBeLessThanOrEqual(1);
    }
  });

  it('blends the scene smoothly between neighbouring seasons', () => {
    const order = yearEndingIn('winter');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(blendLook(order, 0).skyTop).toBe(LOOKS.spring.skyTop);
    expect(blendLook(order, 3).skyTop).toBe(LOOKS.winter.skyTop);
    expect(blendLook(order, 99).skyTop).toBe(LOOKS.winter.skyTop);
    expect(between(1.25, 4)).toEqual({ from: 1, to: 2, t: 0.25 });
    expect(seasonWeights(2.5, 4)).toEqual([0, 0, 0.5, 0.5]);
    expect(seasonWeights(3, 4)).toEqual([0, 0, 0, 1]);
  });

  it('turns leaf clusters one by one, and leaves winter branches bare', () => {
    const order = yearEndingIn('winter');
    const early = clusterLook(order, 1.3, 0, 40).color;
    const late = clusterLook(order, 1.3, 39, 40).color;
    expect(early).not.toBe(late);
    expect(clusterLook(order, 3, 5, 40).scale).toBe(0);
    expect(clusterLook(order, 1, 5, 40).scale).toBeGreaterThan(0.7);
  });
});
