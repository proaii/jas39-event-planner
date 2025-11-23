import { createClient } from '@/lib/server/supabase/server'; 
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { toApiError } from '@/lib/errors';
import type { UserLite } from '@/lib/types';

const TABLE = 'users';

type DbUserRow = {
  userId: string;        
  username: string | null;
  email: string | null;
  avatarUrl: string | null; 
};

function getAdminDb() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SERVER_ERROR: Missing Service Role Key");
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function getCurrentUser(): Promise<UserLite> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) {
      throw uerr;
    }
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }

    let { data, error } = await supabase
      .from(TABLE)
      .select('userId:user_id, username, email, avatarUrl:avatar_url')
      .eq('user_id', user.id)
      .single();

    // If user profile doesn't exist, create it.
    if (error && error.code === 'PGRST116') { // PGRST116: "exact one row not found"
      const adminDb = getAdminDb();
      const profileToInsert = {
        user_id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name ?? user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url ?? null,
      };

      const { data: newUser, error: createError } = await adminDb
        .from(TABLE)
        .insert(profileToInsert)
        .select('userId:user_id, username, email, avatarUrl:avatar_url')
        .single();
      
      if (createError) {
        throw createError;
      }
      data = newUser;
    } else if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('USER_NOT_FOUND');
    }

    const r = data as DbUserRow;

    const userId = r.userId?.toString() ?? '';
    if (!userId) throw new Error('INVALID_USER_DATA');

    return {
      userId,
      username: (r.username ?? r.email ?? '').toString(),
      email: (r.email ?? '').toString(),
      avatarUrl: r.avatarUrl ?? null,
    };

  } catch (e) {
    throw toApiError(e, 'GET_USER_FAILED');
  }
}

export async function getUserById(targetUserId: string): Promise<UserLite> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const { data, error } = await supabase
      .from(TABLE)
      .select('userId:user_id, username, email, avatarUrl:avatar_url')
      .eq('user_id', targetUserId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('USER_NOT_FOUND');

    const r = data as DbUserRow;

    const userId = r.userId?.toString() ?? '';
    if (!userId) throw new Error('INVALID_USER_DATA');

    return {
      userId,
      username: (r.username ?? r.email ?? '').toString(),
      email: (r.email ?? '').toString(),
      avatarUrl: r.avatarUrl ?? null,
    };

  } catch (e) {
    throw toApiError(e, 'GET_USER_FAILED');
  }
}

export async function updateUser(
  userId: string,
  patch: { username?: string; avatarUrl?: string }
): Promise<UserLite> {
  const root = await createClient();
  const { data: { user }, error: uerr } = await root.auth.getUser();
  if (uerr || !user) throw new Error('UNAUTHORIZED');

  if (user.id !== userId) {
    throw new Error('FORBIDDEN: You can only update your own profile');
  }

  const adminDb = getAdminDb();

  try {
    const updates: Record<string, unknown> = {};
    
    if (patch.username !== undefined) updates.username = patch.username;
    if (patch.avatarUrl !== undefined) updates.avatar_url = patch.avatarUrl;

    if (Object.keys(updates).length === 0) {
        return getUserById(userId); 
    }

    const { data, error } = await adminDb
      .from(TABLE)
      .update(updates)
      .eq('user_id', userId)
      .select('userId:user_id, username, email, avatarUrl:avatar_url') 
      .single();

    if (error) throw error;

    const r = data as DbUserRow;
    
    return {
      userId: r.userId,
      username: (r.username ?? r.email ?? '').toString(),
      email: (r.email ?? '').toString(), 
      avatarUrl: r.avatarUrl ?? null,
    };

  } catch (e) {
    throw toApiError(e, 'USER_UPDATE_FAILED');
  }
}

/*
export async function deleteUser(targetUserId: string): Promise<void> {
  const root = await createClient();

  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr || !user) throw new Error('UNAUTHORIZED');

    if (user.id !== targetUserId) {
        throw new Error('FORBIDDEN');
    }

    const adminDb = getAdminDb();

    const { error } = await adminDb
      .from(TABLE)
      .delete()
      .eq('user_id', targetUserId);

    if (error) throw error;

  } catch (e) {
    throw toApiError(e, 'USER_DELETE_FAILED');
  }
}
*/

export async function listAllUsers(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: UserLite[]; nextPage: number | null }> {
  const supabase = await createClient();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    let q = supabase
      .from(TABLE)
      .select('userId:user_id, username, email, avatarUrl:avatar_url', { count: 'exact' })
      .order('username', { ascending: true });

    if (params.q && params.q.trim()) {
      const kw = params.q.trim();
      q = q.or(`username.ilike.%${kw}%,email.ilike.%${kw}%`);
    }

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    const rows = (data ?? []) as DbUserRow[];

    const items: UserLite[] = rows
      .map((r): UserLite | null => {
        const userId = r.userId?.toString() ?? '';
        if (!userId) return null;
        const username = (r.username ?? r.email ?? '').toString();
        const email = (r.email ?? '').toString();
        const avatarUrl = r.avatarUrl ?? null; 
        return { userId, username, email, avatarUrl };
      })
      .filter((u): u is UserLite => u !== null);

    const total = typeof count === 'number' ? count : items.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'USERS_LIST_FAILED');
  }
}

