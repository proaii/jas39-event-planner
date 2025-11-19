import { jsonError } from '@/lib/errors';
import { listAllUsers } from '@/lib/server/features/users/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const page = Number(searchParams.get('page') ?? '1') || 1;
    const pageSize = Number(searchParams.get('pageSize') ?? '20') || 20;

    const { items, nextPage } = await listAllUsers({ q, page, pageSize });
    return Response.json({ items, nextPage });
  } catch (e) {
    return jsonError(e);
  }
}
