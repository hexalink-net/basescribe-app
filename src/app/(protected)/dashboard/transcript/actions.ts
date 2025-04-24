'use server'

import { createClient, getUserUploadSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';
import { BucketNameUpload } from '@/constants/SupabaseBucket';

/**
 * Fetch transcript data for a specific upload
 * This server action encapsulates all data fetching for the transcript page
 */
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
