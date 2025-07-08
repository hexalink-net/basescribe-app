"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { UploadDetail, TranscriptSegment } from '@/types/DashboardInterface';

type FileDetailsCardProps = {
  upload: UploadDetail;
  decryptedTranscript: Array<TranscriptSegment> | null;
};

export function FileDetailsCard({ upload, decryptedTranscript }: FileDetailsCardProps) {
  const downloadTranscript = (format: string) => {
    if (!upload || !upload.transcript_json || !decryptedTranscript) return;
    
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'txt') {
      // Group segments into chunks of 5
      const chunks: string[] = [];
      let currentChunk: string[] = [];

      decryptedTranscript.forEach((segment, index) => {
        currentChunk.push(segment.text.trim());
        
        // When we have 5 segments or it's the last segment
        if (currentChunk.length === 5 || index === decryptedTranscript.length - 1) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
        }
      });

      // Join chunks with newlines
      content = chunks.join('\r\n\n');
    } else if (format === 'txt-timestamps') {
      // Format each segment with its timestamp
      content = decryptedTranscript.map((segment) => {
        const startTime = formatSrtTime(segment.timestamp[0]).split(',')[0]; // Remove milliseconds
        const endTime = formatSrtTime(segment.timestamp[1]).split(',')[0]; // Remove milliseconds
        return `[${startTime} - ${endTime}] ${segment.text.trim()}`;
      }).join('\r\n');

      extension = 'txt'; // Keep extension as txt
    } else if (format === 'srt') {
      // Convert to standard SRT format with sequential numbering and timestamps
      content = decryptedTranscript.map((segment, index) => {
        const startTime = formatSrtTime(segment.timestamp[0]);
        const endTime = formatSrtTime(segment.timestamp[1]);
        // Format: Number + Timestamp range + Text + Double newline
        return `${index + 1}
              ${startTime} --> ${endTime}
              ${segment.text}

          `;
      }).join('');
      mimeType = 'text/plain';
      extension = 'srt';
    }
    
    const file = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(file);
    const element = document.createElement('a');
    element.href = url;
    element.download = `${upload.file_name.split('.')[0]}_transcript.${extension}`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    URL.revokeObjectURL(url); // Clean up the URL to prevent memory leaks
  };
  
  const formatSrtTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Card className="bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 text-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-2">
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
          onClick={() => downloadTranscript('txt-timestamps')}
        >
          <div className="flex items-start gap-2 pl-1 mt-1">
            <div className="flex items-center">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span>Advanced Export</span>
              <span className="text-xs text-gray-400 leading-tight text-wrap text-left">Download TXT with timestamps</span>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
