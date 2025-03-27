import { NextResponse } from 'next/server'
import { createUser } from '@/lib/supabase/client'
import { createClient, getUserProfileSSR } from '@/lib/supabase/server';

// Simple console log helper
function log(message: string, data?: any) {
  console.log(`[Auth Callback] ${message}`, data || '');
}

export async function GET(req: Request) {
  log('Route triggered');
  
  // Get the code from the URL
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  
  // Prepare the redirect response
  const response = NextResponse.redirect(new URL('/dashboard', req.url));
  
  // If no code is provided, redirect to auth page with error
  if (!code) {
    log('No auth code provided');
    return NextResponse.redirect(new URL('/auth?error=No authentication code provided', req.url));
  }
  
  try {
    log('Exchanging code for session');
    // Exchange the code for a session
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Handle authentication errors
    if (error) {
      log('Auth error', error.message);
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, req.url));
    }
    
    // If we have a session, set the cookies
    if (data.session) {
      log('Session obtained successfully');
      
      // Set session cookies
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: data.session.expires_in,
      });
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: data.session.expires_in,
      });
      
      // Check if user exists in our database (only for OAuth sign-ins)
      if (data.session.user) {
        log('Checking if user exists in database');
        const existingUser = await getUserProfileSSR(supabase, data.session.user.id);
        
        if (!existingUser) {
          log('Creating new user record');
          const { error } = await supabase.from('users')
          .insert([
            { 
              id: data.session.user.id,
              email: data.session.user.email,
              plan_type: 'free',
              total_usage_minutes: 0,
              monthly_usage_minutes: 0,
            }
          ]);
          if (error) {
            log("Error creating user:", error.message);
            throw new Error("Failed to create user: " + error.message);
          }
          log('User record created successfully');
        }
      }
    }
    log('Redirecting to dashboard');
    return response;
  } catch (error) {
    log('Unexpected error', error);
    return NextResponse.redirect(new URL('/auth?error=An unexpected error occurred', req.url));
  }
}
