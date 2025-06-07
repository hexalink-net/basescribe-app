'use server'

import { createClient, getUserUploadSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';
import { BucketNameUpload } from '@/constants/SupabaseBucket';
import { revalidateTag } from 'next/cache';
import { z } from 'zod'
import { uploadRateLimiter } from '@/lib/upstash/ratelimit';

const renameUploadSchema = z.object({
  uploadId: z.string().uuid(),
  newFileName: z.string().max(100),
  userId: z.string().uuid()
})

export async function checkUploadRateLimit(userId: string) {
  const { success } = await uploadRateLimiter.limit(userId);
  
  return success;
}

export async function fetchTranscriptData(uploadId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        upload: null,
        audioUrl: '',
        error: 'Not authenticated'
      };
    }
    
    // Get the upload details using server-side function
    const { data: upload, error: uploadError } = await getUserUploadSSR(supabase, user.id, uploadId);
    
    if (!upload || uploadError) {
      return {
        upload: null,
        audioUrl: '',
        error: 'Upload not found or not accessible'
      };
    }
    
    // Generate the public URL for the audio file on the server
    let audioUrl = '';
    if (upload.file_path) {
      const { data, error } = await supabase.storage
        .from(BucketNameUpload)
        .createSignedUrl(upload.file_path, 3600); // 1 hour expiry
        
      if (!error && data?.signedUrl) {
        audioUrl = data.signedUrl;
      } else {
        log({
          logLevel: 'error',
          action: 'fetchTranscriptData.createSignedUrl',
          message: 'Failed to create signed URL',
          metadata: { uploadId, filePath: upload.file_path, error }
        });
      }
    }
    
    return {
      upload,
      audioUrl,
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'fetchTranscriptData',
      message: 'Error fetching transcript data',
      metadata: { uploadId, error: errorMessage }
    });
    
    return {
      upload: null,
      audioUrl: '',
      error: 'Failed to load transcript data'
    };
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