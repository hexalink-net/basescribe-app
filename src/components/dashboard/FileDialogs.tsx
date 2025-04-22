"use client";

import { Upload, Folder } from '@/types/DashboardInterface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Input } from '@/components/ui/input';
import { FolderIcon } from 'lucide-react';

interface FileDialogsProps {
  // Move Upload Dialog
  showMoveDialog: boolean;
  setShowMoveDialog: (open: boolean) => void;
  selectedUploadId: string | null;
  selectedUploads: string[];
  isMoving: Record<string, boolean>;
  isBulkMoving: boolean;
  handleMoveUpload: (uploadId: string, folderId: string | null) => void;
  handleBulkMove: (folderId: string | null) => void;
  folders: Folder[];
  
  // Rename Upload Dialog
  isRenameUploadModalOpen: boolean;
  setIsRenameUploadModalOpen: (open: boolean) => void;
  uploadToRename: Upload | null;
  newUploadName: string;
  setNewUploadName: (name: string) => void;
  handleRenameUpload: () => void;
  
  // Bulk Delete Dialog
  showBulkDeleteDialog: boolean;
  setShowBulkDeleteDialog: (open: boolean) => void;
  isBulkDeleting: boolean;
  handleBulkDelete: () => void;
  selectedUploadsCount: number;
}

export default function FileDialogs({
  // Move Upload Dialog
  showMoveDialog,
  setShowMoveDialog,
  selectedUploadId,
  selectedUploads,
  isMoving,
  isBulkMoving,
  handleMoveUpload,
  handleBulkMove,
  folders,
  
  // Rename Upload Dialog
  isRenameUploadModalOpen,
  setIsRenameUploadModalOpen,
  uploadToRename,
  newUploadName,
  setNewUploadName,
  handleRenameUpload,
  
  // Bulk Delete Dialog
  showBulkDeleteDialog,
  setShowBulkDeleteDialog,
  isBulkDeleting,
  handleBulkDelete,
  selectedUploadsCount
}: FileDialogsProps) {
  return (
    <>
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
          <div className="my-4">
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
                Root Directory
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

      {/* Rename Upload Modal */}
      <Dialog open={isRenameUploadModalOpen} onOpenChange={setIsRenameUploadModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for &quot;{uploadToRename?.file_name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New file name"
              value={newUploadName}
              onChange={(e) => setNewUploadName(e.target.value)}
              className="bg-[#2a2a2a] border-[#3a3a3a]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameUploadModalOpen(false)}
              className="border-[#3a3a3a] hover:bg-[#2a2a2a] cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleRenameUpload} className="cursor-pointer">
              Rename File
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
              Are you sure you want to delete {selectedUploadsCount} file(s)? This action cannot be undone.
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
    </>
  );
}
