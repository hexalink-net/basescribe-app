"use client";

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/UseToast';
import { Upload } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/DashboardInterface';
import { uploadFileStandard, processUploadedFile } from '@/lib/UploadUtils';

// 100MB max file size for free users
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024;
// 500MB max file size for pro users
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024;

interface UploadModalProps {
  user: User;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
}

export default function UploadModal({ user, userProfile, isOpen, onClose, folderId }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!user || !user.id) {
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
    const filePath = `${user.id}/${timestamp}-${file.name}`;
    
    try {
      setLoading(true);
      
      // Upload to storage
      await uploadFileStandard(file, filePath);

      // Process the upload
      await processUploadedFile(user.id, fileName, filePath, fileSize, file, folderId);
      
      // Show success message
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded and is ready for transcription.",
      });
      
      // Close the modal
      onClose();
      
      // Refresh the dashboard
      router.refresh();
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Audio
          </DialogTitle>
          <DialogDescription>
            Upload audio files to transcribe. Supported formats: MP3, WAV, M4A, FLAC.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <FileUpload 
            onFileSelected={handleFileUpload} 
            maxSizeInBytes={userProfile?.plan_id === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE}
            disabled={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
