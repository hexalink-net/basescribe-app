"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Download, Clock, Calendar } from 'lucide-react';

export default function TranscriptPage({ params }: { params: { id: string } }) {
  const [upload, setUpload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth');
          return;
        }
        
        // Get the upload details
        const { data, error } = await supabase
          .from('uploads')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching transcript:', error);
          toast({
            title: 'Error',
            description: 'Could not load the transcript. Please try again.',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }
        
        if (!data) {
          toast({
            title: 'Not found',
            description: 'The requested transcript could not be found.',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }
        
        setUpload(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTranscript();
  }, [params.id, router, toast]);
  
  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const downloadTranscript = () => {
    if (!upload || !upload.transcript_text) return;
    
    const element = document.createElement('a');
    const file = new Blob([upload.transcript_text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${upload.file_name.split('.')[0]}_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading transcript...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!upload) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Transcript Not Found</h2>
          <p className="mb-6">The transcript you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transcript available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {upload.transcript_json && (
            <Card>
              <CardHeader>
                <CardTitle>Timestamped Transcript</CardTitle>
                <CardDescription>
                  Transcript with timestamps for each segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {JSON.parse(upload.transcript_json).map((segment: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{formatTimestamp(segment.start)}</span>
                        <span>{formatTimestamp(segment.end)}</span>
                      </div>
                      <p>{segment.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Name</p>
                  <p>{upload.file_name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(upload.created_at)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{upload.duration_minutes} minutes</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Size</p>
                  <p>{formatFileSize(upload.file_size)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={getFileUrl(upload.file_path)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download Original File
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to format timestamps
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
