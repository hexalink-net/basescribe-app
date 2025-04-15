"use client";

import { useState, memo, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
// Lazy load icons to improve initial load performance
const CheckCircle2 = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle2), { ssr: false, loading: () => <div className="h-4 w-4 bg-green-500/20 rounded-full animate-pulse" /> });
const FileAudio = dynamic(() => import('lucide-react').then(mod => mod.FileAudio), { ssr: false, loading: () => <div className="h-5 w-5 bg-blue-400/20 rounded animate-pulse" /> });
const MoreVertical = dynamic(() => import('lucide-react').then(mod => mod.MoreVertical), { ssr: false });
const Trash2 = dynamic(() => import('lucide-react').then(mod => mod.Trash2), { ssr: false });
const FolderUp = dynamic(() => import('lucide-react').then(mod => mod.FolderUp), { ssr: false });
const Pencil = dynamic(() => import('lucide-react').then(mod => mod.Pencil), { ssr: false });
import { Upload, Folder } from '@/types/DashboardInterface';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface FileTableProps {
  uploads: Upload[];
  currentFolder: Folder | null;
  selectedUploads: string[];
  isDeleting: Record<string, boolean>;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onSelectAll: () => void;
  onSelectUpload: (uploadId: string) => void;
  onDeleteUpload: (uploadId: string) => void;
  onMoveUpload: (uploadId: string) => void;
  onRenameUpload: (upload: Upload) => void;
  selectAll: boolean;
}

// Delete Upload Dialog Props
interface DeleteUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  upload: Upload | null;
  isDeleting: boolean;
  handleDelete: () => void;
}

