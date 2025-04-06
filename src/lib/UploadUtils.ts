import { supabase } from '@/lib/supabase/client';
import { createUploadSSR, updateUserUsageSSR } from '@/lib/supabase/server';
import { getMediaDuration } from '@/lib/MediaUtils';

// Upload functions
/**
 * Standard file upload to Supabase storage
 */
export async function uploadFileStandard(
    file: File,
    filePath: string,
    bucketName: string = 'user-uploads'
  ) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (error) {
      throw new Error(`Storage upload failed`);
    }
    
    return;
  }
  
  /**
   * Resumable file upload to Supabase storage
   * This is a placeholder for implementing chunked/resumable uploads
   */
export async function uploadFileResumable(
    file: File,
    filePath: string,
    onProgress?: (progress: number) => void,
    bucketName: string = 'user-uploads'
) {
    // Implementation for resumable uploads would go here
    // This would involve chunking the file and handling upload state
    
    // For now, fall back to standard upload
    return uploadFileStandard(file, filePath, bucketName);
}
  
  /**
   * Process file after upload - calculate duration and update database
   */
export async function processUploadedFile(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    file: File,
    folderId?: string | null
) {
    // Calculate duration in seconds
    let durationSeconds = await getMediaDuration(file);
    if (durationSeconds === null) {
      durationSeconds = Math.max(1, Math.round((fileSize / (128 * 1024 / 8 * 60))));
    }
    
    // Create upload record in database
    await createUploadSSR(supabase, userId, fileName, filePath, fileSize, durationSeconds, folderId);
    
    // Update user usage with the actual duration
    await updateUserUsageSSR(supabase, userId, durationSeconds);
    
    return;
}