"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { UploadDetail } from '@/types/DashboardInterface';

interface TranscriptCardProps {
  upload: UploadDetail;
  downloadTranscript: () => void;
}

export function TranscriptCard({ upload, downloadTranscript }: TranscriptCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Transcript</span>
          <Button size="sm" variant="outline" onClick={downloadTranscript}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </CardTitle>
        <CardDescription>
          {upload.file_name}
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
                <p className="text-sm">This file hasn't been transcribed yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
