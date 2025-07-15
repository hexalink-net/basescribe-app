"use client";

import React, { memo, useMemo } from 'react';
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

// Define interfaces for each dialog component
interface NewFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  handleCreate: () => void;
  currentFolder: Folder | null;
}

interface RenameFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
  newName: string;
  setNewName: (name: string) => void;
  handleRename: () => void;
}

interface DeleteFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
  isDeleting: boolean;
  handleDelete: () => void;
}

interface MoveFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
  isMoving: boolean;
  handleMove: (destinationFolderId: string | null) => void;
  folders: Folder[];
  isDescendantOf: (folderId: string | undefined, ancestorId: string | undefined, foldersList: Folder[]) => boolean;
}

// Memoized New Folder Dialog Component
const NewFolderDialog = memo(({ isOpen, onOpenChange, folderName, setFolderName, handleCreate, currentFolder }: NewFolderDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="bg-[#2a2a2a] border-[#3a3a3a]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                document.getElementById('create-folder-button')?.click();
                onOpenChange(false)
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
          >
            Cancel
          </Button>
          <Button id="create-folder-button" onClick={handleCreate} className="cursor-pointer">
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

NewFolderDialog.displayName = 'NewFolderDialog';

// Memoized Rename Folder Dialog Component
const RenameFolderDialog = memo(({ isOpen, onOpenChange, folder, newName, setNewName, handleRename }: RenameFolderDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a new name for &quot;{folder?.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="New folder name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-[#2a2a2a] border-[#3a3a3a]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                document.getElementById('rename-folder-button')?.click();
                onOpenChange(false)
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
          >
            Cancel
          </Button>
          <Button id="rename-folder-button" onClick={handleRename} className="cursor-pointer">
            Rename Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

RenameFolderDialog.displayName = 'RenameFolderDialog';

// Memoized Delete Folder Dialog Component
const DeleteFolderDialog = memo(({ isOpen, onOpenChange, folder, isDeleting, handleDelete }: DeleteFolderDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete the folder &quot;{folder?.name}&quot;?
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
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

DeleteFolderDialog.displayName = 'DeleteFolderDialog';

// Memoized Move Folder Dialog Component
const MoveFolderDialog = memo(({ isOpen, onOpenChange, folder, isMoving, handleMove, folders, isDescendantOf }: MoveFolderDialogProps) => {
  // Memoize filtered folders to prevent recomputation on every render
  const filteredFolders = useMemo(() => {
    return folders.filter((f: Folder) => 
      f.id !== folder?.id && 
      !isDescendantOf(f.id, folder?.id, folders) &&
      f.parent_id === null
    );
  }, [folders, folder, isDescendantOf]);
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Move Folder</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a destination for &quot;{folder?.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <Button
              variant="outline"
              className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
              onClick={() => handleMove(null)}
              disabled={isMoving || folder?.parent_id === null}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Root Directory
              {folder?.parent_id === null && <span className="ml-2 text-xs text-gray-400">(Current)</span>}
            </Button>
            
            {filteredFolders.map((f: Folder) => (
              <Button
                key={f.id}
                variant="outline"
                className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                onClick={() => handleMove(f.id)}
                disabled={isMoving || f.id === folder?.parent_id}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                {f.name}
                {f.id === folder?.parent_id && <span className="ml-2 text-xs text-gray-400">(Current)</span>}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
            disabled={isMoving}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

MoveFolderDialog.displayName = 'MoveFolderDialog';

const FolderDialogs = memo(({
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
}: FolderDialogsProps) => {
  return (
    <>
      {/* Only render dialogs when they are open to reduce initial load time */}
      {isNewFolderModalOpen && (
        <NewFolderDialog
          isOpen={isNewFolderModalOpen}
          onOpenChange={setIsNewFolderModalOpen}
          folderName={newFolderName}
          setFolderName={setNewFolderName}
          handleCreate={handleCreateFolder}
          currentFolder={currentFolder}
        />
      )}

      {isRenameFolderModalOpen && (
        <RenameFolderDialog
          isOpen={isRenameFolderModalOpen}
          onOpenChange={setIsRenameFolderModalOpen}
          folder={folderToRename}
          newName={newFolderRename}
          setNewName={setNewFolderRename}
          handleRename={handleRenameFolder}
        />
      )}

      {showDeleteFolderDialog && (
        <DeleteFolderDialog
          isOpen={showDeleteFolderDialog}
          onOpenChange={setShowDeleteFolderDialog}
          folder={folderToDelete}
          isDeleting={isDeletingFolder}
          handleDelete={handleDeleteFolder}
        />
      )}

      {showMoveFolderDialog && (
        <MoveFolderDialog
          isOpen={showMoveFolderDialog}
          onOpenChange={setShowMoveFolderDialog}
          folder={folderToMove}
          isMoving={isMovingFolder}
          handleMove={handleMoveFolder}
          folders={folders}
          isDescendantOf={isDescendantOf}
        />
      )}
    </>
  );
});

FolderDialogs.displayName = 'FolderDialogs';

export default FolderDialogs;
