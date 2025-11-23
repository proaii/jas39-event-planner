import { createClient } from "@/lib/server/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    // 1. Exchange the code for a Session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      const { session, user } = data;
      
      // 2. CHECK FOR GOOGLE TOKENS
      // Supabase puts the provider tokens inside the session object immediately after login
      const providerToken = session.provider_token; 
      const providerRefreshToken = session.provider_refresh_token;

      // 3. SAVE TO DATABASE
      // If we have a refresh token, we must save it to your `user_tokens` table
      if (providerRefreshToken && user) {
        
        // Calculate expiry (usually 1 hour for access tokens)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 3500);

        const { error: tokenError } = await supabase
          .from('user_tokens')
          .upsert({
            user_id: user.id,
            service: 'google',
            access_token: providerToken,
            refresh_token: providerRefreshToken,
            expires_at: expiresAt.toISOString(),
            // Optional: store scopes if you want to track what permissions you have
          }, { 
            onConflict: 'user_id, service' // Requires a unique constraint on these two columns
          });

        if (tokenError) {
          console.error("Failed to save Google tokens:", tokenError);
          // We don't stop the login, but background sync won't work until they relogin
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // if "next" is in param, use it as the redirect URL
//   const next = searchParams.get("next") ?? "/dashboard";

//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/error`);
// }