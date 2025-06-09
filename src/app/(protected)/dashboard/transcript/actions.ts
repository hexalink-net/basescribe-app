'use server'

import { createClient, getUserUploadSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';
import { BucketNameUpload } from '@/constants/SupabaseBucket';
import { revalidateTag } from 'next/cache';
import { z } from 'zod'
import { uploadRateLimiter, folderRateLimiter, readRateLimiter } from '@/lib/upstash/ratelimit';
import { Folder } from '@/types/DashboardInterface';
import { SupabaseClient } from '@supabase/supabase-js';
import { deleteUserUploadSSR } from '@/lib/supabase/server';

const renameUploadSchema = z.object({
  uploadId: z.string().uuid(),
  newFileName: z.string().max(100),
  userId: z.string().uuid()
})

export async function checkUploadRateLimit(userId: string) {
  const { success } = await uploadRateLimiter.limit(userId);
  
  return success;
}

async function checkFolderRateLimit(userId: string) {
  const { success } = await folderRateLimiter.limit(userId);
  
  if (!success) {
    throw new Error('Too many requests. Please try again in a few minutes.');
  }
}

async function checkReadRateLimit(userId: string) {
  const { success } = await readRateLimiter.limit(userId);
  
  if (!success) {
    throw new Error('Too many requests. Please try again in a few minutes.');
  }
}

export async function fetchTranscriptData(uploadId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        upload: null,
        audioUrl: '',
        folders: [],
        error: 'Not authenticated'
      };
    }
    
    // Get the upload details using server-side function
    const { data: upload, error: uploadError } = await getUserUploadSSR(supabase, user.id, uploadId);
    
    if (!upload || uploadError) {
      return {
        upload: null,
        audioUrl: '',
        folders: [],
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
    
    // Get folders for the move dialog
    const foldersResult = await getFolders(supabase, user.id);
    const folders = foldersResult.success ? foldersResult.data : [];

    return {
      upload,
      audioUrl,
      folders,
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
      folders: [],
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

export async function getFolders(supabase: SupabaseClient, userId: string) {
  try {
    await checkReadRateLimit(userId);
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'getFolders',
        message: 'Error fetching folders',
        metadata: { error }
      })
      return { success: false, error: 'Unable to fetch folders', data: [] }
    }
    
    return { success: true, data: data as Folder[] }
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'getFolders',
      message: 'Error fetching folders',
      metadata: { error }
    })
    return { 
      success: false, 
      data: [],
      error: 'Unable to fetch folders' 
    }
  }
}

export async function moveUploadToFolder(uploadId: string, folderId: string | null) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    await checkFolderRateLimit(user.id);

    // If moving to a folder (not root), verify folder ownership
    if (folderId !== null) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()
      
      if (folderError || !folder) {
        log({
          logLevel: 'error',
          action: 'moveUploadToFolder',
          message: 'Error verifying folder ownership',
          metadata: { folderId, error: folderError }
        })
        return { success: false, error: 'Folder not found or not owned by user' }
      }
    }

    // Update the upload with the new folder_id
    const { error } = await supabase
      .from('uploads')
      .update({ folder_id: folderId })
      .eq('id', uploadId)
      .eq('user_id', user.id) 
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'moveUploadToFolder',
        message: 'Error moving upload to folder',
        metadata: { uploadId, folderId, error }
      })
      return { success: false, error: 'Unable to move file to folder' }
    }
    
    // Revalidate the upload tag to refresh the uploads list
    revalidateTag(`uploads-${user.id}`)
    
    return { success: true }
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'moveUploadToFolder',
      message: 'Error moving upload to folder',
      metadata: { uploadId, folderId, error }
    })
    return { 
      success: false, 
      error: 'Unable to move file to folder' 
    }
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