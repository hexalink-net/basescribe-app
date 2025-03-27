import { createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function getUserProfileSSR(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return error;
    }
    return data;
}

export async function getAllUserUploadsSSR(supabase: SupabaseClient, userId: string) {
    const { data = [], error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
    if (error) {
      console.error("Error fetching user uploads:", error);
      return null;
    }
  
    return data;
  }

  export async function getUserUploadSSR(supabase: SupabaseClient, userId: string, uploadId: string) {
    const { data = [], error } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', userId)
    .single();
  
    if (error) {
      console.error("Error fetching user upload:", error);
      return error;
    }
  
    return data;
  }