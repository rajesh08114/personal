import type { BirthdayConfig } from '@/types/birthday';

function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** The age they are turning on their upcoming (or current) birthday. */
export function getTurningAge(config: Pick<BirthdayConfig, 'age' | 'birthdayDate'>, now = new Date()): number | null {
  if (config.age) return config.age;
  if (!config.birthdayDate) return null;
  const birth = parseIso(config.birthdayDate);
  if (!birth || birth > now) return null;
  const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const daysSince = (now.getTime() - thisYear.getTime()) / 86_400_000;
  // Up to ~2 months after the birthday we still celebrate "this" one; otherwise the next.
  const year = daysSince > 60 ? now.getFullYear() + 1 : now.getFullYear();
  const age = year - birth.getFullYear();
  return age > 0 && age < 130 ? age : null;
}

export function formatBirthday(iso: string | undefined, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }): string | null {
  if (!iso) return null;
  const d = parseIso(iso);
  return d ? d.toLocaleDateString(undefined, opts) : null;
}

/** Next occurrence of the birthday (today counts). */
export function nextBirthday(iso: string | undefined, now = new Date()): Date | null {
  if (!iso) return null;
  const birth = parseIso(iso);
  if (!birth) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return next;
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
