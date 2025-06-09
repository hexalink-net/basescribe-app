"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { UploadDetail } from '@/types/DashboardInterface';

interface DeleteDialogProps {
  isDeleteUploadModalOpen: boolean;
  setIsDeleteUploadModalOpen: (open: boolean) => void;
  isDeleting: boolean;
  uploadToDelete: UploadDetail | null;
  handleDeleteUpload: (upload: UploadDetail) => void;
}

export default function DeleteDialog({
  isDeleteUploadModalOpen,
  setIsDeleteUploadModalOpen,
  isDeleting,
  uploadToDelete,
  handleDeleteUpload,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={isDeleteUploadModalOpen} onOpenChange={setIsDeleteUploadModalOpen}>
      <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Upload</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete the upload &quot;{uploadToDelete?.file_name}&quot;?
            <br /><br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={async (event) => {
              event.preventDefault();
              if (uploadToDelete) {
                handleDeleteUpload(uploadToDelete);
              }
            }}
            className={`${isDeleting ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white cursor-pointer transition-colors`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
