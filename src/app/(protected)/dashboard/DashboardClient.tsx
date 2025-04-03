"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, UserProfile, Folder } from '@/types/DashboardInterface';
import UploadModal from '@/components/dashboard/UploadModal';
import { CheckCircle2, FileAudio, MoreVertical, Trash2, FolderIcon, FolderPlus, ArrowLeft, FolderUp } from 'lucide-react';
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
import { deleteUpload } from './actions';
import { createFolder, moveUploadToFolder } from './folder/actions';
import { useToast } from '@/components/ui/UseToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

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

  const handleDeleteUpload = async (uploadId: string) => {
    // Set deleting state for this upload
    setIsDeleting(prev => ({ ...prev, [uploadId]: true }));
    
    try {
      const result = await deleteUpload(uploadId, user.id);
      
      if (result.success) {
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
                className="h-6 w-6 p-0" 
                onClick={() => setIsNewFolderModalOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Link href="/dashboard" className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${!currentFolder ? 'bg-[#2a2a2a]' : ''}`}>
                <FolderIcon className="h-4 w-4" />
                <span>All Files</span>
              </Link>
              {folders.map(folder => (
                <Link 
                  key={folder.id} 
                  href={`/dashboard/folder/${folder.id}`} 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] ${currentFolder?.id === folder.id ? 'bg-[#2a2a2a]' : ''}`}
                >
                  <FolderIcon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </Link>
              ))}
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
                ? Math.min(100, ((userProfile?.total_usage_seconds || 0) / 30 / 60) * 100)
                : Math.min(100, ((userProfile?.monthly_usage_seconds || 0) / 60 / 60) * 100)} 
              className="h-1 bg-[#2a2a2a]" 
            />
            <div className="text-xs text-gray-400 mt-1">
              {userProfile?.plan_id === 'free' 
                ? `${Math.round((userProfile?.total_usage_seconds || 0) / 60)} / 30 minutes total`
                : `${Math.round((userProfile?.monthly_usage_seconds || 0) / 60)} / 60 minutes monthly`}
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
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Transcribe
            </Button>
          </div>

          {/* Files table */}
          <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-6">
                    <input type="checkbox" className="rounded bg-[#2a2a2a] border-none" />
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
                    <tr key={upload.id} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a]">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded bg-[#2a2a2a] border-none" />
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
              Enter a name for your new folder
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
              className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
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
              Select a folder to move this upload to
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
              onClick={() => selectedUploadId && handleMoveUpload(selectedUploadId, null)}
              disabled={!selectedUploadId || isMoving[selectedUploadId || '']}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Root Folder
            </Button>
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                onClick={() => selectedUploadId && handleMoveUpload(selectedUploadId, folder.id)}
                disabled={!selectedUploadId || isMoving[selectedUploadId || '']}
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
    </div>
  );
}
