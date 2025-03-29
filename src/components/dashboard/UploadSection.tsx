"use client";

import { useState } from 'react';
import { supabase, getUserById, updateUserUsage, updateUploadStatus } from '@/lib/supabase/client';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/UseToast';
import { Upload } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getMediaDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// 100MB max file size for free users
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024;
// 500MB max file size for pro users
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024;

interface UploadSectionProps {
  user: User;
  userProfile: {
    id: string;
    email?: string;
    plan_type?: 'free' | 'pro';
    usage_bytes?: number;
    total_usage_minutes?: number;
    monthly_usage_minutes?: number;
  } | null;
}

export default function UploadSection({ user, userProfile }: UploadSectionProps) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (file: File): Promise<void> => {
    console.log('UploadSection: handleFileUpload called with file:', file.name);
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user can upload based on their plan type
    const maxFileSize = userProfile?.plan_type === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
    
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxFileSize / (1024 * 1024)}MB for your plan type.`,
        variant: "destructive",
      });
      return;
    }

    // Create a new upload record
    const fileName = file.name;
    const fileSize = file.size;
    const timestamp = new Date().toISOString();
    const filePath = `${user.id}/${timestamp}-${fileName}`;
    
    try {
      setLoading(true);
      
      // Upload to storage
      console.log('Uploading to storage bucket: user-uploads');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded to storage successfully');
      
      // Calculate approximate duration in minutes (rough estimate based on file size)
      // Assuming average audio bitrate of 128 kbps
      let durationMinutes = await getMediaDuration(file);
      if (durationMinutes === null) {
        durationMinutes = Math.max(1, Math.round((fileSize / (128 * 1024 / 8 * 60)) / 60));
      }
      
      // Create upload record in database directly
      console.log('Creating database record');
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_path: filePath,
          file_size: fileSize,
          duration_minutes: durationMinutes,
          status: 'completed'
        })
        .select();
        
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Database record created successfully');

      const { data: userData} = await getUserById(user.id);
      
      // Update user usage with estimated duration
      await updateUserUsage(user.id, userData.total_usage_minutes + durationMinutes, userData.monthly_usage_minutes + durationMinutes);
      
      // Show success message
      toast({
        title: "File uploaded",
        description: "Your file is now being processed.",
      });
      
      // Add the new upload to the list
      if (data) {
        setUploads((prev) => [...prev, data[0]]);
      }
      
      // Simulate processing (in a real app this would be done by a background job)
      setTimeout(async () => {
        if (data) {
          await updateUploadStatus(data[0].id, 'completed', durationMinutes);
          
          // Update the uploads list
          setUploads((prev) => 
            prev.map((upload) => 
              upload.id === data[0].id 
                ? { ...upload, status: 'completed', duration_minutes: durationMinutes } 
                : upload
            )
          );
        }
      }, 5000);

      router.refresh();
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Audio
          </CardTitle>
          <CardDescription>
            Upload audio files to transcribe. Supported formats: MP3, WAV, M4A, FLAC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileSelected={handleFileUpload} 
            maxSizeInBytes={userProfile?.plan_type === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE}
          />
          
          {userProfile && typeof userProfile.usage_bytes === 'number' && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage usage</span>
                <span>
                  {Math.round(userProfile.usage_bytes / (1024 * 1024))}MB / 
                  {userProfile.plan_type === 'pro' ? '10GB' : '1GB'}
                </span>
              </div>
              <Progress 
                value={
                  (userProfile.usage_bytes / 
                  (userProfile.plan_type === 'pro' ? 10 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024)) * 100
                } 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
