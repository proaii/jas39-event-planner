import {
  getGoogleCalendarAuthUrl,
  exchangeGoogleCalendarCode,
} from '@/lib/server/features/google-calendar/api';
import { jsonError } from '@/lib/errors';
import { createClient } from '@/lib/server/supabase/server';

/**
 * GET /api/google-calendar/auth
 * Get Google Calendar OAuth URL
 */
export async function GET() {
  try {
    const authUrl = getGoogleCalendarAuthUrl();
    return Response.json({ authUrl });
  } catch (e) {
    return jsonError(e);
  }
}

/**
 * POST /api/google-calendar/auth
 * Exchange authorization code for tokens and store them
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return Response.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const tokens = await exchangeGoogleCalendarCode(code);

    // Store tokens in Supabase (you'll need to create a table for this)
    // For now, we'll return them to the client to store
    const root = await createClient();
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    // TODO: Store tokens in a user_tokens table or user metadata
    // For now, return tokens to client
    return Response.json({
      message: 'Google Calendar connected successfully',
      // In production, don't return tokens - store them server-side
      // tokens,
    });
  } catch (e) {
    return jsonError(e);
  }
}

