import { NextResponse } from 'next/server'
import { createClient, getUserProfileSSR, createNewUserSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';

export async function GET(req: Request) {
  log({
    logLevel: 'info',
    action: 'Auth callback',
    message: 'Auth callback route triggered'
  });
  
  // Get the code from the URL
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  
  // Prepare the redirect response
  const response = NextResponse.redirect(new URL('/dashboard', req.url));
  
  // If no code is provided, redirect to auth page with error
  if (!code) {
    log({
      logLevel: 'error',
      action: 'Auth callback',
      message: 'No authentication code provided'
    });
    return NextResponse.redirect(new URL('/auth?error=No authentication code provided', req.url));
  }
  
  try {
    // Exchange the code for a session
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Handle authentication errors
    if (error) {
      log({
        logLevel: 'error',
        action: 'Auth callback',
        message: error.message
      })
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, req.url));
    }
    
    // If we have a session, set the cookies
    if (data.session) {
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
        const {error: existingUserError} = await getUserProfileSSR(supabase, data.session.user.id);
        
        if (existingUserError) {
          const { error } = await createNewUserSSR(supabase, data.session.user.id, data.session.user.email);
          
          if (error) {
            log({
              logLevel: 'error',
              action: 'Auth callback',
              message: error.message
            });
          }
        }
      }
    }
    return response;
  } catch (error: unknown) {
    log({
      logLevel: 'error',
      action: 'Auth callback',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      metadata: {
        error: error
      }
    });
    return NextResponse.redirect(new URL('/auth?error=An unexpected error occurred', req.url));
  }
}
