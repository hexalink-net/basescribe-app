"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { UploadDetail, TranscriptSegment } from '@/types/DashboardInterface';

// Import our new components
import { FileDetailsCard } from '@/components/transcript/FileDetailsCard';
import { TranscriptCard } from '@/components/transcript/TranscriptCard';
import { AudioPlayer } from '@/components/transcript/AudioPlayer';
import { EditTranscriptCard } from '@/components/transcript/EditTranscriptCard';
import RenameDialog from '@/components/transcript/RenameDialog';
import MoveDialog from '@/components/transcript/MoveDialog';
import DeleteDialog from '@/components/transcript/DeleteDialog';
import { renameUpload, moveUploadToFolder, deleteUpload } from '@/app/(protected)/dashboard/transcript/actions';

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
  const [decryptedTranscript, setDecryptedTranscript] = useState<Array<TranscriptSegment> | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [uploadToRename, setUploadToRename] = useState<UploadDetail | null>(null);
  const [isRenameUploadModalOpen, setIsRenameUploadModalOpen] = useState(false);
  const [newUploadName, setNewUploadName] = useState('');
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [uploadToDelete, setUploadToDelete] = useState<UploadDetail | null>(null);
  const [isDeleteUploadModalOpen, setIsDeleteUploadModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioPlayerRef = useRef<{ seekTo: (time: number) => void }>(null);

  // Update localFolders when folders prop changes
  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  // Base64 to ArrayBuffer conversion helper
  const base64ToArrayBuffer = useCallback((base64: string) => {
    const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary_string = atob(base64Fixed);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  // Decrypt transcript function
  const decryptTranscript = useCallback(async (encryptedTranscriptPayload: string) => {
    try {
      setIsDecrypting(true);
      setDecryptionError(null);

      const privateKeyJwk = sessionStorage.getItem("privateKey");

      if (!privateKeyJwk) {
        console.error("Private key not found in session storage.");
        return;
      }

      const privateKeyStr = JSON.parse(privateKeyJwk);

      // The JWK must be imported into a CryptoKey object before it can be used.
      const privateKey = await crypto.subtle.importKey(
        "jwk",
        privateKeyStr.privateKey,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      const encryptedTranscriptPayloadJson = JSON.parse(encryptedTranscriptPayload);

      const encryptedAESKeyArrayBuffer = base64ToArrayBuffer(encryptedTranscriptPayloadJson.encrypted_aes_key_transcription);

      const nonceAESKeyArrayBuffer = base64ToArrayBuffer(encryptedTranscriptPayloadJson.nonce_transcription);

      // Decrypt the AES key using the imported RSA private CryptoKey.
      const decryptedAESKeyBuffer = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedAESKeyArrayBuffer
      );

      // Import the decrypted raw AES key into a CryptoKey.
      const decryptedAESKey = await crypto.subtle.importKey(
        "raw",
        decryptedAESKeyBuffer,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      // Decrypt the main content using the AES CryptoKey.
      const decryptedTranscriptionBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: nonceAESKeyArrayBuffer,
        },
        decryptedAESKey,
        base64ToArrayBuffer(encryptedTranscriptPayloadJson.ciphertext_transcription)
      );

      const decryptedContent = new TextDecoder().decode(decryptedTranscriptionBuffer);
      setDecryptedTranscript(JSON.parse(decryptedContent));
    } catch (error) {
      console.error("Decryption failed:", error);
      setDecryptionError("Failed to decrypt transcript. Please check your key.");
    } finally {
      setIsDecrypting(false);
    }
  }, [base64ToArrayBuffer, setDecryptedTranscript, setDecryptionError, setIsDecrypting]);

  // Effect to decrypt transcript when upload changes
  useEffect(() => {
    if (upload?.transcript_json) {
      decryptTranscript(upload.transcript_json);
    } else {
      setIsDecrypting(false);
    }
  }, [upload?.transcript_json, decryptTranscript]);

  // Check for private key and redirect if not available
  useEffect(() => {
    // Check if private key exists in session storage
    const privateKeyItem = sessionStorage.getItem("privateKey");
    if (!privateKeyItem) {
      toast({
        title: "Access Denied",
        description: "You need to unlock your encrypted files first.",
        variant: "destructive",
      });
      router.push('/dashboard');
      return;
    }
    
    // Check if the key has expired
    try {
      const parsed = JSON.parse(privateKeyItem);
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem("privateKey");
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      sessionStorage.removeItem("privateKey");
      toast({
        title: "Error",
        description: "Invalid encryption session. Please unlock your files again.",
        variant: "destructive",
      });
      router.push('/dashboard');
      console.log(error);
      return;
    }
    
    // If we have a valid key and upload data, set loading to false
    if (upload) {
      setLoading(false);
    }
  }, [upload, router, toast]);
  
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

  const downloadAudioFile = async () => {
    if (upload?.file_path) {
      try {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);

        const blob = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = upload.file_name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Error downloading file:', error);
        toast({
          title: "Error",
          description: "Failed to download audio file.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Audio file not available for download.",
        variant: "destructive",
      });
    }
  };

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
  
  // Handle delete upload - memoized to prevent unnecessary re-renders
  const handleDeleteUpload = useCallback(async (upload: UploadDetail) => {
    if (!upload) return;

    try {
      setIsDeleting(prev => ({ ...prev, [upload.id]: true }));
        
      const result = await deleteUpload(upload.id, user.id);
        
      if (result.success) {
        toast({
          title: "Upload deleted",
          description: "The upload has been successfully deleted.",
        });

        setUploadToDelete(null);
          
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete upload.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the upload.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [upload.id]: false }));
      router.push('/dashboard');
    }
  }, [user.id, toast, router]);

  // Memoize upload UI interaction handlers
  const handleUploadRenameClick = useCallback((upload: UploadDetail) => {
    setUploadToRename(upload);
    setNewUploadName(upload.file_name);
    setIsRenameUploadModalOpen(true);
  }, []);

  const handleUploadMoveClick = useCallback((uploadId: string) => {
    setSelectedUploadId(uploadId);
    setShowMoveDialog(true);
  }, []);

  const handleUploadDeleteClick = useCallback((upload: UploadDetail) => {
    setUploadToDelete(upload);
    setTimeout(() => setIsDeleteUploadModalOpen(true), 0);
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
            decryptedTranscript={decryptedTranscript}
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
            decryptedTranscript={decryptedTranscript}
            isDecrypting={isDecrypting}
            decryptionError={decryptionError}
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
            onDeleteUpload={handleUploadDeleteClick}
            onDownloadAudioFile={downloadAudioFile}
          />
        </div>
      </div>

      {/* Audio Player Component */}
      {audioUrl && upload && (
        <AudioPlayer 
          ref={audioPlayerRef}
          uploadId={upload.id}
          uploadDuration={upload.duration_seconds}
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

      <DeleteDialog
        isDeleteUploadModalOpen={isDeleteUploadModalOpen}
        setIsDeleteUploadModalOpen={setIsDeleteUploadModalOpen}
        uploadToDelete={uploadToDelete}
        isDeleting={!!(uploadToDelete && isDeleting[uploadToDelete.id])}
        handleDeleteUpload={handleDeleteUpload}
      />
    </div>
  );
}