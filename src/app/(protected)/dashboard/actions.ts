'use server'

import { deleteUserUploadSSR, createClient, createUploadSSR, updateUserUsageSSR } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { log } from '@/lib/logger'
import { z } from 'zod'

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
    
    // Revalidate the dashboard page to refresh the uploads list
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
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
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
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
    
    // Revalidate paths
    revalidatePath('/dashboard')
    if (upload.folder_id) {
      revalidatePath(`/dashboard/folder/${upload.folder_id}`)
    }
    revalidatePath(`/dashboard/transcript/${uploadId}`)
    
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

export async function checkUserTranscriptionLimit(userId: string, fileDurations: number[]): Promise<boolean> {
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
    return monthly_usage_seconds + totalDuration < limitDuration;
  } catch (error: unknown) {
    console.log(error)
    log({
      logLevel: 'error',
      action: 'checkUserTranscriptionLimit',
      message: 'Error checking transcription limit',
      metadata: {error}
    })
    return false;
  }
}

export async function processUploadedFile(
  userId: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  durationSeconds: number,
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
        message: 'Failed to update user usage',
        metadata: { userId, error }
      })

      if (error.message === 'Monthly usage quota exceeded') {
        throw new Error(error.message);
      }
      throw new Error(`Failed to update user usage`);
    }
    
    // Create upload record in database
    await createUploadSSR(supabase, userId, fileName, filePath, fileSize, durationSeconds, folderId);

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