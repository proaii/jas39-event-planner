import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { UserLite } from '@/lib/types';

const TABLE = 'users';

type DbUserRow = {
  userId: string;        
  username: string | null;
  email: string | null;
  avatarUrl: string | null; 
};

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

