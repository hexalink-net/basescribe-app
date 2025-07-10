"use client";

import { Button } from '@/components/ui/button';
import { FolderUp, Trash2 } from 'lucide-react';

interface BulkActionsProps {
  selectedUploads: string[];
  isBulkDeleting: boolean;
  onShowMoveDialog: () => void;
  onShowDeleteDialog: () => void;
}

export default function BulkActions({
  selectedUploads,
  isBulkDeleting,
  onShowMoveDialog,
  onShowDeleteDialog
}: BulkActionsProps) {
  if (selectedUploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg py-3 px-4 flex items-center gap-4 z-50">
      <div className="text-sm font-medium text-white">
        {selectedUploads.length} item{selectedUploads.length !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-[#3a3a3a] hover:bg-[#2a2a2a] flex items-center gap-1 text-white"
          onClick={onShowMoveDialog}
        >
          <FolderUp className="h-4 w-4" />
          Move
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-red-500 hover:text-white hover:bg-red-600 flex items-center gap-1"
          onClick={onShowDeleteDialog}
          disabled={isBulkDeleting}
        >
          <Trash2 className="h-4 w-4" />
          {isBulkDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
