"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FolderIcon } from 'lucide-react';
import { Folder } from '@/types/DashboardInterface';

interface MoveDialogProps {
  showMoveDialog: boolean;
  setShowMoveDialog: (open: boolean) => void;
  selectedUploadId: string | null;
  isMoving: Record<string, boolean>;
  handleMoveUpload: (uploadId: string, folderId: string | null) => void;
  folders: Folder[];
}

export default function MoveDialog({
    showMoveDialog,
    setShowMoveDialog,
    selectedUploadId,
    isMoving,
    handleMoveUpload,
    folders,
}: MoveDialogProps) {
  return (
    <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a folder to move this upload to
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <Button
                variant="outline"
                className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                onClick={() => {
                  if (selectedUploadId) {
                    handleMoveUpload(selectedUploadId, null);
                  }
                }}
                disabled={(selectedUploadId ? isMoving[selectedUploadId] : false)}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                Root Directory
              </Button>
            </div>
          </div>
          {folders.map(folder => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="w-full justify-start border-[#3a3a3a] hover:bg-[#2a2a2a]"
                  onClick={() => {
                    if (selectedUploadId) {
                      handleMoveUpload(selectedUploadId, folder.id);
                    }
                  }}
                  disabled={(selectedUploadId ? isMoving[selectedUploadId] : false)}
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {folder.name}
                </Button>
              ))}
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
  );
}
