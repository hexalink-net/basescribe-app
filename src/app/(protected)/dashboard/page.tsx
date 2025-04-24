import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserProfile } from '@/types/DashboardInterface';
import { fetchDashboardData } from './actions';
import DashboardClient from './DashboardClient';

// Disable automatic revalidation
export const revalidate = false;

// Server component for the dashboard page
export default async function DashboardPage() {
  // Get user data from server-side Supabase client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to auth page instead of throwing error
  if (!user) {
    redirect('/auth');
  }
  
  // Fetch all dashboard data in parallel using server action
  const { userProfile, uploads, folders, error } = await fetchDashboardData(user.id);
  
  // Handle any errors from data fetching
  if (error) {
    console.error('Error loading dashboard data:', error);
  }

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
