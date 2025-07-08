'use server'

import { deleteUserUploadSSR, createClient, createClientWithCache, createUploadSSR, updateUserUsageSSR, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server'
import { log } from '@/lib/logger'
import { z } from 'zod'
import { uploadRateLimiter } from '@/lib/upstash/ratelimit'
import { getFolders } from './folder/actions'
import { revalidateTag } from 'next/cache'
import { BucketNameUpload } from '@/constants/SupabaseBucket';
import { getUserEncryptionData } from '@/app/(protected)/encryption/actions';

const renameUploadSchema = z.object({
  uploadId: z.string().uuid(),
  newFileName: z.string().max(100),
  userId: z.string().uuid()
})

const uploadSchema = z.object({
  userId: z.string().uuid(),
  fileName: z.string().max(100),
  filePath: z.string(),
  fileSize: z.number(),
  durationSeconds: z.number(),
  folderId: z.string().uuid().nullable()
})

interface UserWithProductLimit {
  monthly_usage_seconds: number;
  product: {
    transcription_limit_seconds_per_month: number;
  };
}

/**
 * Fetch all dashboard data in parallel
 * This helps improve performance by fetching user profile, uploads, and folders concurrently
 */
export async function fetchDashboardData(userId: string) {
  try {
    const profileClient = await createClientWithCache('profile', userId, 86400);
    const uploadsClient = await createClientWithCache('uploads', userId);
    const foldersClient = await createClientWithCache('folders', userId);

    const { data: encryptionDataResult } = await getUserEncryptionData(userId);
    
    // Fetch user profile, uploads, and folders in parallel
    const [userProfileResult, allUploadsResult, foldersResult] = await Promise.all([
      getUserProfileSSR(profileClient, userId),
      getAllUserUploadsSSR(uploadsClient, userId),
      getFolders(foldersClient, userId)
    ]);
    
    // Ensure allUploads is always an array
    const uploads = allUploadsResult.data || [];
    
    return {
      userProfile: userProfileResult,
      uploads,
      folders: foldersResult.data || [],
      error: null,
      encryptionData: encryptionDataResult
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'fetchDashboardData',
      message: 'Error fetching dashboard data',
      metadata: { userId, error: errorMessage }
    });
    
    return {
      userProfile: null,
      uploads: [],
      folders: [],
      error: 'Failed to load dashboard data'
    };
  }
}

export async function deleteUpload(uploadId: string, userId: string) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      log({
        logLevel: 'error',
        action: 'deleteUpload',
        message: 'Not authenticated',
        metadata: { userId, uploadId }
      })
      return { success: false, error: 'Not authenticated' }
    }
    const result = await deleteUserUploadSSR(supabase, userId, uploadId)
    
    if (result.error) {
      log({
        logLevel: 'error',
        action: 'deleteUpload.deleteUserUploadSSR',
        message: 'Error from deleteUserUploadSSR',
        metadata: { userId, uploadId, error: result.error }
      })
      throw result.error
    }
    
    // Revalidate the upload tag to refresh the uploads list
    revalidateTag(`uploads-${user.id}`)
    
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'deleteUpload',
      message: 'Error deleting upload',
      metadata: { userId, uploadId, error: errorMessage }
    })
    return { 
      success: false, 
      error: `Unable to delete file`
    } 
  }
}

export async function bulkDeleteUploads(uploadIds: string[], userId: string) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      log({
        logLevel: 'error',
        action: 'bulkDeleteUploads',
        message: 'Not authenticated',
        metadata: { userId, uploadIds }
      })
      return { success: false, error: 'Not authenticated' }
    }
    
    // Delete each upload
    const results = await Promise.allSettled(
      uploadIds.map(uploadId => deleteUserUploadSSR(supabase, userId, uploadId))
    )
    
    // Check for errors
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason)
    
    if (errors.length > 0) {
      log({
        logLevel: 'error',
        action: 'bulkDeleteUploads',
        message: 'Errors during bulk deletion',
        metadata: { userId, uploadIds, errors }
      })
      // We'll keep this return since it's a business logic error, not a database error
      return { 
        success: false, 
        error: 'Some files could not be deleted'
      }
    }
    
    // Revalidate the upload tag to refresh the uploads list
    revalidateTag(`uploads-${user.id}`)
    
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'bulkDeleteUploads',
      message: 'Error bulk deleting uploads',
      metadata: { userId, uploadIds, error: errorMessage }
    })
    return { 
      success: false, 
      error: `Unable to delete files`
    } 
  }
}

