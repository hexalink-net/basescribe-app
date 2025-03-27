import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { formatFileSize } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { getAllUserUploadsSSR, getUserProfileSSR } from '@/lib/supabase/server';

interface UserProfile {
  id: string;
  email: string;
  plan_type: 'free' | 'pro';
  total_usage_minutes: number;
  monthly_usage_minutes: number;
  last_reset_date: string | null;
}

interface Upload {
  id: string;
  file_name: string;
  file_size: number;
  duration_minutes: number;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function DashboardContent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Max file size: 100MB for now (can be adjusted based on plan)
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          router.push('/auth');
          return;
        }

        // Get user profile
        const { data: profileData, error: profileError } = await getUserProfileSSR(supabase, userData.user.id);

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const newProfile = {
              id: userData.user.id,
              email: userData.user.email,
              plan_type: 'free',
              total_usage_minutes: 0,
              monthly_usage_minutes: 0,
            };

            const { error: insertError } = await supabase
              .from('users')
              .insert([newProfile]);

            if (insertError) throw insertError;
            
            setUserProfile(newProfile as UserProfile);
          } else {
            throw profileError;
          }
        } else {
          setUserProfile(profileData as UserProfile);
        }

        // Get user uploads
        const uploadsData = await getAllUserUploadsSSR(supabase, userData.user.id);
        if (!uploadsData) throw new Error('Failed to load user uploads');
        
        setUploads(uploadsData as Upload[]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, toast]);

  const handleFileUpload = async (file: File) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.push('/auth');
        return;
      }

      // Check if user has enough minutes left
      // For now, we'll use a placeholder duration calculation
      // In a real implementation, you would analyze the file to get its duration
      const estimatedDurationMinutes = Math.ceil(file.size / (1024 * 1024) / 2); // Rough estimate: 2MB per minute

      if (userProfile?.plan_type === 'free' && 
          (userProfile.total_usage_minutes + estimatedDurationMinutes) > 30) {
        toast({
          title: 'Usage limit exceeded',
          description: 'You have reached your free plan limit of 30 minutes. Please upgrade to continue.',
          variant: 'destructive',
        });
        return;
      }

      if (userProfile?.plan_type === 'pro' && 
          (userProfile.monthly_usage_minutes + estimatedDurationMinutes) > 60) {
        toast({
          title: 'Monthly limit exceeded',
          description: 'You have reached your monthly limit of 60 minutes. Your limit will reset next month.',
          variant: 'destructive',
        });
        return;
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `uploads/${userData.user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create record in uploads table
      const newUpload = {
        user_id: userData.user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        duration_minutes: estimatedDurationMinutes,
        status: 'pending',
      };

      const { data: uploadData, error: insertError } = await supabase
        .from('uploads')
        .insert([newUpload])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update user's usage minutes
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_usage_minutes: userProfile!.total_usage_minutes + estimatedDurationMinutes,
          monthly_usage_minutes: userProfile!.monthly_usage_minutes + estimatedDurationMinutes,
        })
        .eq('id', userData.user.id);

      if (updateError) throw updateError;

      // Update local state
      setUploads([uploadData as Upload, ...uploads]);
      setUserProfile({
        ...userProfile!,
        total_usage_minutes: userProfile!.total_usage_minutes + estimatedDurationMinutes,
        monthly_usage_minutes: userProfile!.monthly_usage_minutes + estimatedDurationMinutes,
      });

      // In a real implementation, you would trigger ASR processing here
      // For now, we'll just leave it in 'pending' status

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file',
        variant: 'destructive',
      });
      throw error; // Re-throw to be caught by the FileUpload component
    }
  };

  const getUsageLimit = () => {
    if (!userProfile) return 30;
    return userProfile.plan_type === 'free' ? 30 : 60;
  };

  const getUsageMinutes = () => {
    if (!userProfile) return 0;
    return userProfile.plan_type === 'free' 
      ? userProfile.total_usage_minutes 
      : userProfile.monthly_usage_minutes;
  };

  const getUsagePercentage = () => {
    const usage = getUsageMinutes();
    const limit = getUsageLimit();
    return Math.min(Math.round((usage / limit) * 100), 100);
  };

  const handleUpgradeClick = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              {userProfile?.plan_type === 'free'
                ? 'Lifetime usage (Free Plan)'
                : 'Monthly usage (Pro Plan)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={getUsagePercentage()} />
              <p className="text-sm text-muted-foreground">
                {getUsageMinutes()} minutes used out of {getUsageLimit()} {userProfile?.plan_type === 'free' ? 'lifetime' : 'monthly'} minutes
              </p>
              {userProfile?.plan_type === 'free' && (
                <Button onClick={handleUpgradeClick} className="w-full">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload New File</CardTitle>
            <CardDescription>
              Upload an audio or video file to transcribe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload 
              onFileSelected={handleFileUpload} 
              maxSizeInBytes={MAX_FILE_SIZE} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Recent Uploads</h2>
      
      {uploads.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium">No uploads yet</h3>
          <p className="text-muted-foreground mt-2">
            Upload your first file to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {uploads.map((upload) => (
            <Card key={upload.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{upload.file_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(upload.file_size)}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {upload.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      upload.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : upload.status === 'error' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                    </span>
                    {upload.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Transcript
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
