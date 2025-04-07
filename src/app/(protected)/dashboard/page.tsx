import { createClient, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server';
import { getFolders } from './folder/actions';
import { UserProfile } from '@/types/DashboardInterface';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

// Server component for the dashboard page
export default async function DashboardPage() {
  // Get user data from server-side Supabase client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to auth page instead of throwing error
  if (!user) {
    redirect('/auth');
    // The code below will never execute due to the redirect, but TypeScript needs this
    return null;
  }
  
  // Get user profile from database
  const userProfile = await getUserProfileSSR(supabase, user.id);
    
  // Get user's uploads
  const allUploads = await getAllUserUploadsSSR(supabase, user.id);
    
  // Ensure allUploads is always an array
  const uploads = allUploads || [];

  // Get all folders
  const { data: folders } = await getFolders();

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
