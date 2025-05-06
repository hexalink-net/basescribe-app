"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, FileAudio } from 'lucide-react';
import Link from 'next/link';
import { UploadDetail } from '@/types/DashboardInterface';

interface FileDetailsCardProps {
  upload: UploadDetail;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
}

export function FileDetailsCard({ upload, formatDate, formatFileSize }: FileDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileAudio className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">File Name</div>
              <div className="text-sm text-gray-400">{upload.file_name}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">Upload Date</div>
              <div className="text-sm text-gray-400">{formatDate(upload.created_at)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-sm text-gray-400">
                {upload.duration_seconds ? `${Math.floor(upload.duration_seconds / 60)}m ${Math.floor(upload.duration_seconds % 60)}s` : 'Unknown'}
              </div>
            </div>
          </div>
          {upload.file_size && (
            <div className="flex items-start gap-3">
              <FileAudio className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium">File Size</div>
                <div className="text-sm text-gray-400">{formatFileSize(upload.file_size)}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          variant="outline" 
          className="w-full bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a]" 
          asChild
        >
          <a 
            href={upload.file_path} 
            target="_blank" 
            rel="noopener noreferrer"
            download={upload.file_name}
          >
            Download Original File
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
