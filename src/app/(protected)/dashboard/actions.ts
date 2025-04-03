'use server'

import { deleteUserUploadSSR, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUpload(uploadId: string, userId: string) {
  try {
    const result = await deleteUserUploadSSR(userId, uploadId)
    
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    
    // Revalidate the dashboard page to refresh the uploads list
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting upload:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
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
      uploadIds.map(uploadId => deleteUserUploadSSR(userId, uploadId))
    )
    
    // Check for errors
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason)
    
    if (errors.length > 0) {
      console.error('Errors during bulk deletion:', errors)
      return { 
        success: false, 
        error: 'Some files could not be deleted',
        details: errors
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
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
