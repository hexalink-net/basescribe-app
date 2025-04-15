import { supabase } from '@/lib/supabase/client';
import { createUploadSSR, updateUserUsageSSR } from '@/lib/supabase/server';
import { Uppy } from '@uppy/core';
import Tus from '@uppy/tus';
import { BucketNameUpload } from '@/constants/SupabaseBucket';

// Upload functions
/**
 * Standard file upload to Supabase storage
 */
export async function uploadFile(
    file: File,
    filePath: string,
    fileSize: number,
    bucketName: string = BucketNameUpload
  ) {

    if (fileSize <= 6000 * 1000) {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (error) {
        console.error(error)
        throw new Error(`Storage upload failed`);
      }
      return;
    } else if (fileSize > 6000 * 1000 && fileSize <= 5000000 * 1000) {
      const uppy = new Uppy();
      const { data: { session } } = await supabase.auth.getSession();

      uppy.use(Tus, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/upload/resumable`, // Supabase TUS endpoint
        retryDelays: [0, 3000, 5000, 10000, 20000], // Retry delays for resumable uploads
        headers: {
            authorization: `Bearer ${session?.access_token}`, // User session access token
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // API key for Supabase
        },
        uploadDataDuringCreation: true, // Send metadata with file chunks
        removeFingerprintOnSuccess: true, // Remove fingerprint after successful upload
        chunkSize: 6 * 1024 * 1024, // Chunk size for TUS uploads (6MB)
        allowedMetaFields: [
            "bucketName",
            "objectName",
            "contentType",
            "cacheControl",
        ], // Metadata fields allowed for the upload
        onError: (error) => {console.error("Upload error:", error); throw new Error(`Storage upload failed`);}, // Error handling for uploads
        }).on("file-added", (file) => {
            // Attach metadata to each file, including bucket name and content type
            file.meta = {
                ...file.meta,
                bucketName, // Bucket specified by the user of the hook
                objectName: file.name, // Use file name as object name
                contentType: file.type, // Set content type based on file MIME type
            };
        });

        return;
    }

    throw new Error(`File size exceeds maximum allowed`);
  }