/** Starts the storage connection and the media garbage collector when the server boots, not on the first request. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { getRuntime } = await import('../server/runtime');
  await getRuntime();
}
