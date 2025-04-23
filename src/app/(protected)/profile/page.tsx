import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { PlanActionForm } from '@/components/PlanActionForm';
import { updatePlan } from './actions';
import { Progress } from '@/components/ui/progress';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { pro } from '@/constants/PaddleProduct';

// Format seconds to minutes:seconds format
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


export default async function ProfilePage() {
  // Get user data from server-side Supabase client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to auth page instead of throwing an error
    redirect('/auth');
  }
  
  // Pre-compute user initials on the server side
  const userInitials = !user.email ? '?' : user.email.charAt(0).toUpperCase();
  
  // Get user profile from database
  const {data: userProfile, error: userProfileError} = await getUserProfileSSR(supabase, user.id);
    
  if (userProfileError) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Failed to load profile data</h2>
          <p className="mb-6">We&apos;re sorry, but we were unable to load your profile data. Please try again later.</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Create bound server actions with the user ID
  const upgradeToPro = updatePlan.bind(null, user.id, 'pro');
  const downgradeToFree = updatePlan.bind(null, user.id, 'free');

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </a>
          <h1 className="text-xl font-medium">Profile</h1>
        </div>
        <UserMenu user={user} userInitials={userInitials} />
      </header>
      
      {/* Profile content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Usage Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white md:col-span-2">
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription className="text-gray-400">
                {userProfile.product_id === pro 
                  ? 'Pro plan: 15 hours per month' 
                  : 'Free plan: 1 hour per month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>
                      {userProfile.product_id === pro
                        ? `Monthly usage: ${formatDuration(userProfile.monthly_usage_seconds || 0)} / 15:00:00 hours` 
                        : `Monthly usage: ${formatDuration(userProfile.monthly_usage_seconds || 0)} / 01:00:00 hour`}
                    </span>
                    <span>
                      {userProfile.product_id === pro
                        ? `${Math.round((userProfile.monthly_usage_seconds / (15 * 60 * 60)) * 100)}%` 
                        : `${Math.round((userProfile.monthly_usage_seconds / (1 * 60 * 60)) * 100)}%`}
                    </span>
                  </div>
                  <Progress 
                    value={userProfile.product_id === pro
                      ? Math.min(100, ((userProfile.monthly_usage_seconds || 0) / (15 * 60 * 60)) * 100) 
                      : Math.min(100, ((userProfile.monthly_usage_seconds || 0) / (1 * 60 * 60)) * 100)} 
                    className="h-1 bg-[#2a2a2a]" 
                    indicatorClassName="bg-[#3b82f6]" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Information Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Account Created</p>
                  <p>{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Current Plan</p>
                  <p className="font-medium">
                    {userProfile.product_id === pro ? 'Pro' : 'Free'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-400">Usage Limit</p>
                  <p>
                    {userProfile.product_id === pro 
                      ? '15 hours per month' 
                      : '1 hour per month'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {userProfile.product_id === pro ? (
                <PlanActionForm 
                planType="free" 
                action={downgradeToFree} 
                buttonText="Downgrade to Free" 
                variant="outline" 
              />
              ) : (
                <PlanActionForm 
                  planType="pro" 
                  action={upgradeToPro} 
                  buttonText="Upgrade to Pro" 
                />
              )}
            </CardFooter>
          </Card>
          
          {/* Danger Zone Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white md:col-span-2">
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription className="text-gray-400">
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
