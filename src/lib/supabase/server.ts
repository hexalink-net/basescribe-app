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
    userId: string,
    planId: string,
    subscriptionId: string,
    planStartDate: Date,
    planEndDate: Date
  ) {
    const supabase = await createClient();
    
    await supabase.rpc('update_user_subscription', {
      user_id: userId,
      new_plan_id: planId,
      new_subscription_id: subscriptionId,
      new_plan_start_date: planStartDate,
      new_plan_end_date: planEndDate
    });
  }

export async function updateUserUsageSSR(
    userId: string,
    usageSeconds: number,
  ) {
    const supabase = await createClient();
    
    await supabase.rpc('update_user_usage', {
      user_id: userId,
      usage_seconds: usageSeconds,
    });
  }

export async function resetMonthlyUserUsageSSR(
    userId: string,
  ) {
    const supabase = await createClient();
    
    await supabase.rpc('reset_monthly_transcription_seconds', {
      user_id: userId,
    });
  }