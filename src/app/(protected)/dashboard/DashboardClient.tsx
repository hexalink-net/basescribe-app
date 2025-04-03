"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, UserProfile, Folder } from '@/types/DashboardInterface';
import UploadModal from '@/components/dashboard/UploadModal';
import { UserMenu } from '@/components/UserMenu';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { deleteUpload, bulkDeleteUploads, renameUpload } from './actions';
import { createFolder, moveUploadToFolder, deleteFolder, renameFolder, moveFolder } from './folder/actions';
import { useToast } from '@/components/ui/UseToast';

// Import our new components
import FolderSidebar from '@/components/dashboard/FolderSidebar';
import FileTable from '@/components/dashboard/FileTable';
import BulkActions from '@/components/dashboard/BulkActions';
import FolderDialogs from '@/components/dashboard/FolderDialogs';
import FileDialogs from '@/components/dashboard/FileDialogs';

interface DashboardClientProps {
  user: User;
  userProfile: UserProfile;
  uploads: Upload[];
  folders: Folder[];
  currentFolder: Folder | null;
}

// Format seconds to minutes:seconds format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function DashboardClient({ user, userProfile, uploads, folders, currentFolder }: DashboardClientProps) {
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Folder management state
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderRename, setNewFolderRename] = useState('');
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [showMoveFolderDialog, setShowMoveFolderDialog] = useState(false);
  const [folderToMove, setFolderToMove] = useState<Folder | null>(null);
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  
  // File management state
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [isRenameUploadModalOpen, setIsRenameUploadModalOpen] = useState(false);
  const [uploadToRename, setUploadToRename] = useState<Upload | null>(null);
  const [newUploadName, setNewUploadName] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };
  
  // Helper function to check if a folder is a descendant of another folder
  const isDescendantOf = (folderId: string | undefined, ancestorId: string | undefined, foldersList: Folder[]): boolean => {
    if (!folderId || !ancestorId) return false;
    
    let currentId: string | null = folderId;
    const visited = new Set<string>();
    
    while (currentId) {
      // Prevent infinite loops
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      
      const folder = foldersList.find(f => f.id === currentId);
      if (!folder) return false;
      
      if (folder.parent_id === ancestorId) return true;
      currentId = folder.parent_id;
    }
    
    return false;
  };

  // Toggle select all uploads
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUploads([]);
    } else {
      setSelectedUploads(uploads.map(upload => upload.id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual upload selection
  const handleSelectUpload = (uploadId: string) => {
    if (selectedUploads.includes(uploadId)) {
      setSelectedUploads(selectedUploads.filter(id => id !== uploadId));
      setSelectAll(false);
    } else {
      setSelectedUploads([...selectedUploads, uploadId]);
      setSelectAll(selectedUploads.length + 1 === uploads.length);
    }
  };

  // Handle delete upload
  const handleDeleteUpload = async (uploadId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [uploadId]: true }));
      
      const result = await deleteUpload(uploadId, user.id);
      
      if (result.success) {
        toast({
          title: "Upload deleted",
          description: "The upload has been successfully deleted.",
        });
        
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting upload:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the upload.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  // Handle bulk delete of selected uploads
  const handleBulkDelete = async () => {
    if (selectedUploads.length === 0) return;
    
    try {
      setIsBulkDeleting(true);
      
      const result = await bulkDeleteUploads(selectedUploads, user.id);
      
      if (result.success) {
        toast({
          title: "Uploads deleted",
          description: `${selectedUploads.length} upload(s) have been successfully deleted.`,
        });
        
        // Clear selection and refresh
        setSelectedUploads([]);
        setSelectAll(false);
        setShowBulkDeleteDialog(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete uploads.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error bulk deleting uploads:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting uploads.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await createFolder(newFolderName, currentFolder?.id || null);
      
      if (result.success) {
        toast({
          title: "Folder created",
          description: "The folder has been successfully created.",
        });
        
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create folder.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the folder.",
        variant: "destructive",
      });
    }
  };

  // Handle rename folder
  const handleRenameFolder = async () => {
    if (!folderToRename) return;
    
    if (!newFolderRename.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await renameFolder(folderToRename.id, newFolderRename);
      
      if (result.success) {
        toast({
          title: "Folder renamed",
          description: "The folder has been successfully renamed.",
        });
        
        setIsRenameFolderModalOpen(false);
        setFolderToRename(null);
        setNewFolderRename('');
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to rename folder.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while renaming the folder.",
        variant: "destructive",
      });
    }
  };

  // Handle delete folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      setIsDeletingFolder(true);
      
      const result = await deleteFolder(folderToDelete.id);
      
      if (result.success) {
        toast({
          title: "Folder deleted",
          description: "The folder has been successfully deleted.",
        });
        
        setShowDeleteFolderDialog(false);
        setFolderToDelete(null);
        
        // If we're currently viewing the deleted folder, redirect to root
        if (currentFolder?.id === folderToDelete.id) {
          router.push('/dashboard');
        } else {
          router.refresh();
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete folder.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the folder.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFolder(false);
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
      const result = await renameUpload(uploadToRename.id, newUploadName);
      
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
    } catch (error) {
      console.error("Error renaming file:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while renaming the file.",
        variant: "destructive",
      });
    }
  };

  // Handle move folder
  const handleMoveFolder = async (destinationFolderId: string | null) => {
    if (!folderToMove) return;
    
    try {
      setIsMovingFolder(true);
      
      const result = await moveFolder(folderToMove.id, destinationFolderId);
      
      if (result.success) {
        toast({
          title: "Folder moved",
          description: "The folder has been successfully moved.",
        });
        
        setShowMoveFolderDialog(false);
        setFolderToMove(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to move folder.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error moving folder:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while moving the folder.",
        variant: "destructive",
      });
    } finally {
      setIsMovingFolder(false);
    }
  };

  // Handle move upload
  const handleMoveUpload = async (uploadId: string, folderId: string | null) => {
    try {
      setIsMoving(prev => ({ ...prev, [uploadId]: true }));
      
      const result = await moveUploadToFolder(uploadId, folderId);
      
      if (result.success) {
        toast({
          title: "File moved",
          description: "The file has been successfully moved.",
        });
        
        setShowMoveDialog(false);
        setSelectedUploadId(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to move file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error moving file:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while moving the file.",
        variant: "destructive",
      });
    } finally {
      setIsMoving(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  // Handle bulk move of selected uploads
  const handleBulkMove = async (folderId: string | null) => {
    if (selectedUploads.length === 0) return;
    
    try {
      setIsBulkMoving(true);
      
      let success = true;
      let errorMessage = '';
      
      // Move each upload one by one
      for (const uploadId of selectedUploads) {
        const result = await moveUploadToFolder(uploadId, folderId);
        
        if (!result.success) {
          success = false;
          errorMessage = result.error || "Failed to move some files.";
          break;
        }
      }
      
      if (success) {
        toast({
          title: "Files moved",
          description: `${selectedUploads.length} file(s) have been successfully moved.`,
        });
        
        setShowMoveDialog(false);
        setSelectedUploads([]);
        setSelectAll(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error bulk moving uploads:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while moving files.",
        variant: "destructive",
      });
    } finally {
      setIsBulkMoving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-[#2a2a2a] py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">BaseScribe</h1>
        <UserMenu user={user} userInitials={user.email ? user.email.charAt(0).toUpperCase() : '?'} />
      </header>
      
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Folder Sidebar */}
        <FolderSidebar 
          folders={folders}
          currentFolder={currentFolder}
          userProfile={userProfile}
          onCreateFolder={() => setIsNewFolderModalOpen(true)}
          onRenameFolder={(folder) => {
            setFolderToRename(folder);
            setNewFolderRename(folder.name);
            setIsRenameFolderModalOpen(true);
          }}
          onDeleteFolder={(folder) => {
            setFolderToDelete(folder);
            setShowDeleteFolderDialog(true);
          }}
          onMoveFolder={(folder) => {
            setFolderToMove(folder);
            setShowMoveFolderDialog(true);
          }}
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {currentFolder ? currentFolder.name : 'All Files'}
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
                onClick={() => setIsNewFolderModalOpen(true)}
              >
                Create Folder
              </Button>
              <Button className="cursor-pointer" onClick={() => setIsUploadModalOpen(true)}>
                Transcribe
              </Button>
            </div>
          </div>
          
          {/* File Table */}
          <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
            <FileTable 
              uploads={uploads}
              currentFolder={currentFolder}
              selectedUploads={selectedUploads}
              isDeleting={isDeleting}
              formatDate={formatDate}
              formatTime={formatTime}
              onSelectAll={handleSelectAll}
              onSelectUpload={handleSelectUpload}
              onDeleteUpload={handleDeleteUpload}
              onMoveUpload={(uploadId) => {
                setSelectedUploadId(uploadId);
                setShowMoveDialog(true);
              }}
              onRenameUpload={(upload) => {
                setUploadToRename(upload);
                setNewUploadName(upload.file_name);
                setIsRenameUploadModalOpen(true);
              }}
              selectAll={selectAll}
            />
          </div>
        </div>
      </div>
      
      {/* Bulk Actions */}
      <BulkActions 
        selectedUploads={selectedUploads}
        isBulkDeleting={isBulkDeleting}
        onShowMoveDialog={() => setShowMoveDialog(true)}
        onShowDeleteDialog={() => setShowBulkDeleteDialog(true)}
      />
      
      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        user={user}
        userProfile={userProfile}
        folderId={currentFolder?.id || null}
      />
      
      {/* Folder Dialogs */}
      <FolderDialogs 
        // New Folder Dialog
        isNewFolderModalOpen={isNewFolderModalOpen}
        setIsNewFolderModalOpen={setIsNewFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleCreateFolder={handleCreateFolder}
        currentFolder={currentFolder}
        
        // Rename Folder Dialog
        isRenameFolderModalOpen={isRenameFolderModalOpen}
        setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
        folderToRename={folderToRename}
        newFolderRename={newFolderRename}
        setNewFolderRename={setNewFolderRename}
        handleRenameFolder={handleRenameFolder}
        
        // Delete Folder Dialog
        showDeleteFolderDialog={showDeleteFolderDialog}
        setShowDeleteFolderDialog={setShowDeleteFolderDialog}
        folderToDelete={folderToDelete}
        isDeletingFolder={isDeletingFolder}
        handleDeleteFolder={handleDeleteFolder}
        
        // Move Folder Dialog
        showMoveFolderDialog={showMoveFolderDialog}
        setShowMoveFolderDialog={setShowMoveFolderDialog}
        folderToMove={folderToMove}
        isMovingFolder={isMovingFolder}
        handleMoveFolder={handleMoveFolder}
        folders={folders}
        isDescendantOf={isDescendantOf}
      />
      
      {/* File Dialogs */}
      <FileDialogs 
        // Move Upload Dialog
        showMoveDialog={showMoveDialog}
        setShowMoveDialog={setShowMoveDialog}
        selectedUploadId={selectedUploadId}
        selectedUploads={selectedUploads}
        isMoving={isMoving}
        isBulkMoving={isBulkMoving}
        handleMoveUpload={handleMoveUpload}
        handleBulkMove={handleBulkMove}
        folders={folders}
        
        // Rename Upload Dialog
        isRenameUploadModalOpen={isRenameUploadModalOpen}
        setIsRenameUploadModalOpen={setIsRenameUploadModalOpen}
        uploadToRename={uploadToRename}
        newUploadName={newUploadName}
        setNewUploadName={setNewUploadName}
        handleRenameUpload={handleRenameUpload}
        
        // Bulk Delete Dialog
        showBulkDeleteDialog={showBulkDeleteDialog}
        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
        isBulkDeleting={isBulkDeleting}
        handleBulkDelete={handleBulkDelete}
        selectedUploadsCount={selectedUploads.length}
      />
    </div>
  );
}
