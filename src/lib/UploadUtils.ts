import { supabase } from '@/lib/supabase/client';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { BucketNameUpload } from '@/constants/SupabaseBucket';

// Define the progress callback type
type ProgressCallback = (percentage: number) => void;

// Upload functions
/**
 * Standard file upload to Supabase storage with progress reporting
 */

export async function uploadFile(
    file: File,
    filePath: string,
    fileSize: number,
    bucketName: string = BucketNameUpload,
    onProgress?: ProgressCallback // Add optional onProgress callback
  ) {
    // Sanitize the file path before upload
    const sanitizedFilePath = filePath;
    if (fileSize <= 6000 * 1000) {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(sanitizedFilePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Add progress reporting for standard uploads
          contentType: file.type || 'application/octet-stream',
          duplex: 'half', // Recommended for progress reporting
          ...(onProgress && { 
            progress: (event: ProgressEvent) => { 
              if (event.lengthComputable && event.total > 0) { 
                const percentage = Math.round((event.loaded / event.total) * 100);
                onProgress(percentage);
              }
            }
          })
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }
      // Ensure 100% is reported on success if callback exists
      onProgress?.(100);
      return;
    } else if (fileSize > 6000 * 1000 && fileSize <= 5370 * 1000 * 1000) {
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
        chunkSize: 2 * 1024 * 1024, // Chunk size for TUS uploads (2MB)
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
      
      // Add progress reporting for TUS uploads
      if (onProgress) {
        uppy.on('upload-progress', (_, progress) => {
          // Check if bytesTotal is valid before calculating percentage
          if (progress.bytesTotal && progress.bytesTotal > 0) {
            const percentage = Math.round(progress.bytesUploaded / progress.bytesTotal * 100);
            onProgress(percentage);
          }
        });

        // Ensure 100% is reported on success
        uppy.on('upload-success', () => {
          onProgress(100);
        });
      }

      uppy.addFile({
          name: filePath, // Use the sanitized file path
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
              uppy.on('error', () => {
                  // Reject the promise with a new Error object for consistency
                  reject(new Error(`Large file upload failed`));
              });

              // Start the upload; catch potential immediate errors
              uppy.upload().catch(() => {
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