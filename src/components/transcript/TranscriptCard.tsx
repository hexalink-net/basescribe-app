"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDetail } from '@/types/DashboardInterface';

interface TranscriptCardProps {
  upload: UploadDetail;
  formatDate: (dateString: string) => string;
}

export function TranscriptCard({ upload, formatDate }: TranscriptCardProps) {
  return (
    <Card className="mb-6 bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{upload.file_name}</span>
        </CardTitle>
        <CardDescription>
          {formatDate(upload.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upload.transcript_text ? (
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md max-h-[500px] overflow-y-auto">
            {upload.transcript_text}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {upload.status === 'processing' ? (
              <div>
                <p className="text-lg mb-2">Transcription in progress...</p>
                <p className="text-sm">This may take a few minutes depending on the file size.</p>
              </div>
            ) : upload.status === 'error' ? (
              <div>
                <p className="text-lg mb-2">Transcription failed</p>
                <p className="text-sm">There was an error processing this file. Please try uploading it again.</p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-2">No transcript available</p>
                <p className="text-sm">This file hasn&apos;t been transcribed yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
