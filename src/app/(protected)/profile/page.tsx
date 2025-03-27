import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { PlanActionForm } from '@/components/PlanActionForm';
import { updatePlan } from './actions';



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
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <UserMenu user={user} userInitials={userInitials} />
      </header>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Manage your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                <p>{new Date(userProfile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="font-medium">
                  {userProfile.plan_type === 'free' ? 'Free' : 'Pro'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usage Limit</p>
                <p>
                  {userProfile.plan_type === 'free' 
                    ? '30 minutes total (lifetime)' 
                    : '60 minutes per month'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Usage</p>
                <p>
                  {userProfile.plan_type === 'free'
                    ? `${userProfile.total_usage_minutes} / 30 minutes`
                    : `${userProfile.monthly_usage_minutes} / 60 minutes this month`}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {userProfile.plan_type === 'free' ? (
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
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
  );
}
