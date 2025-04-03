"use client";

import { Folder } from '@/types/DashboardInterface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Input } from '@/components/ui/input';
import { FolderIcon } from 'lucide-react';

interface FolderDialogsProps {
  // New Folder Dialog
  isNewFolderModalOpen: boolean;
  setIsNewFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: () => void;
  currentFolder: Folder | null;
  
  // Rename Folder Dialog
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  folderToRename: Folder | null;
  newFolderRename: string;
  setNewFolderRename: (name: string) => void;
  handleRenameFolder: () => void;
  
  // Delete Folder Dialog
  showDeleteFolderDialog: boolean;
  setShowDeleteFolderDialog: (open: boolean) => void;
  folderToDelete: Folder | null;
  isDeletingFolder: boolean;
  handleDeleteFolder: () => void;
  
  // Move Folder Dialog
  showMoveFolderDialog: boolean;
  setShowMoveFolderDialog: (open: boolean) => void;
  folderToMove: Folder | null;
  isMovingFolder: boolean;
  handleMoveFolder: (destinationFolderId: string | null) => void;
  folders: Folder[];
  isDescendantOf: (folderId: string | undefined, ancestorId: string | undefined, foldersList: Folder[]) => boolean;
}

export default function FolderDialogs({
  // New Folder Dialog
  isNewFolderModalOpen,
  setIsNewFolderModalOpen,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  currentFolder,
  
  // Rename Folder Dialog
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  folderToRename,
  newFolderRename,
  setNewFolderRename,
  handleRenameFolder,
  
  // Delete Folder Dialog
  showDeleteFolderDialog,
  setShowDeleteFolderDialog,
  folderToDelete,
  isDeletingFolder,
  handleDeleteFolder,
  
  // Move Folder Dialog
  showMoveFolderDialog,
  setShowMoveFolderDialog,
  folderToMove,
  isMovingFolder,
  handleMoveFolder,
  folders,
  isDescendantOf
}: FolderDialogsProps) {
  return (
    <>
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

      {/* Rename Folder Modal */}
      <Dialog open={isRenameFolderModalOpen} onOpenChange={setIsRenameFolderModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for &quot;{folderToRename?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New folder name"
              value={newFolderRename}
              onChange={(e) => setNewFolderRename(e.target.value)}
              className="bg-[#2a2a2a] border-[#3a3a3a]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameFolderModalOpen(false)}
              className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleRenameFolder} className="cursor-pointer">
              Rename Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the folder &quot;{folderToDelete?.name}&quot;?
              <br /><br />
              Any files in this folder will be moved to the root directory.
              Any subfolders will also be moved to the root directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              disabled={isDeletingFolder}
            >
              {isDeletingFolder ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Folder Dialog */}
      <Dialog open={showMoveFolderDialog} onOpenChange={setShowMoveFolderDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Move Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a destination for &quot;{folderToMove?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
              onClick={() => handleMoveFolder(null)}
              disabled={isMovingFolder || folderToMove?.parent_id === null}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Root Directory
              {folderToMove?.parent_id === null && <span className="ml-2 text-xs text-gray-400">(Current)</span>}
            </Button>
            
            {folders
              .filter(folder => folder.id !== folderToMove?.id && !isDescendantOf(folder.id, folderToMove?.id, folders))
              .map(folder => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                  onClick={() => handleMoveFolder(folder.id)}
                  disabled={isMovingFolder || folder.id === folderToMove?.parent_id}
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {folder.name}
                  {folder.id === folderToMove?.parent_id && <span className="ml-2 text-xs text-gray-400">(Current)</span>}
                </Button>
              ))
            }
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMoveFolderDialog(false)}
              className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
              disabled={isMovingFolder}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
