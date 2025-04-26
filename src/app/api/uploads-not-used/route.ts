import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.split(' ')[1];

    console.log("test2")

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' }, 
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    
    // First verify the token is valid
    const regularClient = await createClient();
    const { data: { user }, error: authError } = await regularClient.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' }, 
        { status: 401 }
      );
    }
    
    // Create a custom Supabase client with the auth context set
    // This is necessary for RLS policies to work
    const supabaseWithAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          // Set the auth context with the access token
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    );
  
    // Build the query - now RLS will work because auth context is set
    let query = supabaseWithAuth
        .from('uploads')
        .select('id, created_at, file_name, duration_seconds, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    // Only filter by folder_id if it's provided
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }
    
    const { data = [], error } = await query;
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'GET /api/uploads',
        message: 'Error fetching user uploads',
        metadata: { userId: user.id, folderId, error }
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch uploads' }, 
        { status: 500 }
      );
    }
    
    // Return the data
    return NextResponse.json({ data: data, error: error }, {
      headers: {
        // Cache for a longer period (5 minutes)
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    log({
      logLevel: 'error',
      action: 'GET /api/uploads',
      message: 'Unexpected error fetching uploads',
      metadata: { error: errorMessage }
    });
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}
