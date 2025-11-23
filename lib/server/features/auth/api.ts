import { createClient } from '@/lib/server/supabase/client';
import { Provider, type PostgrestError } from '@supabase/supabase-js';

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// export async function signInWithOAuth(provider: Provider) {
//   const supabase = createClient();
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider,
//     options: {
//       redirectTo: `${location.origin}/api/auth/callback?next=/dashboard`,
//     },
//   });
//   if (error) throw new Error(error.message);
// }

export async function signInWithOAuth(provider: Provider) {
  const supabase = createClient();
  
  // 1. Define default options
  const options: {
    redirectTo: string;
    scopes?: string;
    queryParams?: { [key: string]: string };
  } = {
    redirectTo: `${location.origin}/api/auth/callback?next=/dashboard`,
  };

  // 2. Add Google-Specific Options (The Phase 3 Requirement)
  if (provider === 'google') {
    // Request access to manage the calendar
    // options.scopes = 'https://www.googleapis.com/auth/calendar';
    
    options.queryParams = {
      // 'offline' is required to get a Refresh Token (crucial for background sync)
      access_type: 'offline', 
      // 'consent' forces the user to approve access again (ensures we get the refresh token)
      prompt: 'consent', 
    };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });

  if (error) throw new Error(error.message);
}

export async function signUpWithEmail({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${location.origin}/api/auth/callback?next=/dashboard`,
    },
  });

  if (error) throw new Error(error.message);

  const authUser = data.user;
  if (!authUser) throw new Error('SIGNUP_FAILED_NO_USER');

  const baseUsername = makeBaseUsername(firstName, lastName, email);
  let finalUsername = baseUsername;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error: insertErr } = await supabase.from('users').insert({
      user_id: authUser.id,     // FK → auth.users(id)
      email: authUser.email,    // UNIQUE
      username: finalUsername,  // UNIQUE
      avatar_url: null,
    });

    if (!insertErr) break;

    if (!hasPgCode(insertErr) || insertErr.code !== '23505') {
      throw new Error(insertErr.message);
    }

    finalUsername = `${baseUsername}-${Math.floor(Math.random() * 1e4)}`;
    if (attempt === 2) {
      throw new Error('Failed to create profile due to duplicate username/email.');
    }
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return true;
}

export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user;
}

// ---------- helpers ----------
function makeBaseUsername(firstName?: string, lastName?: string, email?: string) {
  const fromName = [firstName, lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  // If there is a name, use that name. If there is none, use the local part of the email.
  const raw = (fromName || (email ? email.split('@')[0] : 'user')).toLowerCase();

  const normalized =
    raw
      .replace(/[^a-z0-9._-]+/g, '-') // allow [a-z0-9._-], replace the rest with '-'
      .replace(/-+/g, '-')            // collapse multiple '-' to single
      .replace(/^[-. _]+|[-. _]+$/g, '') // trim leading/trailing [-._ ] chars
      .slice(0, 24) || 'user';

  return normalized;
}

// ---------- type guard ----------
function hasPgCode(err: unknown): err is PostgrestError {
  return typeof err === 'object' && err !== null && 'code' in err;
}
