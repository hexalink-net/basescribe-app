"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { updateUserUsage, updateUploadStatus } from '@/lib/supabase/client';
import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/UseToast';
import { Upload } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// 100MB max file size for free users
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024;
// 500MB max file size for pro users
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024;

interface UploadSectionProps {
  user: User;
  userProfile: {
    id: string;
    email?: string;
    plan_type?: string;
    subscription_tier?: string;
    usage_bytes?: number;
    total_usage_minutes?: number;
    monthly_usage_minutes?: number;
  } | null;
}

export default function UploadSection({ user, userProfile }: UploadSectionProps) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user can upload based on their subscription tier
    const maxFileSize = userProfile?.subscription_tier === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
    
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxFileSize / (1024 * 1024)}MB for your subscription tier.`,
        variant: "destructive",
      });
      return;
    }

    // Create a new upload record
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    const timestamp = new Date().toISOString();
    
    try {
      setLoading(true);
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(`${user.id}/${timestamp}-${fileName}`, file);
        
      if (uploadError) throw uploadError;
      
      // Update user usage
      await updateUserUsage(user.id, fileSize, 0);
      
      // Create upload record in database
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          status: 'processing',
          storage_path: uploadData.path,
        })
        .select();
        
      if (error) throw error;
      
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
          await updateUploadStatus(data[0].id, 'completed');
          
          // Update the uploads list
          setUploads((prev) => 
            prev.map((upload) => 
              upload.id === data[0].id 
                ? { ...upload, status: 'completed' } 
                : upload
            )
          );
        }
      }, 5000);
      
    } catch (error: any) {
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
            maxSizeInBytes={userProfile?.subscription_tier === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE}
          />
          
          {userProfile && typeof userProfile.usage_bytes === 'number' && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage usage</span>
                <span>
                  {Math.round(userProfile.usage_bytes / (1024 * 1024))}MB / 
                  {userProfile.subscription_tier === 'pro' ? '10GB' : '1GB'}
                </span>
              </div>
              <Progress 
                value={
                  (userProfile.usage_bytes / 
                  (userProfile.subscription_tier === 'pro' ? 10 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024)) * 100
                } 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
