"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getUserById, updateUserPlan } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: profileData, error } = await getUserById(user.id);
          
          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setUserProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleUpgradeToPro = async () => {
    if (!user) return;
    
    // In a real app, this would redirect to Paddle checkout
    // For now, we'll simulate upgrading the user to Pro
    try {
      await updateUserPlan(user.id, 'pro', 'simulated_plan_id', 'simulated_paddle_id');
      
      setUserProfile({
        ...userProfile,
        plan_type: 'pro'
      });
      
      toast({
        title: "Upgraded to Pro",
        description: "You've been upgraded to the Pro plan!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error upgrading your plan",
        variant: "destructive",
      });
    }
  };

  const handleDowngradeToFree = async () => {
    if (!user) return;
    
    try {
      await updateUserPlan(user.id, 'free');
      
      setUserProfile({
        ...userProfile,
        plan_type: 'free',
        plan_id: null,
        paddle_id: null
      });
      
      toast({
        title: "Downgraded to Free",
        description: "You've been downgraded to the Free plan.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error downgrading your plan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      {userProfile && (
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
                  <p>{user?.email}</p>
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
                <Button onClick={handleUpgradeToPro} className="w-full">
                  Upgrade to Pro
                </Button>
              ) : (
                <Button onClick={handleDowngradeToFree} variant="outline" className="w-full">
                  Downgrade to Free
                </Button>
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
      )}
    </div>
  );
}
