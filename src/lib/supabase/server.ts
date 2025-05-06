import { createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { BucketNameUpload } from '@/constants/SupabaseBucket';
import { log } from '@/lib/logger';
import { free } from '@/constants/PaddleProduct';
import { readRateLimiter } from '@/lib/upstash/ratelimit';


//Rate Limiter
async function checkReadRateLimit(userId: string) {
  if (userId && userId.length > 0) {
    return true;
  }
  
  const { success } = await readRateLimiter.limit(userId || 'anonymous');
  
  if (!success) {
    throw new Error('Too many requests. Please try again in a few minutes.');
  }
  
  return true;
}


//Define supabase client
const createFetch =
  (options: Pick<RequestInit, "next" | "cache">) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
    });
  };

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

export async function createClientWithCache(revalidateTag?: string, userId?: string, revalidateTime?: false | number | undefined) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
          global: {
            fetch: createFetch({
              next: {
                revalidate: revalidateTime ?? false,
                tags: [`${revalidateTag}-${userId}`]
              },
            }),
          },
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


//Manage user profile
export async function createNewUserSSR(supabase: SupabaseClient, userId: string, userEmail: string | undefined) {
  const { data, error } = await supabase
  .from('users')
  .insert([
    { 
      id: userId,
      email: userEmail,
      product_id: free
    }
  ]);

  if (error) {
    log({
      logLevel: 'error',
      action: 'createNewUserSSR',
      message: 'Error creating user profile in database',
      metadata: { userId, email: userEmail, error }
    });
  }
  
  return { data, error };
}

export const getUserProfileSSR = async (supabase: SupabaseClient, userId: string) => {
    await checkReadRateLimit(userId);

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error) {
      log({
        logLevel: 'error',
        action: 'getUserProfileSSR',
        message: 'Error fetching user profile',
        metadata: { userId, error }
      });
    }
    return { data, error };
}

export async function getUserSubscriptionSSR(supabase: SupabaseClient, userId: string) {
  await checkReadRateLimit(userId);

  const { data, error } = await supabase.from("users").select("product_id, price_id").eq("id", userId).single();
  if (error) {
    log({
      logLevel: 'error',
      action: 'getUserSubscriptionSSR',
      message: 'Error fetching user subscription',
      metadata: { userId, error }
    });
  }
  return { data, error };
}

//Manage upload
export async function createUploadSSR(supabase: SupabaseClient, userId: string, fileName: string, filePath: string, fileSize: number, durationSeconds: number, language: string, folderId?: string | null) {
  const { data, error } = await supabase
  .from('uploads')
  .insert({
    user_id: userId,
    file_name: fileName,
    file_path: filePath,
    file_size: fileSize,
    duration_seconds: durationSeconds,
    folder_id: folderId || null,
    language: language,
    status: 'completed'
  })
  .select();
  
  if (error) {
    log({
      logLevel: 'error',
      action: 'createUploadSSR',
      message: 'Database insert error for upload record',
      metadata: { error, uploadRecord: { user_id: userId, file_name: fileName, file_path: filePath, file_size: fileSize, duration_seconds: durationSeconds, folder_id: folderId || null, status: 'completed' } }
    });
  }

  return { data, error };
}

export async function getAllUserUploadsSSR(supabase: SupabaseClient, userId: string, folderId?: string | null) {
    await checkReadRateLimit(userId);

    if (folderId !== undefined) {
      const { data = [], error } = await supabase
        .from('uploads')
        .select('id, created_at, file_name, duration_seconds, status, language')
        .eq('user_id', userId)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false }); 
      
      if (error) {
        log({
          logLevel: 'error',
          action: 'getAllUserUploadsSSR',
          message: 'Error fetching user uploads',
          metadata: { userId, folderId, error }
        });
      }
      
      return { data, error };
    } else {
      const { data = [], error } = await supabase
        .from('uploads')
        .select('id, created_at, file_name, duration_seconds, status, language')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        log({
          logLevel: 'error',
          action: 'getAllUserUploadsSSR',
          message: 'Error fetching user uploads',
          metadata: { userId, error }
        });
      }

      return { data, error };
    }
  }

