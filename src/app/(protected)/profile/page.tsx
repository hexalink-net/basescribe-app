import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { PlanActionForm } from '@/components/PlanActionForm';
import { updatePlan } from './actions';
import { Progress } from '@/components/ui/progress';

export default async function ProfilePage() {
  // Get user data from server-side Supabase client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Pre-compute user initials on the server side
  const userInitials = !user.email ? '?' : user.email.charAt(0).toUpperCase();
  
  // Get user profile from database
  const userProfile = await getUserProfileSSR(supabase, user.id);
    
  if (!userProfile) {
    console.error('Error fetching user profile:');
    throw new Error('Unable to load profile data');
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
                {userProfile.data.plan_id === 'free' 
                  ? 'Free plan: 30 minutes total limit' 
                  : 'Pro plan: 60 minutes per month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>
                      {userProfile.data.plan_id === 'free' 
                        ? `Total usage: ${userProfile.data.total_usage_seconds} / 30 minutes` 
                        : `Monthly usage: ${userProfile.data.monthly_usage_seconds} / 60 minutes`}
                    </span>
                    <span>
                      {userProfile.data.plan_id === 'free' 
                        ? `${Math.round((userProfile.data.total_usage_seconds / 30) * 100)}%` 
                        : `${Math.round((userProfile.data.monthly_usage_seconds / 60) * 100)}%`}
                    </span>
                  </div>
                  <Progress 
                    value={userProfile.data.plan_id === 'free' 
                      ? Math.min(100, ((userProfile.data.total_usage_seconds || 0) / 30) * 100) 
                      : Math.min(100, ((userProfile.data.monthly_usage_seconds || 0) / 60) * 100)} 
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
                  <p>{new Date(userProfile.data.created_at).toLocaleDateString()}</p>
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
                    {userProfile.data.plan_id === 'free' ? 'Free' : 'Pro'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-400">Usage Limit</p>
                  <p>
                    {userProfile.data.plan_type === 'free' 
                      ? '30 minutes total (lifetime)' 
                      : '60 minutes per month'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {userProfile.data.plan_type === 'free' ? (
                <PlanActionForm 
                  planType="pro" 
                  action={upgradeToPro} 
                  buttonText="Upgrade to Pro" 
                />
              ) : (
                <PlanActionForm 
                  planType="free" 
                  action={downgradeToFree} 
                  buttonText="Downgrade to Free" 
                  variant="outline" 
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
