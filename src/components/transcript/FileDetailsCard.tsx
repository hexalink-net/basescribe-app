"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileIcon, Download } from 'lucide-react';
import { UploadDetail } from '@/types/DashboardInterface';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface FileDetailsCardProps {
  upload: UploadDetail;
}

export function FileDetailsCard({ upload }: FileDetailsCardProps) {
  const downloadTranscript = (format: string) => {
    if (!upload || !upload.transcript_text) return;
    
    let content = upload.transcript_text;
    let mimeType = 'text/plain';
    let extension = 'txt';
    
    // Handle different formats
    if (format === 'docx') {
      // In a real implementation, you would convert to DOCX format
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    } else if (format === 'pdf') {
      // In a real implementation, you would convert to PDF format
      mimeType = 'application/pdf';
      extension = 'pdf';
    } else if (format === 'srt') {
      // In a real implementation, you would convert to SRT format
      if (upload.transcript_json) {
        content = upload.transcript_json.map((segment: TranscriptSegment, index: number) => {
          const startTime = formatSrtTime(segment.start);
          const endTime = formatSrtTime(segment.end);
          return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
        }).join('');
      }
      mimeType = 'text/plain';
      extension = 'srt';
    }
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `${upload.file_name.split('.')[0]}_transcript.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const formatSrtTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-2">
        {/* PDF Download */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => downloadTranscript('pdf')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Download PDF</span>
            </div>
          </div>
        </Button>
        
        {/* DOCX Download */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => downloadTranscript('docx')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Download DOCX</span>
            </div>
          </div>
        </Button>
        
        {/* TXT Download */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => downloadTranscript('txt')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Download TXT</span>
            </div>
          </div>
        </Button>
        
        {/* SRT Download */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => downloadTranscript('srt')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Download SRT</span>
            </div>
          </div>
        </Button>
        
        {/* Advanced Export */}
        <Button 
          variant="ghost" 
          className="cursor-pointer w-full justify-start text-sm font-normal hover:bg-[#3a3a3a]/50 h-auto py-2 px-2"
          onClick={() => alert('Advanced export options would open here')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Advanced Export</span>
              <span className="text-xs text-gray-400 leading-tight text-wrap text-left">Export with timestamps and in more formats</span>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
