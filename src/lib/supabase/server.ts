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
    }
    return { data, error };
}

export async function createUploadSSR(supabase: SupabaseClient, userId: string, fileName: string, filePath: string, fileSize: number, durationSeconds: number, folderId?: string | null) {
  const { data, error } = await supabase
  .from('uploads')
  .insert({
    user_id: userId,
    file_name: fileName,
    file_path: filePath,
    file_size: fileSize,
    duration_seconds: durationSeconds,
    folder_id: folderId || null,
    status: 'completed'
  })
  .select();
  
  if (error) {
    console.error('Database insert error:', error);
    throw error;
  }

  return { data, error };
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
    const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', userId)
    .single();
  
    if (error) {
      console.error("Error fetching user upload:", error);
    }
  
    return { data, error };
  }

//Add paddle subscription later, plan and subscription id still can be null now
export async function createNewUserSSR(supabase: SupabaseClient, userId: string, userEmail: string | undefined) {
    const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        id: userId,
        email: userEmail,
        plan_id: "test"
      }
    ]);

    if (error) {
      console.error("Error creating user profile:", error);
    }
    
    return { data, error };
  }

export async function updateUserSubscriptionSSR(
    supabase: SupabaseClient,
    userId: string,
    planId: string,
    subscriptionId: string,
    planStartDate: Date,
    planEndDate: Date
  ) {    
    await supabase.rpc('update_user_subscription', {
      user_id: userId,
      new_plan_id: planId,
      new_subscription_id: subscriptionId,
      new_plan_start_date: planStartDate,
      new_plan_end_date: planEndDate
    });
  }

export async function updateUserUsageSSR(
    supabase: SupabaseClient,
    userId: string,
    usageSeconds: number,
  ) {
    
    await supabase.rpc('update_user_usage', {
      user_id: userId,
      usage_seconds: usageSeconds,
    });
  }

export async function resetMonthlyUserUsageSSR(
    supabase: SupabaseClient,
    userId: string,
  ) {
    
    await supabase.rpc('reset_monthly_transcription_seconds', {
      user_id: userId,
    });
  }

export async function deleteUserUploadSSR(
    userId: string,
    uploadId: string
  ) {
    const supabase = await createClient();
    
    // First, get the upload to verify it belongs to the user and get file path
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('file_path')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching upload for deletion:", fetchError);
      return { error: fetchError };
    }
    
    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error("Error deleting upload:", deleteError);
      return { error: deleteError };
    }
    
    // Delete the file from storage if it exists
    if (upload?.file_path) {
      const { error: storageError } = await supabase
        .storage
        .from('user-uploads')
        .remove([upload.file_path]);
      
      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        return { error: storageError };
      }
    }
    
    return { success: true };
  }