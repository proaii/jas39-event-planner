import { exchangeGoogleCalendarCode } from '@/lib/server/features/google-calendar/api';
import { createClient } from '@/lib/server/supabase/server';
import { jsonError } from '@/lib/errors';
import { redirect } from 'next/navigation';

/**
 * GET /api/google-calendar/callback
 * Handle OAuth callback from Google Calendar
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return redirect('/settings?error=google_calendar_auth_failed');
    }

    if (!code) {
      return redirect('/settings?error=missing_code');
    }

    const tokens = await exchangeGoogleCalendarCode(code);
    const root = await createClient();
    const { data: { user }, error: uerr } = await root.auth.getUser();
    
    if (uerr || !user) {
      return redirect('/settings?error=unauthorized');
    }

    // TODO: Store tokens in database
    // You should create a table to store user tokens securely
    // Example:
    // const db = await createDb();
    // await db.from('user_google_tokens').upsert({
    //   user_id: user.id,
    //   access_token: tokens.access_token,
    //   refresh_token: tokens.refresh_token,
    //   expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
    // });

    return redirect('/settings?success=google_calendar_connected');
  } catch (e) {
    console.error('Google Calendar callback error:', e);
    return redirect('/settings?error=google_calendar_callback_failed');
  }
}

