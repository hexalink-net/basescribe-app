"use client";

import { useState, memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileAudio, MoreVertical, Trash2, FolderUp, Pencil } from 'lucide-react';
import { Upload, Folder } from '@/types/DashboardInterface';
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

// Memoized table header component for better LCP
const TableHeader = memo(({ selectAll, onSelectAll }: { selectAll: boolean, onSelectAll: () => void }) => (
  <thead>
    <tr className="border-b border-[#2a2a2a]">
      <th className="px-4 py-3 text-left font-medium text-sm text-gray-400 w-6">
        <input 
          type="checkbox" 
          className="rounded bg-[#2a2a2a] border-none" 
          checked={selectAll}
          onChange={onSelectAll}
          data-testid="select-all-checkbox"
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
));

// Memoized empty state component
const EmptyState = memo(({ currentFolder }: { currentFolder: Folder | null }) => (
  <tr>
    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
      {currentFolder 
        ? "No files in this folder. Upload files or move existing files here."
        : "No files yet. Click \"Transcribe\" to upload your first file."}
    </td>
  </tr>
));

// Memoized file row component to prevent unnecessary re-renders
const FileRow = memo(({ 
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

  return (
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
              onClick={() => onDeleteUpload(upload.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});

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
  // Memoize the table header to prevent unnecessary re-renders
  const tableHeader = useMemo(() => <TableHeader selectAll={selectAll} onSelectAll={onSelectAll} />, [selectAll, onSelectAll]);
  
  // Memoize the empty state component
  const emptyState = useMemo(() => 
    uploads.length === 0 ? <EmptyState currentFolder={currentFolder} /> : null
  , [uploads.length, currentFolder]);

  return (
    <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
      <table className="w-full">
        {tableHeader}
        <tbody>
          {emptyState || (
            uploads.map((upload) => (
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
    prevProps.selectAll === nextProps.selectAll
  );
});
