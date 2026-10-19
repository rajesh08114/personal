import { apiRoute } from '../../../../server/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = apiRoute((req, rt, ip) => rt.api.handleApi(req, ip));

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
