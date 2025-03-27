import Link from 'next/link';
import { createClient, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Clock, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { UserMenu } from '@/components/UserMenu';

// Import the client-side UploadSection component
import UploadSection from '@/components/dashboard/UploadSection';

// Type definitions
interface Upload {
  id: string;
  created_at: string;
  file_name: string;
  file_size: number;
  file_path: string;
  duration_minutes: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: string;
}

interface UserProfile {
  id: string;
  email?: string;
  plan_type: 'free' | 'pro';
  total_usage_minutes: number;
  monthly_usage_minutes: number;
  subscription_tier?: string;
  usage_bytes?: number;
}

// Utility functions
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

// Server component for the dashboard page
export default async function DashboardPage() {
  // Get user data from server-side Supabase client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const userInitials = !user || !user.email ? '?' : user.email.charAt(0).toUpperCase();
  
  // Get user profile from database
  const userProfile = await getUserProfileSSR(supabase, user.id);
    
  // Get user's uploads
  const allUploads = await getAllUserUploadsSSR(supabase, user.id);
    
  // Separate uploads by status - ensure allUploads is always an array
  const uploads = allUploads || [];
  const completedUploads = uploads.filter((upload: Upload) => upload.status === 'completed');
  const pendingUploads = uploads.filter((upload: Upload) => 
    upload.status === 'processing' || upload.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <UserMenu user={user} userInitials={userInitials} />
      </header>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            Processing 
            {pendingUploads.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-white">
                {pendingUploads.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> 
            Completed 
            {completedUploads.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-white">
                {completedUploads.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          {/* Client component for uploads */}
          <UploadSection 
            user={user} 
            userProfile={userProfile as UserProfile} 
          />
        </TabsContent>
        
        <TabsContent value="processing" className="space-y-4">
          {pendingUploads.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No processing files</CardTitle>
                <CardDescription>
                  When you upload files, they'll appear here while they're being processed.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUploads.map((upload: Upload) => (
                <Card key={upload.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{upload.file_name}</CardTitle>
                    <CardDescription>
                      {new Date(upload.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Status: {upload.status}</span>
                      <span>{Math.round(upload.file_size / 1024 / 1024 * 10) / 10} MB</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedUploads.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No completed files</CardTitle>
                <CardDescription>
                  Your processed files will appear here once they're ready.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedUploads.map((upload: Upload) => (
                <Card key={upload.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate">{upload.file_name}</CardTitle>
                    <CardDescription>
                      {new Date(upload.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{upload.duration_minutes} minutes</span>
                      <span>{Math.round(upload.file_size / 1024 / 1024 * 10) / 10} MB</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link 
                      href={`/transcription/${upload.id}`}
                      className="w-full text-center py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      View Transcription
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
    </div>
  );
}
