const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** Short, URL-safe random id (no ambiguous characters). */
export function createId(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
