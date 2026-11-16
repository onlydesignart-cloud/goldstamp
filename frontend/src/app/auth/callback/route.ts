import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/loyalty';

  // If Supabase returned an error, redirect safely without leaking internal error details
  if (searchParams.get('error') || searchParams.get('error_description')) {
    return NextResponse.redirect(`${origin}/login?auth_status=failed`);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const user = data.session.user;
        const cleanEmail = user.email?.toLowerCase() || '';

        // Direct write into live Supabase PostgreSQL DB (public.User table)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goldstamp.onrender.com';
          await fetch(`${apiUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.user_metadata?.full_name || user.user_metadata?.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              phone: user.phone || '',
              password: `OAuth_${user.id.substring(0, 10)}!`,
              role: 'CUSTOMER',
            }),
          });
        } catch (e) {
          console.warn('Backend sync from auth callback notice:', e);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (ex) {
      console.warn('Auth callback exchange exception:', ex);
    }
  }

  // Safe generic failure redirect — never leaks internal backend details in the URL
  return NextResponse.redirect(`${origin}/login?auth_status=failed`);
}
