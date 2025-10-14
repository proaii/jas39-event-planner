import { listAllEvents, createEvent } from '@/lib/server/features/events/api';
import { jsonError } from '@/lib/errors';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined;

    const res = await listAllEvents({ q, page, pageSize });
    return Response.json(res);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createEvent(body);
    return Response.json(created, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
