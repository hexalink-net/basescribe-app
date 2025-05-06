"use client";

import { useState, useEffect } from 'react';
import { UploadDetail } from '@/types/DashboardInterface';

// Import our new components
import { FileDetailsCard } from '@/components/transcript/FileDetailsCard';
import { TranscriptCard } from '@/components/transcript/TranscriptCard';
import { AudioPlayer } from '@/components/transcript/AudioPlayer';
import { EditTranscriptCard } from '@/components/transcript/EditTranscriptCard';

interface TranscriptClientProps {
  upload: UploadDetail | null;
  audioUrl: string;
}

export default function TranscriptClient({ upload, audioUrl }: TranscriptClientProps) {
  const [loading, setLoading] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  
  // Set loading to false once component is mounted and data is available
  useEffect(() => {
    if (upload) {
      setLoading(false);
    }
  }, [upload]);
  
  // Helper functions that we'll pass to child components
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr}, ${timeStr}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // const downloadTranscript = () => {
  //   if (!upload || !upload.transcript_text) return;
    
  //   const element = document.createElement('a');
  //   const file = new Blob([upload.transcript_text], { type: 'text/plain' });
  //   element.href = URL.createObjectURL(file);
  //   element.download = `${upload.file_name.split('.')[0]}_transcript.txt`;
  //   document.body.appendChild(element);
  //   element.click();
  //   document.body.removeChild(element);
  // };

  if (loading || !upload) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 pb-24">
      <div className="grid md:grid-cols-5 gap-6">
        <div>
          {/* File Details Card Component */}
          <FileDetailsCard 
            upload={upload}
          />
        </div>
        <div className="col-span-3">
          {/* Transcript Card Component */}
          <TranscriptCard 
            upload={upload} 
            formatDate={formatDate}
          />
        </div>
        <div>
          {/* File Details Card Component */}
          <EditTranscriptCard 
            upload={upload} 
            formatFileSize={formatFileSize}
            showTimestamps={showTimestamps}
            onShowTimestampsChange={setShowTimestamps}
          />
        </div>
      </div>

      {/* Audio Player Component */}
      {audioUrl && upload && (
        <AudioPlayer 
          audioUrl={audioUrl} 
          fileName={upload.file_name} 
        />
      )}
    </div>
  );
}