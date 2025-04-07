"use client";

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/UseToast';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/DashboardInterface';
import { uploadFile, processUploadedFile } from '@/lib/UploadUtils';

// 5 GB max file size for free users
const MAX_FILE_SIZE_FREE = 6 * 1000 * 1000;
// 5 GB max file size for pro users
const MAX_FILE_SIZE_PRO = 5000 * 1000 * 1000;

interface UploadModalProps {
  userId: string;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
  multiple?: boolean;
}

export default function UploadModal({ userId, userProfile, isOpen, onClose, folderId, multiple = true }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user can upload based on their plan type
    const maxFileSize = userProfile?.plan_id === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
    
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxFileSize / (1024 * 1024)}MB for your plan type.`,
        variant: "destructive",
      });
      return;
    }

    // Create a new upload record
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const fileSize = file.size;
    const timestamp = new Date().toISOString();
    const filePath = `${userId}/${timestamp}-${file.name}`;
    
    try {
      setLoading(true);
      
      // Upload to storage
      await uploadFile(file, filePath, fileSize);

      // Process the upload
      await processUploadedFile(userId, fileName, filePath, fileSize, file, folderId);
    
      // Show success message
      toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded and is ready for transcription.`,
      });

      router.refresh();

    } catch (error: any) {
      console.error('Upload failed:', error);
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
            onFileSelected={handleFileUpload} 
            maxSizeInBytes={userProfile?.plan_id === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE}
            disabled={loading}
            multiple={multiple}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
