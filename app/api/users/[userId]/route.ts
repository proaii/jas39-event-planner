import { getUserById, updateUser } from '@/lib/server/features/users/api';
import { jsonError } from '@/lib/errors';

export async function GET(_req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const user = await getUserById(userId);
    return Response.json(user);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await req.json();

    const updatedUser = await updateUser(userId, body);
    
    return Response.json(updatedUser);
  } catch (e) {
    return jsonError(e);
  }
}

/*
export async function DELETE(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    
    await deleteUser(userId);
    
    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}
*/