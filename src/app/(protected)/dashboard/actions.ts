'use server'

import { deleteUserUploadSSR } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUpload(uploadId: string, userId: string) {
  try {
    const result = await deleteUserUploadSSR(userId, uploadId)
    
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    
    // Revalidate the dashboard page to refresh the uploads list
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting upload:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
