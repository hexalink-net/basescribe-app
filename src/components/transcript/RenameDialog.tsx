"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UploadDetail } from '@/types/DashboardInterface';

interface RenameDialogProps {
  isRenameUploadModalOpen: boolean;
  setIsRenameUploadModalOpen: (open: boolean) => void;
  uploadToRename: UploadDetail | null;
  newUploadName: string;
  setNewUploadName: (name: string) => void;
  handleRenameUpload: () => void;
}

export default function RenameDialog({
  isRenameUploadModalOpen,
  setIsRenameUploadModalOpen,
  uploadToRename,
  newUploadName,
  setNewUploadName,
  handleRenameUpload,
}: RenameDialogProps) {
  return (
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
  );
}
