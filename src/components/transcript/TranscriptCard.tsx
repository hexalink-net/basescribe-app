"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDetail, TranscriptSegment } from '@/types/DashboardInterface';

interface TranscriptCardProps {
  upload: UploadDetail;
  formatDate: (dateString: string) => string;
  showTimestamps?: boolean;
  onSeek?: (time: number) => void;
  currentTime?: number;
  decryptedTranscript: Array<TranscriptSegment> | null;
  isDecrypting: boolean;
  decryptionError: string | null;
}

export function TranscriptCard({ upload, formatDate, showTimestamps = true, onSeek, currentTime = 0, decryptedTranscript, isDecrypting, decryptionError }: TranscriptCardProps) {

  // Format time from seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Group segments into paragraphs (max 200 characters per paragraph)
  const groupIntoParagraphs = (segments: { text: string; timestamp: [number, number] }[]) => {
    if (!segments) return [];
    const paragraphs: Array<Array<{ text: string; timestamp: [number, number] }>> = [];
    let currentParagraph: Array<{ text: string; timestamp: [number, number] }> = [];
    let currentCharCount = 0;

    segments.forEach((segment) => {
      const nextCharCount = currentCharCount + segment.text.length;

      if (currentParagraph.length > 0 && nextCharCount > 200) {
        paragraphs.push([...currentParagraph]);
        currentParagraph = [segment];
        currentCharCount = segment.text.length;
      } else {
        currentParagraph.push(segment);
        currentCharCount = nextCharCount;
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push([...currentParagraph]);
    }

    return paragraphs;
  };



  const renderContent = () => {
    if (!upload.transcript_json) {
      return (
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
      );
    }

    if (isDecrypting) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">Decrypting transcript...</p>
        </div>
      );
    }

    if (decryptionError) {
      return (
        <div className="text-center py-8 text-red-400">
          <p className="text-lg mb-2">{decryptionError}</p>
        </div>
      );
    }

    if (decryptedTranscript) {
      return (
        <div className="leading-relaxed bg-muted pr-4 rounded-md max-h-[500px] overflow-y-auto pb-18">
          <div>
            {groupIntoParagraphs(decryptedTranscript).map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-6">
                {paragraph.map((segment, sIndex) => (
                  <span key={`${pIndex}-${sIndex}`}>
                    {showTimestamps && sIndex === 0 && (
                      <span className="text-gray-400 text-xs">
                        ({formatTime(segment.timestamp[0])})
                      </span>
                    )}{' '}
                    <span
                      className={`cursor-pointer transition-colors ${currentTime >= segment.timestamp[0] && currentTime < segment.timestamp[1] ? 'text-blue-400' : 'text-gray-100 hover:text-blue-400'}`}
                      onClick={() => onSeek?.(segment.timestamp[0])}
                    >
                      {segment.text.trim()}
                    </span>{' '}
                    {showTimestamps && (
                      <span className="text-gray-400 text-xs">
                        ({formatTime(segment.timestamp[1])})
                      </span>
                    )}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      );
    }

    return null; // Should not be reached if logic is correct
  };

  return (
    <Card className="mb-6 bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{upload.file_name}</span>
        </CardTitle>
        <CardDescription>{formatDate(upload.created_at)}</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