export async function renameUpload(uploadId: string, newFileName: string, userId: string) {
  try {
    const validateInput = renameUploadSchema.safeParse({ uploadId, newFileName, userId });

    if (!validateInput.success) {
      const errorMessage = validateInput.error.issues[0].message;
      return { success: false, error: errorMessage };
    }

    const exceedLimit = await checkUploadRateLimit(userId);

    if (!exceedLimit) {
      throw new Error("Too many requests. Please try again in a few minutes.");
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      log({
        logLevel: 'error',
        action: 'renameUpload',
        message: 'Not authenticated',
        metadata: { userId, uploadId }
      })
      return { success: false, error: 'Not authenticated' }
    }

    if (!newFileName.trim()) {
      log({
        logLevel: 'error',
        action: 'renameUpload',
        message: 'File name cannot be empty',
        metadata: { userId, uploadId, newFileName }
      })
      return { success: false, error: 'File name cannot be empty' }
    }

    // First get the current upload to ensure it belongs to the user
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) {
      log({
        logLevel: 'error',
        action: 'renameUpload.fetch',
        message: 'Error fetching upload for renaming',
        metadata: { userId, uploadId, error: fetchError }
      })
      throw fetchError
    }
    
    if (!upload) {
      log({
        logLevel: 'error',
        action: 'renameUpload',
        message: 'Upload not found',
        metadata: { userId, uploadId }
      })
      return { 
        success: false, 
        error: 'Upload not found' 
      }
    }

    // Update the file_name field
    const { error: updateError } = await supabase
      .from('uploads')
      .update({ file_name: newFileName.trim() })
      .eq('id', uploadId)
      .eq('user_id', user.id)
    
    if (updateError) {
      log({
        logLevel: 'error',
        action: 'renameUpload.update',
        message: 'Error renaming upload',
        metadata: { userId, uploadId, newFileName, error: updateError }
      })
      throw updateError
    }
    
    // Revalidate the upload tag to refresh the uploads list
    revalidateTag(`uploads-${user.id}`)
    
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'renameUpload',
      message: 'Error renaming upload',
      metadata: { userId, uploadId, newFileName, error: errorMessage }
    })
    return { 
      success: false, 
      error: `Unable to rename file`
    } 
  }
}

export async function validateBatchUpload(userId: string, fileDurations: number[]): Promise<boolean> {
  try {
    // Calculate total duration of all files
    const totalDuration = fileDurations.reduce((acc, duration) => acc + duration, 0);
    
    // Get user's product ID and transcription limit from database
    const supabase = await createClient();
    const { data, error } = await supabase
    .from('users')
    .select(`
      monthly_usage_seconds,
      product:product_id(transcription_limit_seconds_per_month)
    `)
    .eq('id', userId)
    .single();

    if (error) {
      throw error;
    }

    if (!data || !data.product) return false;

    const { monthly_usage_seconds, product } = data as unknown as UserWithProductLimit;

    const limitDuration = product.transcription_limit_seconds_per_month;
    return monthly_usage_seconds + totalDuration <= limitDuration;
  } catch (error: unknown) {
    log({
      logLevel: 'error',
      action: 'checkUserTranscriptionLimit',
      message: 'Error checking transcription limit',
      metadata: {error}
    })
    return false;
  }
}

