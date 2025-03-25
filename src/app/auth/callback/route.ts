import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const cookies = req.cookies;
  const response = NextResponse.redirect(new URL('/dashboard', req.url));
  
  if (code) {
    // Create a Supabase client configured to use cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
        },
      }
    );
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Set cookies for the session
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: data.session.expires_in,
      });
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: data.session.expires_in,
      });
      
      // Check if user exists in our database
      if (data.user) {
        // Create a new Supabase client with the session
        const authenticatedSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
          }
        );
        
        // Check if user record exists
        const { data: existingUser, error: userError } = await authenticatedSupabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // If user doesn't exist in our database, create a record
        if (!existingUser && !userError) {
          await authenticatedSupabase
            .from('users')
            .insert([
              { 
                id: data.user.id,
                email: data.user.email,
                plan_type: 'free',
                total_usage_minutes: 0,
                monthly_usage_minutes: 0,
              }
            ]);
        }
      }
    }
  }
  
  return response;
}
