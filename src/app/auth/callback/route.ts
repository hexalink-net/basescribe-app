import { NextResponse } from 'next/server'
import { createClient, getUserProfileSSR, createNewUserSSR } from '@/lib/supabase/server';

// Simple console log helper
function log(message: string, data?: unknown) {
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
        const {error: existingUserError} = await getUserProfileSSR(supabase, data.session.user.id);
        
        if (existingUserError) {
          log('Creating new user record');
          const { error } = await createNewUserSSR(supabase, data.session.user.id, data.session.user.email);
          
          if (error) {
            log("Error creating user:", error);
            // Continue without throwing - we don't want to block the auth flow if profile creation fails
            // The user can still log in, and we can try to create their profile again later
            log('Continuing despite profile creation error');
          } else {
            log('User record created successfully');
          }
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
