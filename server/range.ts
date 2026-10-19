/**
 * Answers a GET or HEAD for a file of `size` bytes, honouring a single `Range: bytes=` request
 * (Safari only plays audio from servers that do). `body(start, end)` yields the inclusive range,
 * or the whole file when called with no arguments.
 */
export function rangedResponse(
  req: Request,
  size: number,
  headers: Record<string, string>,
  body: (start?: number, end?: number) => BodyInit,
): Response {
  const head = req.method === 'HEAD';
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') ?? '');
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new Response(head ? null : body(start, end), {
      status: 206,
      headers: {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  }
  return new Response(head ? null : body(), {
    status: 200,
    headers: { ...headers, 'Content-Length': String(size) },
  });
}
