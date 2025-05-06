"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, Pencil, Download, FileEdit, FolderUp, Trash2 } from 'lucide-react';
import { UploadDetail } from '@/types/DashboardInterface';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface EditTranscriptCardProps {
  upload: UploadDetail;
  formatFileSize: (bytes: number) => string;
  onShowTimestampsChange?: (show: boolean) => void;
  showTimestamps?: boolean;
}

export function EditTranscriptCard({ upload, formatFileSize, onShowTimestampsChange, showTimestamps: initialShowTimestamps = false }: EditTranscriptCardProps) {
  const [showTimestamps, setShowTimestamps] = useState(initialShowTimestamps);
  
  const handleTimestampChange = (checked: boolean) => {
    setShowTimestamps(checked);
    if (onShowTimestampsChange) {
      onShowTimestampsChange(checked);
    }
  };
  const handleDownloadAudio = () => {
    if (upload.file_path) {
      const link = document.createElement('a');
      link.href = upload.file_path;
      link.download = upload.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareTranscript = () => {
    alert('Share transcript functionality would be implemented here');
  };

  const handleEditTranscript = () => {
    alert('Edit transcript functionality would be implemented here');
  };

  const handleRenameFile = () => {
    alert('Rename file functionality would be implemented here');
  };

  const handleMoveFile = () => {
    alert('Move file functionality would be implemented here');
  };

  const handleDeleteFile = () => {
    alert('Delete file functionality would be implemented here');
  };

  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-2">
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => handleTimestampChange(!showTimestamps)}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Checkbox 
                id="show-timestamps" 
                checked={showTimestamps} 
                className="h-5 w-5"
              />
            </div>
            <div className="flex flex-col items-start">
              <span>Show Timestamps</span>
            </div>
          </div>
        </Button>
        {/* Share Transcript */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={handleShareTranscript}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Share Transcript</span>
            </div>
          </div>
        </Button>
        
        {/* Edit Transcript */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={handleEditTranscript}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Pencil className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Edit Transcript</span>
            </div>
          </div>
        </Button>
        
        {/* Download Audio */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={handleDownloadAudio}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Download Audio</span>
              <span className="text-xs text-gray-400">{formatFileSize(upload.file_size)}</span>
            </div>
          </div>
        </Button>
        
        {/* Rename File */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={handleRenameFile}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FileEdit className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Rename File</span>
            </div>
          </div>
        </Button>
        
        {/* Move */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={handleMoveFile}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FolderUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Move</span>
            </div>
          </div>
        </Button>
        
        {/* Delete File */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2 text-red-400 hover:text-red-300"
          onClick={handleDeleteFile}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Delete File</span>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
