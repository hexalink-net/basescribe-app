"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, FolderUp, Trash2 } from 'lucide-react';
import { UploadDetail } from '@/types/DashboardInterface';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface EditTranscriptCardProps {
  upload: UploadDetail;
  onShowTimestampsChange?: (show: boolean) => void;
  showTimestamps?: boolean;
  onRenameUpload?: (upload: UploadDetail) => void;
  onMoveUpload?: (uploadId: string) => void;
  onDeleteUpload?: (upload: UploadDetail) => void;
}

export function EditTranscriptCard({ upload, onShowTimestampsChange, showTimestamps: initialShowTimestamps = false, onRenameUpload, onMoveUpload, onDeleteUpload }: EditTranscriptCardProps) {
  const [showTimestamps, setShowTimestamps] = useState(initialShowTimestamps);
  
  const handleTimestampChange = (checked: boolean) => {
    setShowTimestamps(checked);
    if (onShowTimestampsChange) {
      onShowTimestampsChange(checked);
    }
  };

  const handleRenameFile = () => {
    if (onRenameUpload) {
      onRenameUpload(upload);
    }
  };

  const handleMoveFile = () => {
    if (onMoveUpload) {
      onMoveUpload(upload.id);
    }
  };

  const handleDeleteFile = () => {
    if (onDeleteUpload) {
      onDeleteUpload(upload);
    }
  };

  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 text-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-2">
        <div 
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#3a3a3a]/50 rounded-md w-full"
          onClick={() => handleTimestampChange(!showTimestamps)}
        >
          <Checkbox 
            id="show-timestamps" 
            checked={showTimestamps} 
            className="h-5 w-5"
          />
          <label 
            htmlFor="show-timestamps"
            className="text-sm cursor-pointer flex-grow"
          >
            Show Timestamps
          </label>
        </div>
        
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

export default EditTranscriptCard;
