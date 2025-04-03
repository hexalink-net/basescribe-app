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

    // Validate folder name
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: 'Folder name cannot be empty' }
    }

    if (trimmedName.length > 100) {
      return { success: false, error: 'Folder name is too long (maximum 100 characters)' }
    }
    
    // If creating in a parent folder, verify parent folder ownership
    if (parentId !== null) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', parentId)
        .eq('user_id', user.id)
        .single()
      
      if (folderError || !folder) {
        console.error('Error verifying parent folder ownership:', folderError)
        return { success: false, error: 'Parent folder not found or not owned by user' }
      }
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        parent_id: parentId,
        name: trimmedName
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


    // If moving to a folder (not root), verify folder ownership
    if (folderId !== null) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()
      
      if (folderError || !folder) {
        console.error('Error verifying folder ownership:', folderError)
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

    // First verify all uploads belong to the user
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('id')
      .in('id', uploadIds)
      .eq('user_id', user.id)
    
    if (uploadsError) {
      console.error('Error verifying uploads ownership:', uploadsError)
      return { success: false, error: 'Error verifying uploads ownership' }
    }

    // Check if all requested uploads were found (belong to the user)
    if (uploads.length !== uploadIds.length) {
      return { success: false, error: 'Some uploads were not found or not owned by user' }
    }

    // If moving to a folder (not root), verify folder ownership
    if (folderId !== null) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()
      
      if (folderError || !folder) {
        console.error('Error verifying folder ownership:', folderError)
        return { success: false, error: 'Folder not found or not owned by user' }
      }
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

export async function deleteFolder(folderId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Validate input
    if (!folderId) {
      return { success: false, error: 'Folder ID is required' }
    }
    
    // First, verify the folder exists and belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, parent_id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()
    
    if (folderError || !folder) {
      console.error('Error verifying folder ownership:', folderError)
      return { success: false, error: 'Folder not found or not owned by user' }
    }

    // Check if there are any uploads in this folder
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('id')
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
    
    if (uploadsError) {
      console.error('Error checking uploads in folder:', uploadsError)
      return { success: false, error: uploadsError.message }
    }

    // If there are uploads in the folder, move them to root (null folder)
    if (uploads && uploads.length > 0) {
      const uploadIds = uploads.map(upload => upload.id)
      const { error: moveError } = await supabase
        .from('uploads')
        .update({ folder_id: null })
        .in('id', uploadIds)
        .eq('user_id', user.id)
      
      if (moveError) {
        console.error('Error moving uploads out of folder:', moveError)
        return { success: false, error: moveError.message }
      }
    }

    // Check if there are any subfolders
    const { data: subfolders, error: subfoldersError } = await supabase
      .from('folders')
      .select('id')
      .eq('parent_id', folderId)
      .eq('user_id', user.id)
    
    if (subfoldersError) {
      console.error('Error checking subfolders:', subfoldersError)
      return { success: false, error: subfoldersError.message }
    }

    // If there are subfolders, move them to root (null parent)
    if (subfolders && subfolders.length > 0) {
      const { error: moveSubfoldersError } = await supabase
        .from('folders')
        .update({ parent_id: null })
        .in('id', subfolders.map(subfolder => subfolder.id))
        .eq('user_id', user.id)
      
      if (moveSubfoldersError) {
        console.error('Error moving subfolders to root:', moveSubfoldersError)
        return { success: false, error: moveSubfoldersError.message }
      }
    }

    // Now delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

export async function renameFolder(folderId: string, newName: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate folder name
    const trimmedName = newName.trim()
    if (!trimmedName) {
      return { success: false, error: 'Folder name cannot be empty' }
    }

    if (trimmedName.length > 100) {
      return { success: false, error: 'Folder name is too long (maximum 100 characters)' }
    }

    // First verify the folder exists and belongs to the user
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !folder) {
      console.error('Error verifying folder ownership:', fetchError)
      return { success: false, error: 'Folder not found or not owned by user' }
    }

    // Update the folder name
    const { error } = await supabase
      .from('folders')
      .update({ name: trimmedName })
      .eq('id', folderId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error renaming folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/folder/${folderId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

export async function moveFolder(folderId: string, newParentId: string | null) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate input
    if (!folderId) {
      return { success: false, error: 'Folder ID is required' }
    }

    // First, check if the folder exists and belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()
    
    if (folderError || !folder) {
      console.error('Error finding folder:', folderError)
      return { success: false, error: 'Folder not found or not owned by user' }
    }

    // Check if the new parent folder exists and belongs to the user (if not null)
    if (newParentId) {
      const { data: parentFolder, error: parentError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', newParentId)
        .eq('user_id', user.id)
        .single()
      
      if (parentError || !parentFolder) {
        console.error('Error finding parent folder:', parentError)
        return { success: false, error: 'Parent folder not found or not owned by user' }
      }

      // Prevent circular references - check if newParentId is not a descendant of folderId
      let currentCheckId = newParentId
      const visited = new Set<string>() // Prevent infinite loops
      
      while (currentCheckId) {
        // Safety check to prevent infinite loops
        if (visited.has(currentCheckId)) {
          return { success: false, error: 'Circular reference detected in folder structure' }
        }
        visited.add(currentCheckId)
        
        if (currentCheckId === folderId) {
          return { success: false, error: 'Cannot move a folder into its own subfolder' }
        }

        const { data: currentFolder, error: currentError } = await supabase
          .from('folders')
          .select('parent_id')
          .eq('id', currentCheckId)
          .eq('user_id', user.id)
          .single()
        
        if (currentError || !currentFolder) {
          break
        }

        currentCheckId = currentFolder.parent_id
      }
    }

    // Update the folder's parent_id
    const { error } = await supabase
      .from('folders')
      .update({ parent_id: newParentId })
      .eq('id', folderId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error moving folder:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    if (folder.parent_id) {
      revalidatePath(`/dashboard/folder/${folder.parent_id}`)
    }
    if (newParentId) {
      revalidatePath(`/dashboard/folder/${newParentId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error moving folder:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
