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
    
    // If creating in a parent folder, verify parent folder ownership and check if it's a root-level folder
    if (parentId !== null) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id, parent_id')
        .eq('id', parentId)
        .eq('user_id', user.id)
        .single()
      
      if (folderError || !folder) {
        console.error('Error verifying parent folder ownership:', folderError)
        return { success: false, error: 'Parent folder not found or not owned by user' }
      }
      
      // Check if the parent folder is already a child folder (has a parent_id)
      if (folder.parent_id !== null) {
        return { success: false, error: 'Cannot create folders inside child folders. Only root folders can contain subfolders.' }
      }
    }
    
    const { data: folder, error: folderError } = await supabase
    .rpc('create_or_get_folder', {
      folder_name: trimmedName,
      uid: user.id,
      parent_id: parentId
    });
    
    if (folderError) {
      console.error('Error creating folder:', folderError)
      return { success: false, error: 'Unable to create folder' }
    }
    
    // Revalidate the dashboard page to refresh the folders list
    revalidatePath('/dashboard')
    
    return { success: true, data: folder }
  } catch (error) {
    console.error('Error creating folder:', error)
    return { 
      success: false, 
      error: 'Unable to create folder' 
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
      return { success: false, error: 'Unable to fetch folders', data: [] }
    }
    
    return { success: true, data: data as Folder[] }
  } catch (error) {
    console.error('Error fetching folders:', error)
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
      return { success: false, error: 'Unable to move file to folder' }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error moving upload to folder:', error)
    return { 
      success: false, 
      error: 'Unable to move file to folder' 
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
    const { data, error } = await supabase
      .from('uploads')
      .update({ folder_id: folderId })
      .in('id', uploadIds)
      .eq('user_id', user.id)
      .select()
    
    if (error) {
      console.error('Error bulk moving uploads to folder:', error)
      return { success: false, error: 'Unable to move files to folder' }
    }

    if (data.length !== uploadIds.length) {
      return { success: false, error: 'Some files do not belong to you' }
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error bulk moving uploads to folder:', error)
    return { 
      success: false, 
      error: 'Unable to move files to folder' 
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

    // Check if there are any uploads in this folder
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('id')
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
    
    if (uploadsError) {
      console.error('Error checking uploads in folder:', uploadsError)
      throw uploadsError
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
        throw moveError
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
      throw subfoldersError
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
        throw moveSubfoldersError
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
      throw error
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return { 
      success: false, 
      error: 'Unable to delete folder' 
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

    // Update the folder name
    const { error } = await supabase
      .from('folders')
      .update({ name: trimmedName })
      .eq('id', folderId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error renaming folder:', error)
      throw error
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/folder/${folderId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming folder:', error)
    return { 
      success: false, 
      error: 'Unable to rename folder' 
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

    // Check if the new parent folder exists and belongs to the user (if not null)
    if (newParentId) {
      const { data: parentFolder, error: parentError } = await supabase
        .from('folders')
        .select('id')
        .eq('id', newParentId)
        .eq('user_id', user.id)
        .single()
      
      if (parentError) {
        console.error('Error finding parent folder:', parentError)
        throw parentError
      }
      
      if (!parentFolder) {
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
      throw error
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')

    if (newParentId) {
      revalidatePath(`/dashboard/folder/${newParentId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error moving folder:', error)
    return { 
      success: false, 
      error: 'Unable to move folder' 
    }
  }
}
