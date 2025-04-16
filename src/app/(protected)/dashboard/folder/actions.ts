'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Folder } from '@/types/DashboardInterface'
import { log } from '@/lib/logger'
import { z } from 'zod'

const folderSchema = z.object({
    name: z.string().min(1, 'Folder name must be between 1 and 50 characters').max(50, 'Folder name must be between 1 and 50 characters'),
    parentId: z.string().nullable().default(null)
})

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

    const result = folderSchema.safeParse({ name: trimmedName, parentId })
    
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return { success: false, error: errorMessage }
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
        log({
          logLevel: 'error',
          action: 'createFolder',
          message: 'Error verifying parent folder ownership',
          metadata: { parentId, error: folderError }
        })
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
      log({
        logLevel: 'error',
        action: 'createFolder',
        message: 'Error creating folder',
        metadata: { name, parentId, error: folderError }
      })
      return { success: false, error: 'Unable to create folder' }
    }
    
    // Revalidate the dashboard page to refresh the folders list
    revalidatePath('/dashboard')
    
    return { success: true, data: folder }
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'createFolder',
      message: 'Error creating folder',
      metadata: { name, parentId, error }
    })
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
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
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
        log({
          logLevel: 'error',
          action: 'bulkMoveUploadsToFolder',
          message: 'Error verifying folder ownership',
          metadata: { folderId, error: folderError }
        })
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
      log({
        logLevel: 'error',
        action: 'bulkMoveUploadsToFolder',
        message: 'Error bulk moving uploads to folder',
        metadata: { uploadIds, folderId, error }
      })
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
    log({
      logLevel: 'error',
      action: 'bulkMoveUploadsToFolder',
      message: 'Error bulk moving uploads to folder',
      metadata: { uploadIds, folderId, error }
    })
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
      log({
        logLevel: 'error',
        action: 'deleteFolder',
        message: 'Error checking uploads in folder',
        metadata: { folderId, error: uploadsError }
      })
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
        log({
          logLevel: 'error',
          action: 'deleteFolder',
          message: 'Error moving uploads out of folder',
          metadata: { folderId, error: moveError }
        })
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
      log({
        logLevel: 'error',
        action: 'deleteFolder',
        message: 'Error checking subfolders',
        metadata: { folderId, error: subfoldersError }
      })
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
        log({
          logLevel: 'error',
          action: 'deleteFolder',
          message: 'Error moving subfolders to root',
          metadata: { folderId, error: moveSubfoldersError }
        })
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
      log({
        logLevel: 'error',
        action: 'deleteFolder',
        message: 'Error deleting folder',
        metadata: { folderId, error }
      })
      throw error
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/folder/[id]', 'page')
    
    return { success: true }
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'deleteFolder',
      message: 'Error deleting folder',
      metadata: { folderId, error }
    })
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

    const result = folderSchema.safeParse({ name: trimmedName, parentId: null })
    
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return { success: false, error: errorMessage }
    }

    // Update the folder name
    const { error } = await supabase
      .from('folders')
      .update({ name: trimmedName })
      .eq('id', folderId)
      .eq('user_id', user.id)
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'renameFolder',
        message: 'Error renaming folder',
        metadata: { folderId, newName, error }
      })
      throw error
    }
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/folder/${folderId}`)
    
    return { success: true }
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'renameFolder',
      message: 'Error renaming folder',
      metadata: { folderId, newName, error }
    })
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
        .select('id, parent_id')
        .eq('id', newParentId)
        .eq('user_id', user.id)
        .single()
      
      if (parentError) {
        log({
          logLevel: 'error',
          action: 'moveFolder',
          message: 'Error finding parent folder',
          metadata: { newParentId, error: parentError }
        })
        throw parentError
      }
      
      if (!parentFolder) {
        return { success: false, error: 'Parent folder not found or not owned by user' }
      }

      if (parentFolder.parent_id !== null) {
        return { success: false, error: 'Parent folder must be a root folder' }
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
      log({
        logLevel: 'error',
        action: 'moveFolder',
        message: 'Error moving folder',
        metadata: { folderId, newParentId, error }
      })
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
    log({
      logLevel: 'error',
      action: 'moveFolder',
      message: 'Error moving folder',
      metadata: { folderId, newParentId, error }
    })
    return { 
      success: false, 
      error: 'Unable to move folder' 
    }
  }
}
