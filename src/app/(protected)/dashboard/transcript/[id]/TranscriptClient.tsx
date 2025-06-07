"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { UploadDetail } from '@/types/DashboardInterface';

// Import our new components
import { FileDetailsCard } from '@/components/transcript/FileDetailsCard';
import { TranscriptCard } from '@/components/transcript/TranscriptCard';
import { AudioPlayer } from '@/components/transcript/AudioPlayer';
import { EditTranscriptCard } from '@/components/transcript/EditTranscriptCard';
import RenameDialog from '@/components/transcript/RenameDialog';
import MoveDialog from '@/components/transcript/MoveDialog';
import { renameUpload, moveUploadToFolder } from '@/app/(protected)/dashboard/transcript/actions';

import { useToast } from '@/components/ui/UseToast';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Folder } from '@/types/DashboardInterface';

interface TranscriptClientProps {
  upload: UploadDetail | null;
  audioUrl: string;
  user: User;
  folders: Folder[];
}

export default function TranscriptClient({ upload, audioUrl, user, folders }: TranscriptClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [uploadToRename, setUploadToRename] = useState<UploadDetail | null>(null);
  const [isRenameUploadModalOpen, setIsRenameUploadModalOpen] = useState(false);
  const [newUploadName, setNewUploadName] = useState('');
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders);
  const [currentTime, setCurrentTime] = useState(0);
  const audioPlayerRef = useRef<{ seekTo: (time: number) => void }>(null);
  
  
  // Update localFolders when folders prop changes
  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  // Set loading to false once component is mounted and data is available
  useEffect(() => {
    if (upload) {
      setLoading(false);
    }
  }, [upload]);
  
  // Helper functions that we'll pass to child components
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr}, ${timeStr}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // const downloadTranscript = () => {
  //   if (!upload || !upload.transcript_text) return;
    
  //   const element = document.createElement('a');
  //   const file = new Blob([upload.transcript_text], { type: 'text/plain' });
  //   element.href = URL.createObjectURL(file);
  //   element.download = `${upload.file_name.split('.')[0]}_transcript.txt`;
  //   document.body.appendChild(element);
  //   element.click();
  //   document.body.removeChild(element);
  // };

  // Handle rename upload
  const handleRenameUpload = async () => {
    if (!uploadToRename) return;
      
    if (!newUploadName.trim()) {
      toast({
        title: "Error",
        description: "File name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await renameUpload(uploadToRename.id, newUploadName, user.id);
      
      if (result.success) {
        toast({
          title: "File renamed",
          description: "The file has been successfully renamed.",
        });
          
        setIsRenameUploadModalOpen(false);
        setUploadToRename(null);
        setNewUploadName('');
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to rename file.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred while renaming the file.",
        variant: "destructive",
      });
    }
  };

  // Handle move upload
  const handleMoveUpload = async (uploadId: string, folderId: string | null) => {
    try {
      // Show loading state
      setIsMoving(prev => ({ ...prev, [uploadId]: true }));
      
      // Close dialog and clear selection
      setShowMoveDialog(false);
      setSelectedUploadId(null);
        
      // Show immediate feedback
      toast({
        title: "Moving file...",
        description: "Your file is being moved.",
      });
        
      // Perform the actual operation in the background
      const result = await moveUploadToFolder(uploadId, folderId);
        
      if (result.success) {
          // Show success toast
        toast({
          title: "File moved",
          description: "The file has been successfully moved.",
        });
          
        // Refresh the data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to move file.",
          variant: "destructive",
        });
        router.refresh();
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred while moving the file.",
        variant: "destructive",
      });
        router.refresh();
      } finally {
        setIsMoving(prev => ({ ...prev, [uploadId]: false }));
      }
    };

  // Memoize upload UI interaction handlers
  const handleUploadRenameClick = useCallback((upload: UploadDetail) => {
    setUploadToRename(upload);
    setNewUploadName(upload.file_name);
    setIsRenameUploadModalOpen(true);
  }, []);

  // Memoize upload UI interaction handlers
  const handleUploadMoveClick = useCallback((uploadId: string) => {
    setSelectedUploadId(uploadId);
    setShowMoveDialog(true);
  }, []);

  if (loading || !upload) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 pb-24">
      <div className="grid md:grid-cols-5 gap-6">
        <div>
          {/* File Details Card Component */}
          <FileDetailsCard 
            upload={upload}
          />
        </div>
        <div className="col-span-3">
          {/* Transcript Card Component */}
          <TranscriptCard 
            upload={upload} 
            formatDate={formatDate}
            showTimestamps={showTimestamps}
            onSeek={(time) => audioPlayerRef.current?.seekTo(time)}
            currentTime={currentTime}
          />
        </div>
        <div>
          {/* File Details Card Component */}
          <EditTranscriptCard 
            upload={upload} 
            formatFileSize={formatFileSize}
            showTimestamps={showTimestamps}
            onShowTimestampsChange={setShowTimestamps}
            onRenameUpload={handleUploadRenameClick}
            onMoveUpload={handleUploadMoveClick}
          />
        </div>
      </div>

      {/* Audio Player Component */}
      {audioUrl && upload && (
        <AudioPlayer 
          ref={audioPlayerRef}
          audioUrl={audioUrl} 
          fileName={upload.file_name} 
          onTimeChange={setCurrentTime}
        />
      )}

      <RenameDialog
        isRenameUploadModalOpen={isRenameUploadModalOpen}
        setIsRenameUploadModalOpen={setIsRenameUploadModalOpen}
        uploadToRename={uploadToRename}
        newUploadName={newUploadName}
        setNewUploadName={setNewUploadName}
        handleRenameUpload={handleRenameUpload}
      />

      <MoveDialog
        showMoveDialog={showMoveDialog}
        setShowMoveDialog={setShowMoveDialog}
        selectedUploadId={selectedUploadId}
        isMoving={isMoving} 
        handleMoveUpload={handleMoveUpload}
        folders={localFolders}
      />
    </div>
  );
}