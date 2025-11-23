import { createClient } from '@/lib/server/supabase/server';
import { getUserById } from '@/lib/server/features/users/api';
import { jsonError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const root = await createClient();
    
    const { data: { user }, error: authError } = await root.auth.getUser();
    
    if (authError || !user) {
      return Response.json(
        { code: 'UNAUTHORIZED', message: 'Please login first' },
        { status: 401 }
      );
    }
    
    const userProfile = await getUserById(user.id);

    return Response.json(userProfile);

  } catch (e) {
    return jsonError(e);
  }
}