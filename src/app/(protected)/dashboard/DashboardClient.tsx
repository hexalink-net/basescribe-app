"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Upload, UserProfile, Folder } from '@/types/DashboardInterface';
import UploadModal from '@/components/dashboard/UploadModal';
import { CheckCircle2, FileAudio, MoreVertical, Trash2, FolderIcon, FolderPlus, FolderUp, ChevronRight, ChevronDown } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { deleteUpload, bulkDeleteUploads } from './actions';
import { createFolder, moveUploadToFolder } from './folder/actions';
import { useToast } from '@/components/ui/UseToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardClientProps {
  user: User;
  userProfile: UserProfile;
  uploads: Upload[];
  folders: Folder[];
  currentFolder: Folder | null;
}

export default function DashboardClient({ user, userProfile, uploads, folders, currentFolder }: DashboardClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();

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
  
  // Format seconds to minutes:seconds format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Effect to handle select all checkbox state based on selected uploads
  useEffect(() => {
    if (uploads.length > 0 && selectedUploads.length === uploads.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUploads, uploads]);

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
    setSelectedUploads(prev => {
      if (prev.includes(uploadId)) {
        return prev.filter(id => id !== uploadId);
      } else {
        return [...prev, uploadId];
      }
    });
  };

  const handleDeleteUpload = async (uploadId: string) => {
    // Set deleting state for this upload
    setIsDeleting(prev => ({ ...prev, [uploadId]: true }));
    
    try {
      const result = await deleteUpload(uploadId, user.id);
      
      if (result.success) {
        // Remove from selected uploads if it was selected
        if (selectedUploads.includes(uploadId)) {
          setSelectedUploads(prev => prev.filter(id => id !== uploadId));
        }
        
        toast({
          title: "File deleted",
          description: "The file has been successfully deleted"
        });
      } else {
        toast({
          title: "Delete failed",
          description: result.error || 'An error occurred while deleting the file',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the file",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [uploadId]: false }));
    }
  };
  
  // Handle bulk delete of selected uploads
  const handleBulkDelete = async () => {
    if (selectedUploads.length === 0) return;
    
    setIsBulkDeleting(true);
    
    try {
      const result = await bulkDeleteUploads(selectedUploads, user.id);
      
      if (result.success) {
        toast({
          title: "Files deleted",
          description: `Successfully deleted ${selectedUploads.length} file(s)`
        });
        setSelectedUploads([]);
      } else {
        toast({
          title: "Delete failed",
          description: result.error || 'An error occurred while deleting the files',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error bulk deleting uploads:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the files",
        variant: "destructive"
      });
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await createFolder(newFolderName, currentFolder?.id || null);
      
      if (result.success) {
        toast({
          title: "Folder created",
          description: `Folder "${newFolderName}" has been created successfully.`
        });
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error creating folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleMoveUpload = async (uploadId: string, folderId: string | null) => {
    setIsMoving(prev => ({ ...prev, [uploadId]: true }));
    
    try {
      const result = await moveUploadToFolder(uploadId, folderId);
      
      if (result.success) {
        // Remove from selected uploads if it was selected
        if (selectedUploads.includes(uploadId)) {
          setSelectedUploads(prev => prev.filter(id => id !== uploadId));
        }
        
        toast({
          title: "Upload moved",
          description: folderId ? "The upload has been moved to the selected folder." : "The upload has been moved to the root folder."
        });
        setShowMoveDialog(false);
        setSelectedUploadId(null);
        
        // Navigate to the appropriate folder page after successful move
        if (folderId) {
          router.push(`/dashboard/folder/${folderId}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error moving upload:', error);
      toast({
        title: "Error moving upload",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsMoving(prev => ({ ...prev, [uploadId]: false }));
    }
  };
  
  // Handle bulk move of selected uploads
  const handleBulkMove = async (folderId: string | null) => {
    if (selectedUploads.length === 0) return;
    
    setIsBulkMoving(true);
    
    try {
      // Move each upload individually
      const promises = selectedUploads.map(uploadId => moveUploadToFolder(uploadId, folderId));
      const results = await Promise.all(promises);
      
      const failures = results.filter(result => !result.success);
      
      if (failures.length === 0) {
        toast({
          title: "Files moved",
          description: `Successfully moved ${selectedUploads.length} file(s)`
        });
        setSelectedUploads([]);
        setShowMoveDialog(false);
        
        // Navigate to the appropriate folder page after successful move
        if (folderId) {
          router.push(`/dashboard/folder/${folderId}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({
          title: "Move partially failed",
          description: `${failures.length} out of ${selectedUploads.length} files failed to move`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error bulk moving uploads:', error);
      toast({
        title: "Move failed",
        description: "An error occurred while moving the files",
        variant: "destructive"
      });
    } finally {
      setIsBulkMoving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-[#2a2a2a] py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">BaseScribe</h1>
        <UserMenu user={user} userInitials={user.email ? user.email.charAt(0).toUpperCase() : '?'} />
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#2a2a2a] flex flex-col">
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-400">Folders</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 cursor-pointer" 
                onClick={() => {
                  // Reset current folder selection for root folder creation
                  setIsNewFolderModalOpen(true);
                }}
                title="Create folder in root"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Link href="/dashboard" className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${!currentFolder ? 'bg-[#2a2a2a]' : ''}`}>
                <FolderIcon className="h-4 w-4" />
                <span>All Files</span>
              </Link>
              
              {/* Root folders */}
              {folders
                .filter(folder => folder.parent_id === null)
                .map(rootFolder => {
                  // Check if this folder has any subfolders
                  const hasSubfolders = folders.some(f => f.parent_id === rootFolder.id);
                  const isExpanded = expandedFolders[rootFolder.id] || false;
                  
                  return (
                    <div key={rootFolder.id} className="space-y-0.5">
                      <div className="flex items-center">
                        {hasSubfolders ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 mr-1" 
                            onClick={(e) => {
                              e.preventDefault();
                              setExpandedFolders(prev => ({
                                ...prev,
                                [rootFolder.id]: !prev[rootFolder.id]
                              }));
                            }}
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </motion.div>
                          </Button>
                        ) : (
                          <div className="w-6 mr-1" /> // Spacer for alignment
                        )}
                        <Link 
                          href={`/dashboard/folder/${rootFolder.id}`} 
                          className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] flex-grow ${currentFolder?.id === rootFolder.id ? 'bg-[#2a2a2a]' : ''}`}
                        >
                          <FolderIcon className="h-4 w-4" />
                          <span>{rootFolder.name}</span>
                        </Link>
                      </div>
                      
                      {/* Subfolders with animation */}
                      <AnimatePresence>
                        {hasSubfolders && isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="ml-6 pl-2 border-l border-[#3a3a3a]"
                          >
                            {folders
                              .filter(subfolder => subfolder.parent_id === rootFolder.id)
                              .map(subfolder => (
                                <motion.div
                                  key={subfolder.id}
                                  initial={{ x: -5, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2, delay: 0.05 }}
                                >
                                  <Link 
                                    href={`/dashboard/folder/${subfolder.id}`} 
                                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${currentFolder?.id === subfolder.id ? 'bg-[#2a2a2a]' : ''}`}
                                  >
                                    <FolderIcon className="h-4 w-4" />
                                    <span>{subfolder.name}</span>
                                  </Link>
                                </motion.div>
                              ))
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              }
            </div>
          </div>
          
          {/* Usage section */}
          <div className="p-4 border-t border-[#2a2a2a] mt-auto">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">Usage</span>
              <span className="text-xs text-gray-400 ml-auto">
                {userProfile?.plan_id === 'free' ? 'Free Plan' : 'Pro Plan'}
              </span>
            </div>
            <Progress 
              value={userProfile?.plan_id === 'free' 
                ? Math.min(100, ((userProfile?.total_usage_seconds || 0) / (30 * 60)) * 100)
                : Math.min(100, ((userProfile?.monthly_usage_seconds || 0) / (60 * 60)) * 100)} 
              className="h-1 bg-[#2a2a2a]" 
            />
            <div className="text-xs text-gray-400 mt-1">
              {userProfile?.plan_id === 'free' 
                ? `${formatDuration(userProfile?.total_usage_seconds || 0)} / 30:00 minutes total`
                : `${formatDuration(userProfile?.monthly_usage_seconds || 0)} / 60:00 minutes monthly`}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            {currentFolder ? (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">{currentFolder.name}</h2>
              </div>
            ) : (
              <h2 className="text-xl font-medium">Recent Files</h2>
            )}
            <div className="flex gap-2">
              {currentFolder && (
                <Button 
                  onClick={() => setIsNewFolderModalOpen(true)}
                  variant="outline"
                  className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white cursor-pointer flex items-center gap-1"
                >
                  <FolderPlus className="h-4 w-4" />
                  New Subfolder
                </Button>
              )}
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              >
                Transcribe
              </Button>
            </div>
          </div>

          {/* Files table */}
          <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-6">
                    <input 
                      type="checkbox" 
                      className="rounded bg-[#2a2a2a] border-none" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Uploaded</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Mode</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {uploads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      {currentFolder 
                        ? "No files in this folder. Upload files or move existing files here."
                        : "No files yet. Click \"Transcribe\" to upload your first file."}
                    </td>
                  </tr>
                ) : (
                  uploads.map((upload) => (
                    <tr key={upload.id} className={`border-b border-[#2a2a2a] hover:bg-[#2a2a2a] ${selectedUploads.includes(upload.id) ? 'bg-[#2a2a2a]' : ''}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          className="rounded bg-[#2a2a2a] border-none" 
                          checked={selectedUploads.includes(upload.id)}
                          onChange={() => handleSelectUpload(upload.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/transcript/${upload.id}`} className="text-white hover:underline">
                          {upload.file_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {formatDate(upload.created_at)}, {formatTime(upload.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {Math.floor(upload.duration_seconds / 60)}m {upload.duration_seconds % 60}s
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FileAudio className="h-5 w-5 text-blue-400 mr-2" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-500 text-sm">Completed</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a2a2a]">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg py-1 px-0 min-w-[160px]">
                            <DropdownMenuItem 
                              className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
                              onClick={() => {
                                setSelectedUploadId(upload.id);
                                setShowMoveDialog(true);
                              }}
                            >
                              <FolderUp className="h-4 w-4 mr-2" />
                              Move to Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />
                            <DropdownMenuItem 
                              className="text-red-500 hover:text-white hover:bg-red-600 cursor-pointer focus:bg-red-600 focus:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center"
                              disabled={isDeleting[upload.id]}
                              onClick={() => handleDeleteUpload(upload.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isDeleting[upload.id] ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedUploads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg py-3 px-4 flex items-center gap-4 z-50">
          <div className="text-sm font-medium">
            {selectedUploads.length} item{selectedUploads.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#3a3a3a] hover:bg-[#2a2a2a] flex items-center gap-1"
              onClick={() => {
                setSelectedUploadId(null);
                setShowMoveDialog(true);
              }}
              disabled={isBulkMoving}
            >
              <FolderUp className="h-4 w-4" />
              {isBulkMoving ? 'Moving...' : 'Move'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#3a3a3a] hover:bg-red-600 hover:text-white text-red-500 flex items-center gap-1"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isBulkDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        user={user}
        userProfile={userProfile}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={currentFolder?.id || null}
      />

      {/* New Folder Modal */}
      <Dialog open={isNewFolderModalOpen} onOpenChange={setIsNewFolderModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentFolder 
                ? `Create a new subfolder inside "${currentFolder.name}"` 
                : 'Create a new folder in the root directory'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-[#2a2a2a] border-[#3a3a3a]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewFolderModalOpen(false)}
              className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} className="cursor-pointer">
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUploads.length > 0 
                ? `Select a folder to move ${selectedUploads.length} file(s) to`
                : 'Select a folder to move this upload to'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
              onClick={() => {
                if (selectedUploads.length > 0) {
                  handleBulkMove(null);
                } else if (selectedUploadId) {
                  handleMoveUpload(selectedUploadId, null);
                }
              }}
              disabled={(selectedUploads.length === 0 && !selectedUploadId) || 
                (selectedUploadId ? isMoving[selectedUploadId] : false) || 
                isBulkMoving}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Root Folder
            </Button>
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                onClick={() => {
                  if (selectedUploads.length > 0) {
                    handleBulkMove(folder.id);
                  } else if (selectedUploadId) {
                    handleMoveUpload(selectedUploadId, folder.id);
                  }
                }}
                disabled={(selectedUploads.length === 0 && !selectedUploadId) || 
                  (selectedUploadId ? isMoving[selectedUploadId] : false) || 
                  isBulkMoving}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                {folder.name}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMoveDialog(false)}
              className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedUploads.length} file(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
