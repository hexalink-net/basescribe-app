import { createClient, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server';
import { Clock, Folder, FolderPlus } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserProfile } from '@/types/DashboardInterface';
import DashboardClient from './DashboardClient';

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
    
  // Ensure allUploads is always an array
  const uploads = allUploads || [];

  // Calculate storage usage
  const totalStorageBytes = uploads.reduce((total, upload) => total + (upload.file_size || 0), 0);
  const totalStorageMB = Math.round(totalStorageBytes / (1024 * 1024));
  const maxStorageMB = userProfile?.data?.plan_type === 'pro' ? 10 * 1024 : 15; // 10GB for pro, 15MB for free
  const storagePercentage = Math.min(100, Math.round((totalStorageMB / maxStorageMB) * 100));

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[192px] border-r border-[#2a2a2a] flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <h1 className="text-xl font-bold">BaseScribe</h1>
        </div>
        
        {/* Sidebar navigation */}
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a]">
              <Clock className="h-4 w-4" />
              <span>Recent Files</span>
            </Link>
          </div>
          
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">Folders</h2>
            <div className="space-y-1">
              <Link href="/dashboard/folder/1" className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a]">
                <Folder className="h-4 w-4" />
                <span>Folder 1</span>
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a]">
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Usage section */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">Usage</span>
            <span className="text-xs text-gray-400 ml-auto">
              {userProfile?.data?.plan_id === 'free' ? 'Free Plan' : 'Pro Plan'}
            </span>
          </div>
          <Progress 
            value={userProfile?.data?.plan_id === 'free' 
              ? Math.min(100, ((userProfile?.data?.total_usage_seconds || 0) / 30) * 100)
              : Math.min(100, ((userProfile?.data?.monthly_usage_seconds || 0) / 60 / 60) * 100)} 
            className="h-1 bg-[#2a2a2a]" 
            indicatorClassName="bg-[#3b82f6]" 
          />
          <div className="mt-1 text-xs text-gray-400">
            {userProfile?.data?.plan_id === 'free' 
              ? `${(userProfile?.data?.total_usage_seconds || 0) / 60} / 30 minutes total`
              : `${Math.round((userProfile?.data?.monthly_usage_seconds || 0)/ 60)} / 60 minutes monthly`}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-8 border-[#2a2a2a] hover:bg-[#2a2a2a]">
            Upgrade plan
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
          <h1 className="text-xl font-medium">Welcome to BaseScribe</h1>
          <UserMenu user={user} userInitials={userInitials} />
        </header>
        
        {/* Client component for the dashboard content and modal */}
        <DashboardClient 
          user={user} 
          userProfile={userProfile?.data as UserProfile} 
          uploads={uploads} 
        />
      </div>
    </div>
  );
}
