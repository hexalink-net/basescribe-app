import { supabase } from '@/lib/supabase/client';
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
        throw new Error(`Storage upload failed`);
      }
      return;
    } else if (fileSize > 6000 * 1000 && fileSize <= 5000000 * 1000) {
      // TUS upload for larger files
      const uppy = new Uppy();
      const { data: { session } } = await supabase.auth.getSession();

      // Add a check for the session, crucial for authentication
      if (!session) {
          throw new Error("User session not found. Cannot perform TUS upload.");
      }

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
        ]
      }).on("file-added", (file) => {
          // Attach metadata to each file, including bucket name and content type
          file.meta = {
              ...file.meta,
              bucketName, // Bucket specified by the user of the hook
                objectName: file.name, // Use file name as object name
              contentType: file.type, // Set content type based on file MIME type
          };
      });

      uppy.addFile({
          name: filePath, // Use the consistent filePath
          type: file.type,
          data: file
      });

      // Wrap the promise handling in a try...catch block
      try {
          // Await the promise that resolves on 'complete' or rejects on 'error'
          await new Promise((resolve, reject) => {
              uppy.on('complete', (result) => {
                  resolve(result);
              });

              // IMPORTANT: This connects Uppy's error signal to the promise rejection
              uppy.on('error', (error) => {
                  // Reject the promise with a new Error object for consistency
                  reject(new Error(`Large file upload failed`));
              });

              // Start the upload; catch potential immediate errors
              uppy.upload().catch(initialError => {
                  reject(new Error(`Failed to initiate large file upload`));
              });
          });
      } catch (error) {
          // Re-throw the error so the calling function (e.g., server action) can catch it
          // Ensure it's an Error object
          if (error instanceof Error) {
              throw error;
          } else {
              throw new Error(`An unknown error occurred during large file upload: ${String(error)}`);
          }
      } 

      return;
    }

    throw new Error(`File size exceeds maximum allowed`);
  }