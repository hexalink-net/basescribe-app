import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../../DashboardClient';
import { fetchFolderData } from '../actions';
import { UserProfile } from '@/types/DashboardInterface';

type tParams = Promise<{ id: string }>;

export default async function FolderPage({ params }: { params:  tParams })  {
  // Get server-side Supabase client
  const { id } = await params;
  const supabase = await createClient();
  
  // Get the user session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }
  
  // Fetch all folder data in parallel using server action
  const { folder, uploads, userProfile, folders, error } = await fetchFolderData(id);
  
  // Handle any errors from data fetching
  if (error) {
    throw new Error(error);
  }
  
  if (!folder) {
    throw new Error('Folder not found or you do not have permission to view it');
  }
  
  return (
    <DashboardClient 
      user={user} 
      userProfile={userProfile as UserProfile}
      uploads={uploads || []}
      folders={folders || []}
      currentFolder={folder}
    />
  );
}
