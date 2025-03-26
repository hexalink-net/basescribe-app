"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getUserById, getUserUploads, updateUserUsage, updateUploadStatus } from '@/lib/supabase/client';
import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clock, FileText, Upload, RefreshCw } from 'lucide-react';

// 100MB max file size for free users
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024;
// 500MB max file size for pro users
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [completedUploads, setCompletedUploads] = useState<any[]>([]);
  const [pendingUploads, setPendingUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Get user profile
          const { data: profileData, error: profileError } = await getUserById(user.id);
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
          } else {
            setUserProfile(profileData);
          }
          console.log(userProfile)
          
          // Get user uploads
          const { data: uploadsData, error: uploadsError } = await getUserUploads(user.id);
            
          if (uploadsError) {
            console.error('Error fetching uploads:', uploadsError);
          } else {
            const allUploads = uploadsData || [];
            setUploads(allUploads);
            
            // Separate uploads by status
            setCompletedUploads(allUploads.filter(upload => upload.status === 'completed'));
            setPendingUploads(allUploads.filter(upload => ['pending', 'processing'].includes(upload.status)));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time subscription for uploads table
    const uploadsSubscription = supabase
      .channel('uploads-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'uploads',
        filter: user ? `user_id=eq.${user.id}` : undefined
      }, (payload) => {
        // Refresh the uploads when there's a change
        if (user) {
          getUserUploads(user.id).then(({ data }) => {
            if (data) {
              setUploads(data);
              setCompletedUploads(data.filter(upload => upload.status === 'completed'));
              setPendingUploads(data.filter(upload => ['pending', 'processing'].includes(upload.status)));
            }
          });
        }
      })
      .subscribe();
    
    return () => {
      // Clean up subscription
      supabase.removeChannel(uploadsSubscription);
    };
  }, []);
  
  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user has reached their limit
      if (userProfile.plan_type === 'free' && userProfile.total_usage_minutes >= 30) {
        toast({
          title: "Usage limit reached",
          description: "You've reached your 30-minute free limit. Please upgrade to continue.",
          variant: "destructive",
        });
        return;
      }
      
      if (userProfile.plan_type === 'pro' && userProfile.monthly_usage_minutes >= 60) {
        toast({
          title: "Monthly limit reached",
          description: "You've reached your 60-minute monthly limit. Please wait until next month or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Create a record in the uploads table
      const { data: uploadRecord, error: recordError } = await supabase
        .from('uploads')
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            duration_minutes: 0, // This will be updated after processing
            status: 'pending'
          }
        ])
        .select();
        
      if (recordError) throw recordError;
      
      // Add the new upload to the list
      setUploads([uploadRecord[0], ...uploads]);
      
      // In a real app, you would now trigger the transcription process
      // For now, we'll simulate it with a status update after a delay
      setTimeout(async () => {
        const { error } = await supabase
          .from('uploads')
          .update({ status: 'processing' })
          .eq('id', uploadRecord[0].id);
          
        if (!error) {
          setUploads(uploads.map(upload => 
            upload.id === uploadRecord[0].id 
              ? { ...upload, status: 'processing' } 
              : upload
          ));
          
          // Simulate completion after another delay
          setTimeout(async () => {
            const { error } = await supabase
              .from('uploads')
              .update({ 
                status: 'completed',
                duration_minutes: 5 // Simulated duration
              })
              .eq('id', uploadRecord[0].id);
              
            if (!error) {
              // Update user's usage
              await supabase
                .from('users')
                .update({ 
                  total_usage_minutes: userProfile.total_usage_minutes + 5,
                  monthly_usage_minutes: userProfile.monthly_usage_minutes + 5
                })
                .eq('id', user.id);
                
              setUploads(uploads.map(upload => 
                upload.id === uploadRecord[0].id 
                  ? { ...upload, status: 'completed', duration_minutes: 5 } 
                  : upload
              ));
              
              setUserProfile({
                ...userProfile,
                total_usage_minutes: userProfile.total_usage_minutes + 5,
                monthly_usage_minutes: userProfile.monthly_usage_minutes + 5
              });
            }
          }, 5000);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive",
      });
    }
  };
  
  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {userProfile && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>
                {userProfile.plan_type === 'free' 
                  ? 'Free plan: 30 minutes total limit'
                  : 'Pro plan: 60 minutes per month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProfile.plan_type === 'free' ? (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Total usage: {userProfile.total_usage_minutes} / 30 minutes</span>
                      <span>{Math.round((userProfile.total_usage_minutes / 30) * 100)}%</span>
                    </div>
                    <Progress value={(userProfile.total_usage_minutes / 30) * 100} />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Monthly usage: {userProfile.monthly_usage_minutes} / 60 minutes</span>
                      <span>{Math.round((userProfile.monthly_usage_minutes / 60) * 100)}%</span>
                    </div>
                    <Progress value={(userProfile.monthly_usage_minutes / 60) * 100} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs defaultValue="upload">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="transcriptions">Transcriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload a File</CardTitle>
              <CardDescription>
                Upload an audio or video file to transcribe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onFileSelected={handleFileUpload} 
                maxSizeInBytes={userProfile?.plan_type === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transcriptions">
          <Card>
            <CardHeader>
              <CardTitle>Your Transcriptions</CardTitle>
              <CardDescription>
                View and manage your transcriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't uploaded any files yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{upload.file_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(upload.created_at)} • {upload.duration_minutes > 0 ? `${upload.duration_minutes} minutes` : 'Processing...'}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${getStatusColor(upload.status)}`}>
                          {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                        </div>
                      </div>
                      
                      {upload.status === 'completed' && (
                        <div className="mt-4 flex gap-2">
                          <Link 
                            href={`/dashboard/transcript/${upload.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Transcription
                          </Link>
                          <span className="text-muted-foreground">•</span>
                          <a 
                            href={getFileUrl(upload.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Download Original
                          </a>
                        </div>
                      )}
                      
                      {upload.status === 'processing' && (
                        <div className="mt-4">
                          <Progress value={50} />
                          <p className="text-xs text-muted-foreground mt-2">Processing your file...</p>
                        </div>
                      )}
                      
                      {upload.status === 'error' && (
                        <div className="mt-4">
                          <p className="text-xs text-red-500">
                            There was an error processing your file. Please try uploading again.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
