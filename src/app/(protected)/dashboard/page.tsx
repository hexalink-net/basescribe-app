import { createClient, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server';
import { getFolders } from './folder/actions';
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

  // Get all folders
  const { data: folders } = await getFolders();

  // Calculate storage usage
  const totalStorageBytes = uploads.reduce((total, upload) => total + (upload.file_size || 0), 0);
  const totalStorageMB = Math.round(totalStorageBytes / (1024 * 1024));
  const maxStorageMB = userProfile?.data?.plan_type === 'pro' ? 10 * 1024 : 15; // 10GB for pro, 15MB for free
  const storagePercentage = Math.min(100, Math.round((totalStorageMB / maxStorageMB) * 100));

  return (
    <DashboardClient 
      user={user} 
      userProfile={userProfile?.data as UserProfile} 
      uploads={uploads} 
      folders={folders || []}
      currentFolder={null}
    />
  );
}
