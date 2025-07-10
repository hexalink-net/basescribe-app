"use client";

import { useState } from 'react';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/UseToast';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/DashboardInterface';
import { uploadFile } from '@/lib/UploadUtils';
import { getMediaDuration } from '@/lib/MediaUtils';
import { processUploadedFile, checkUserSubscriptionLimit } from '@/app/(protected)/dashboard/actions';
import { BucketNameUpload } from '@/constants/SupabaseBucket';
import { pro } from '@/constants/PaddleProduct';

// 50 MB max file size for free users
const MAX_FILE_SIZE_FREE = 210 * 1000 * 1000;
// 5 GB max file size for pro users
const MAX_FILE_SIZE_PRO = 5370 * 1000 * 1000;

interface UploadModalProps {
  userId: string;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
  multiple?: boolean;
}

function sanitizeFilePath(filePath: string): string {
  // Split the path into directory and filename
  const lastSlashIndex = filePath.lastIndexOf('/');
  const directory = filePath.substring(0, lastSlashIndex + 1);
  const fileName = filePath.substring(lastSlashIndex + 1);

  // Sanitize the filename: convert spaces to hyphens and remove special characters
  const sanitizedName = fileName
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();

  // Combine directory and sanitized filename
  return directory + sanitizedName;
}

export default function UploadModal({ userId, userProfile, isOpen, onClose, folderId, multiple = true }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (file: File, language: string, durationSeconds: number, onProgress?: (percentage: number) => void): Promise<void> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    // Create a new upload record
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const fileSize = file.size;
    const timestamp = new Date().toISOString();
    const filePath = `${userId}/temp/${timestamp}-${file.name}`;
    
    try {
      setLoading(true);

      // Check user subscription limit
      const result = await checkUserSubscriptionLimit(userId, durationSeconds);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Upload to storage with progress reporting
      await uploadFile(file, sanitizeFilePath(filePath), fileSize, BucketNameUpload, onProgress);

      // Process the upload
      await processUploadedFile(userId, fileName, sanitizeFilePath(filePath), fileSize, durationSeconds, language, folderId);
    
      // Show success message
      toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded and is ready for transcription.`,
      });

      router.refresh();

    } catch (error: unknown) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Audio {multiple ? 'Files' : 'File'}
          </DialogTitle>
          <DialogDescription>
            Upload audio files to transcribe. Supported formats: MP3, WAV, M4A, FLAC.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full overflow-y-auto flex-grow">
          <FileUpload 
            userId={userId}
            productId = {userProfile?.product_id}
            monthlyUsage = {userProfile?.monthly_usage_seconds}
            onFileSelected={handleFileUpload} 
            maxSizeInBytes={userProfile?.product_id === pro ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE}
            disabled={loading}
            multiple={userProfile?.product_id === pro ? multiple : false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