// Memoized Delete Upload Dialog Component
const DeleteUploadDialog = memo(({ isOpen, onOpenChange, upload, isDeleting, handleDelete }: DeleteUploadDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Upload</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete the upload &quot;{upload?.file_name}&quot;?
            <br /><br />
            This action cannot be undone.
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

DeleteUploadDialog.displayName = 'DeleteUploadDialog';

// Empty state component is now directly used in the table

// Memoized empty state component
export const EmptyState = memo(({ currentFolder }: { currentFolder: Folder | null }) => (
  <tr>
    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
      {currentFolder 
        ? "No files in this folder. Upload files or move existing files here."
        : "No files yet. Click \"Transcribe\" to upload your first file."}
    </td>
  </tr>
));

EmptyState.displayName = 'EmptyState';

// Memoized file row component to prevent unnecessary re-renders
export const FileRow = memo(({ 
  upload, 
  isSelected, 
  isDeleting,
  formatDate,
  formatTime,
  onSelectUpload,
  onDeleteUpload,
  onMoveUpload,
  onRenameUpload
}: { 
  upload: Upload, 
  isSelected: boolean,
  isDeleting: boolean,
  formatDate: (dateString: string) => string,
  formatTime: (dateString: string) => string,
  onSelectUpload: (uploadId: string) => void,
  onDeleteUpload: (uploadId: string) => void,
  onMoveUpload: (uploadId: string) => void,
  onRenameUpload: (upload: Upload) => void
}) => {
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Memoize the duration calculation to avoid recalculating on every render
  const duration = useMemo(() => {
    const minutes = Math.floor(upload.duration_seconds / 60);
    const seconds = upload.duration_seconds % 60;
    return `${minutes}m ${seconds}s`;
  }, [upload.duration_seconds]);

  // Memoize the formatted date/time to avoid recalculating on every render
  const formattedDateTime = useMemo(() => {
    return `${formatDate(upload.created_at)}, ${formatTime(upload.created_at)}`;
  }, [upload.created_at, formatDate, formatTime]);

  // Create the row element
  const rowElement = (
    <tr className={`border-b border-[#2a2a2a] hover:bg-[#2a2a2a] ${isSelected ? 'bg-[#2a2a2a]' : ''}`}>
      <td className="px-4 py-3">
        <input 
          type="checkbox" 
          className="rounded bg-[#2a2a2a] border-none" 
          checked={isSelected}
          onChange={() => onSelectUpload(upload.id)}
        />
      </td>
      <td className="px-4 py-3">
        <Link href={`/dashboard/transcript/${upload.id}`} className="text-white hover:underline">
          {upload.file_name}
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-400 text-sm">
        {formattedDateTime}
      </td>
      <td className="px-4 py-3 text-gray-400 text-sm">
        {duration}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="h-5 w-5 text-blue-400 mr-2 flex items-center justify-center">
            <FileAudio className="h-4 w-4" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="h-4 w-4 text-green-500 mr-1 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3" />
          </div>
          <span className="text-green-500 text-sm">Completed</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a2a2a] cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg py-1 px-0 min-w-[160px]">
            <DropdownMenuItem 
              className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
              onClick={() => onRenameUpload(upload)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-[#2a2a2a] cursor-pointer px-3 py-2 text-sm font-medium transition-colors flex items-center"
              onClick={() => onMoveUpload(upload.id)}
            >
              <FolderUp className="h-4 w-4 mr-2" />
              Move to Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />
            <DropdownMenuItem 
              className="text-red-500 hover:text-white hover:bg-red-600 cursor-pointer focus:bg-red-600 focus:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center"
              disabled={isDeleting}
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );

  return (
    <>
      {rowElement}
      
      {/* Delete Upload Confirmation Dialog */}
      <DeleteUploadDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        upload={upload}
        isDeleting={isDeleting}
        handleDelete={() => {
          onDeleteUpload(upload.id);
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
});

FileRow.displayName = 'FileRow';

// Optimized skeleton loader component for table with memoization to prevent re-renders
const SkeletonTable = memo(() => {
  // Pre-generate skeleton rows to avoid map operation during render
  const skeletonRows = useMemo(() => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="border-b border-[#2a2a2a] py-4 px-4 flex items-center">
        <div className="w-[20px] h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/4 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/5 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a] rounded"></div>
      </div>
    ));
  }, []);
  
  return (
    <div className="animate-pulse" style={{ contentVisibility: 'auto' }}>
      {/* Skeleton header with lower opacity to reduce paint complexity */}
      <div className="border-b border-[#2a2a2a] py-3 px-4 flex">
        <div className="w-[20px] h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/4 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/5 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded mr-4"></div>
        <div className="w-1/6 h-5 bg-[#2a2a2a]/80 rounded"></div>
      </div>
      
      {/* Render pre-generated skeleton rows */}
      {skeletonRows}
    </div>
  );
});

SkeletonTable.displayName = 'SkeletonTable';

// Main FileTable component with memoization
const FileTable = ({
  uploads,
  currentFolder,
  selectedUploads,
  isDeleting,
  formatDate,
  formatTime,
  onSelectAll,
  onSelectUpload,
  onDeleteUpload,
  onMoveUpload,
  onRenameUpload,
  selectAll
}: FileTableProps) => {
  // Add loading state for progressive rendering to improve LCP
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading to false after initial render with a short delay
  // Using requestIdleCallback for better performance when browser is idle
  useEffect(() => {
    const loadContent = () => setIsLoading(false);
    
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(loadContent, { timeout: 200 });
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadContent, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  // Ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // State for client-side rendering to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10; // Show 10 files per page
  const totalPages = Math.ceil(uploads.length / itemsPerPage);
  
  // Get paginated uploads
  const paginatedUploads = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return uploads.slice(startIndex, startIndex + itemsPerPage);
  }, [uploads, page, itemsPerPage]);
  
  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Reset pagination when folder changes or uploads change
  useEffect(() => {
    setPage(1);
  }, [currentFolder, uploads.length]);
  
  // Handle pagination
  const handlePreviousPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);
  
  const handleNextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  
  // Memoize the empty state component
  const emptyState = useMemo(() => 
    uploads.length === 0 ? <EmptyState currentFolder={currentFolder} /> : null
  , [uploads.length, currentFolder]);

  return (
    <div className="bg-[#1a1a1a] rounded-md overflow-hidden flex flex-col">
      {isLoading ? (
        <SkeletonTable />
      ) : (
        <>
          <div className="w-full flex flex-col">
            {/* Table with sticky header */}
            <div 
              ref={tableContainerRef}
              className={`overflow-y-auto ${isMounted ? 'max-h-[calc(100vh-220px)]' : 'max-h-[600px]'}`}
            >
          <table className="w-full table-fixed border-collapse">
            {/* Apply sticky positioning to the thead */}
            <thead className="sticky top-0 bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[50px]">
                  <input 
                    type="checkbox" 
                    className="rounded bg-[#2a2a2a] border-none" 
                    checked={selectAll}
                    onChange={onSelectAll}
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[30%]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[20%]">Uploaded</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[10%]">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[15%]">Mode</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[15%]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {emptyState || (
                paginatedUploads.map((upload) => (
                  <FileRow 
                    key={upload.id}
                    upload={upload}
                    isSelected={selectedUploads.includes(upload.id)}
                    isDeleting={!!isDeleting[upload.id]}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    onSelectUpload={onSelectUpload}
                    onDeleteUpload={onDeleteUpload}
                    onMoveUpload={onMoveUpload}
                    onRenameUpload={onRenameUpload}
                  />
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>
          
          {uploads.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a2a]">
              <div className="text-sm text-gray-400">
                Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, uploads.length)} of {uploads.length} uploads
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePreviousPage} 
                  disabled={page === 1}
                  className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white"
                >
                  Previous
                </Button>
                <div className="flex items-center px-3 text-sm text-gray-400">
                  Page {page} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="border-[#3a3a3a] hover:bg-[#2a2a2a] text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders of the entire table
export default memo(FileTable, (prevProps, nextProps) => {
  // Custom comparison function to determine if the component should re-render
  // Return true if props are equal (no re-render needed)
  return (
    prevProps.uploads === nextProps.uploads &&
    prevProps.selectedUploads === nextProps.selectedUploads &&
    prevProps.currentFolder === nextProps.currentFolder &&
    prevProps.selectAll === nextProps.selectAll &&
    JSON.stringify(prevProps.isDeleting) === JSON.stringify(nextProps.isDeleting)
  );
});
