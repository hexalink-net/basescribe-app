import { createClient, getUserProfileSSR, getAllUserUploadsSSR } from '@/lib/supabase/server';
import { getFolders } from './folder/actions';
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
