import { apiRoute } from '../../../../server/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return apiRoute((request, rt, ip) => rt.api.handleMedia(request, name, ip))(req);
}
