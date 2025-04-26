import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../../DashboardClient';
import { fetchFolderData } from '../actions';
import { UserProfile } from '@/types/DashboardInterface';
import { checkPageRateLimit } from '@/lib/upstash/ratelimit';
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
  
  // Apply page-level rate limiting instead of per-function rate limiting
  await checkPageRateLimit(user.id, `/dashboard/folder/${id}`);
  
  // Fetch all folder data in parallel using server action
  const { folder, uploads, userProfile, folders, error } = await fetchFolderData(user.id, id);
  
  // Handle any errors from data fetching
  if (error) {
    return <div>{error}</div>;
  }
  
  if (!folder) {
    return <div>Folder not found or you do not have permission to view it</div>;
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
