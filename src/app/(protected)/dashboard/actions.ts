'use server'

import { deleteUserUploadSSR, createClient, createUploadSSR, updateUserUsageSSR } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUpload(uploadId: string, userId: string) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: 'Not authenticated' }
    }
    const result = await deleteUserUploadSSR(supabase, userId, uploadId)
    
    if (result.error) {
      console.error('Error from deleteUserUploadSSR:', result.error)
      throw result.error
    }
    
    // Revalidate the dashboard page to refresh the uploads list
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting upload:', error)
    return { 
      success: false, 
      error: 'Unable to delete file' 
    }
  }
}

export async function bulkDeleteUploads(uploadIds: string[], userId: string) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
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
      console.error('Errors during bulk deletion:', errors)
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
  } catch (error) {
    console.error('Error bulk deleting uploads:', error)
    return { 
      success: false, 
      error: 'Unable to delete files' 
    }
  }
}

export async function renameUpload(uploadId: string, newFileName: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!newFileName.trim()) {
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
      console.error('Error fetching upload for renaming:', fetchError)
      throw fetchError
    }
    
    if (!upload) {
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
      console.error('Error renaming upload:', updateError)
      throw updateError
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    if (upload.folder_id) {
      revalidatePath(`/dashboard/folder/${upload.folder_id}`)
    }
    revalidatePath(`/dashboard/transcript/${uploadId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming upload:', error)
    return { 
      success: false, 
      error: 'Unable to rename file' 
    }
  }
}

export async function checkUserTranscriptionLimit(userId: string, fileDurations: number[]): Promise<boolean> {
  try {
    // Calculate total duration of all files
    const totalDuration = fileDurations.reduce((acc, duration) => acc + duration, 0);
    
    // Get user's product ID and transcription limit from database
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('product_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw new Error(`Failed to get user data: ${userError.message}`);
    }

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('transcription_limit_seconds_per_month')
      .eq('id', userData.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to get product data: ${productError.message}`);
    }

    if (!productData) {
      throw new Error('Product not found');
    }

    const limitDuration = productData.transcription_limit_seconds_per_month;
    return totalDuration < limitDuration;
  } catch (error) {
    console.error("Error checking transcription limit:", error);
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

  try{
    const supabase = await createClient();
    // Update user usage with the actual duration
    const { error } = await updateUserUsageSSR(supabase, userId, durationSeconds);

    if (error) {
      throw new Error(`Failed to update user usage`);
    }
    
    // Create upload record in database
    await createUploadSSR(supabase, userId, fileName, filePath, fileSize, durationSeconds, folderId);

    return;

  } catch (error) {
    throw error;
  }
}