export async function revalidateUploadsTag(userId: string) {
  try {
    revalidateTag(`uploads-${userId}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'revalidateUploadsTag',
      message: 'Error revalidating uploads tag',
      metadata: { userId, error: errorMessage }
    });
    return { success: false, error: 'Failed to revalidate uploads' };
  }
}

export async function checkUploadRateLimit(userId: string) {
  const { success } = await uploadRateLimiter.limit(userId);
  
  return success;
}

export async function checkUserSubscriptionLimit(userId: string, usageSeconds: number): Promise<{ success: boolean; error?: string }> {
  const exceedLimit = await checkUploadRateLimit(userId);

  if (!exceedLimit) {
    return { success: false, error: "Too many requests. Please try again in a few minutes." };
  }

  const supabase = await createClient();
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

    if (error.message === 'Monthly usage quota exceeded' || 
        error.message.includes('Daily uploads quota exceeded') || 
        error.message.includes('Cancelled or past due')) {
      return { success: false, error: error.message };
    }
    return { success: false, error: `Failed to check user subscription limit` };
  }

  return { success: true };
}

export async function processUploadedFile(
  userId: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  durationSeconds: number,
  language: string,
  folderId?: string | null
) {
  const validateInput = uploadSchema.safeParse({ userId, fileName, filePath, fileSize, durationSeconds, folderId });

  if (!validateInput.success) {
    const errorMessage = validateInput.error.issues[0].message;
    log({
      logLevel: 'error',
      action: 'processUploadedFile',
      message: 'Invalid input',
      metadata: { userId, fileName, filePath, fileSize, durationSeconds, folderId, error: errorMessage }
    })
    throw new Error(errorMessage);
  }

  try{
    const supabase = await createClient();
    // Update user usage with the actual duration
    const { error } = await updateUserUsageSSR(supabase, userId, durationSeconds);

    if (error) {
      log({
        logLevel: 'debug',
        action: 'processUploadedFile',
        message: error.message,
        metadata: { userId, error }
      })
      throw new Error(`Failed to update user usage`);
    }

    // Revalidate the profile tag to refresh the profile
    revalidateTag(`profile-${userId}`)
    
    // Create upload record in database
    const resultUpload = await createUploadSSR(supabase, userId, fileName, filePath, fileSize, durationSeconds, language, folderId);

    // Revalidate the upload tag to refresh the uploads list
    revalidateTag(`uploads-${userId}`)

    // Fetch transcript data using server action
    const { data } = await supabase.storage
            .from(BucketNameUpload)
            .createSignedUrl(filePath, 1800); // 30 minute expiry

    const { error: queueError } = await supabase.schema('pgmq_public').rpc('send', {
      queue_name: 'transcribe_queue',
      message: { userId: userId, uploadId: resultUpload?.data?.[0].id, s3fileurl: data?.signedUrl, language: language }
    })

    if (queueError) {
      log({
        logLevel: 'error',
        action: 'processUploadedFile',
        message: 'Error sending message to queue',
        metadata: { error: queueError }
      })
      const { error: updateStatusError } = await supabase.from('uploads').update({ status: 'failed' }).eq('id', resultUpload?.data?.[0].id);
      revalidateTag(`uploads-${userId}`)

      if (updateStatusError) {
        log({
          logLevel: 'error',
          action: 'processUploadedFile',
          message: 'Error updating upload status',
          metadata: { error: updateStatusError }
        })
      }
      throw new Error(`Failed to send message to queue`);
    }

    supabase.functions.invoke('transcription_queue_handler')
    
    return;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'processUploadedFile',
      message: 'Error processing uploaded file',
      metadata: { userId, error: errorMessage }
    })
    // Re-throw the error to be caught by the calling component (UploadModal)
    throw error;
  }
}

export async function refreshAllRevalidate(userId: string) {
  try {
    revalidateTag(`uploads-${userId}`)
    revalidateTag(`folders-${userId}`)
    revalidateTag(`profile-${userId}`)
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'refreshAllRevalidate',
      message: 'Error revalidating all tags',
      metadata: { userId, error: errorMessage }
    });
    return { success: false, error: 'Failed to revalidate uploads' };
  }
}