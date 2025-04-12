import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../../DashboardClient';
import { getFolders } from '../actions';
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
  
  // Get the folder details
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (folderError || !folder) {
    console.error('Error fetching folder:', folderError);
    throw new Error('Folder not found or you do not have permission to view it');
  }
  
  // Get uploads in this folder
  const { data: uploads, error: uploadsError } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', user.id)
    .eq('folder_id', id)
    .order('created_at', { ascending: false });
  
  if (uploadsError) {
    console.error('Error fetching uploads:', uploadsError);
    throw new Error('Failed to fetch uploads in this folder');
  }
  
  // Get user profile using the server-side function
  const userProfile = await getUserProfileSSR(supabase, user.id);
  
  if (!userProfile) {
    console.error('Error fetching user profile');
    throw new Error('Failed to fetch user profile');
  }
  
  // Get all folders for the sidebar
  const { data: folders } = await getFolders();
  
  return (
    <DashboardClient 
      user={user} 
      userProfile={userProfile?.data as UserProfile}
      uploads={uploads || []}
      folders={folders || []}
      currentFolder={folder}
    />
  );
}
