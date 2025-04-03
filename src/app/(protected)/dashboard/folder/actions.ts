'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Folder } from '@/types/DashboardInterface'

export async function createFolder(name: string, parentId: string | null) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        parent_id: parentId,
        name
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate the dashboard page to refresh the folders list
    revalidatePath('/dashboard')
    if (parentId) {
      revalidatePath(`/dashboard/folder/${parentId}`)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error creating folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

export async function getFolders() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] }
    }
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching folders:', error)
      return { success: false, error: error.message, data: [] }
    }
    
    return { success: true, data: data as Folder[] }
  } catch (error) {
    console.error('Error fetching folders:', error)
    return { 
      success: false, 
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
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

    // Update the upload with the new folder_id
    const { error } = await supabase
      .from('uploads')
      .update({ folder_id: folderId })
      .eq('id', uploadId)
      .eq('user_id', user.id) 
      .select()
    
    if (error) {
      console.error('Error moving upload to folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error moving upload to folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

export async function bulkMoveUploadsToFolder(uploadIds: string[], folderId: string | null) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update all uploads with the new folder_id
    const { error } = await supabase
      .from('uploads')
      .update({ folder_id: folderId })
      .in('id', uploadIds)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error bulk moving uploads to folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error bulk moving uploads to folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