export async function getUserUploadSSR(supabase: SupabaseClient, userId: string, uploadId: string) {
    await checkReadRateLimit(userId);
    const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .eq('user_id', userId)
    .single();
  
    if (error) {
      log({
        logLevel: 'error',
        action: 'getUserUploadSSR',
        message: 'Error fetching specific user upload',
        metadata: { userId, uploadId, error }
      });
    }
  
    return { data, error };
  }

  export async function deleteUserUploadSSR(
    supabase: SupabaseClient,
    userId: string,
    uploadId: string
  ) {
    
    // First, get the upload to verify it belongs to the user and get file path
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('file_path')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      log({
        logLevel: 'error',
        action: 'deleteUserUploadSSR.fetch',
        message: 'Error fetching upload record before deletion',
        metadata: { userId, uploadId, error: fetchError }
      });
      return { error: fetchError };
    }
    
    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId);
    
    if (deleteError) {
      log({
        logLevel: 'error',
        action: 'deleteUserUploadSSR.deleteDbRecord',
        message: 'Error deleting upload record from database',
        metadata: { userId, uploadId, error: deleteError }
      });
      return { error: deleteError };
    }
    
    // Delete the file from storage if it exists
    if (upload?.file_path) {
      const { error: storageError } = await supabase
        .storage
        .from(BucketNameUpload)
        .remove([upload.file_path]);
      
      if (storageError) {
        log({
          logLevel: 'warn', // Corrected from 'warning'
          action: 'deleteUserUploadSSR.deleteStorageFile',
          message: 'Error deleting file from storage, but DB record deleted',
          metadata: { userId, uploadId, storagePath: upload.file_path, error: storageError }
        });
      }
    }
    
    return { success: true };
  }

//Manage subscription
export async function updateUserSubscriptionSSR(
    supabase: SupabaseClient,
    customerEmail: string,
    customerIdPaddle: string,
    productId: string,
    priceId: string,
    subscriptionId: string,
    subscriptionStatus: string,
    planStartDate: string,
    planEndDate: string
  ) {    
    const { data, error } = await supabase.rpc('update_user_subscription', {
      new_product_id: productId,
      new_price_id: priceId,
      new_subscription_id: subscriptionId,
      new_subscription_status: subscriptionStatus,
      new_plan_start_date: planStartDate,
      new_plan_end_date: planEndDate,
      customer_email: customerEmail,
      new_customer_id: customerIdPaddle
    }).select();

    if (error) {
      log({
        logLevel: 'error',
        action: 'updateUserSubscriptionSSR',
        message: 'Error updating user subscription',
        metadata: { customerEmail, customerIdPaddle, productId, priceId, subscriptionId, subscriptionStatus, planStartDate, planEndDate, error }
      });
    }

    return { data, error };
  }

export async function renewedSubscriptionStatusSSR(
    supabase: SupabaseClient,
    customerIdPaddle: string,
    subscriptionId: string,
    priceId: string,
    subscriptionStatus: string,
    planStartDate: string | null,
    planEndDate: string | null
  ) {    
    const { data, error } = await supabase.rpc('renewed_user_subscription_status', {
      current_subscription_id: subscriptionId,
      new_price_id: priceId,
      new_subscription_status: subscriptionStatus,
      new_plan_start_date: planStartDate,
      new_plan_end_date: planEndDate,
      current_customer_id: customerIdPaddle
    }).select();

    if (error) {
      log({
        logLevel: 'error',
        action: 'renewedSubscriptionStatusSSR',
        message: 'Error renewing user subscription',
        metadata: { customerIdPaddle, subscriptionId, subscriptionStatus, planStartDate, planEndDate, error }
      });
    }

    return { data, error };
  }

export async function renewedMonthlyUsageSSR(
    supabase: SupabaseClient,
    customerIdPaddle: string,
    subscriptionId: string
  ) {    
    const { data, error } = await supabase.rpc('renewed_monthly_usage', {
      current_subscription_id: subscriptionId,
      current_customer_id: customerIdPaddle
    }).select();

    if (error) {
      log({
        logLevel: 'error',
        action: 'renewedMonthlyUsageSSR',
        message: error.message,
        metadata: { customerIdPaddle, subscriptionId, error }
      });
    }

    return { data, error };
}

export async function checkUserSubscriptionAndLimitSSR(
    supabase: SupabaseClient,
    userId: string,
    usageSeconds: number,
  ) {
    
    const { error } = await supabase.rpc('check_subscriptions_and_limits', {
      user_id: userId,
      usage_seconds: usageSeconds,
    });

    if (error) {
      log({
        logLevel: 'error',
        action: 'checkUserSubscriptionAndLimitSSR',
        message: error.message,
        metadata: { userId, usageSeconds, error }
      });
    }

    return { error };
  }

export async function updateUserUsageSSR(
    supabase: SupabaseClient,
    userId: string,
    usageSeconds: number,
  ) {
    
    const { data, error } = await supabase.rpc('update_user_usage', {
      user_id: userId,
      usage_seconds: usageSeconds,
    });

    if (error) {
      log({
        logLevel: 'error',
        action: 'updateUserUsageSSR',
        message: 'Error updating user usage',
        metadata: { userId, usageSeconds, error }
      });
    }

    return { data, error };
  }

export async function cancelSubscriptionSSR(
    supabase: SupabaseClient,
    customerId: string,
    cancelledDate: string
  ) {
    
    const { data, error } = await supabase.rpc('cancel_subscription', {
      current_customer_id: customerId,
      cancelled_date: cancelledDate
    }).select();

    if (error) {
      log({
        logLevel: 'error',
        action: 'cancelSubscriptionSSR',
        message: error.message,
        metadata: { customerId, cancelledDate, error }
      });
    }

    return { data, error };
  }