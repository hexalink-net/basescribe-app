"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';

interface UserProfile {
  id: string;
  plan_type: 'free' | 'pro';
}

export function PricingPlans() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);
        
        if (userData.user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('id, plan_type')
            .eq('id', userData.user.id)
            .single();

          if (profileError) {
            if (profileError.code !== 'PGRST116') {
              throw profileError;
            }
          } else {
            setUserProfile(profileData as UserProfile);
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

  const handleUpgradeClick = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // In a real implementation, this would redirect to Paddle checkout
    // For now, we'll just show a toast message
    toast({
      title: 'Upgrade coming soon',
      description: 'Paddle integration will be implemented in the future.',
    });

    // Placeholder for Paddle checkout
    // window.location.href = 'https://checkout.paddle.com/YOUR_PADDLE_CHECKOUT_URL';
  };

  const handleManageSubscription = () => {
    // In a real implementation, this would redirect to Paddle customer portal
    // For now, we'll just show a toast message
    toast({
      title: 'Manage subscription',
      description: 'Paddle customer portal will be implemented in the future.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start transcribing your audio and video files today.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={`border-2 ${userProfile?.plan_type === 'free' ? 'border-primary' : 'border-transparent'}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>For occasional use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">/ forever</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>30 minutes total lifetime limit</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Basic transcription quality</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Standard processing speed</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Text format export</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {loading ? (
              <Button disabled className="w-full">Loading...</Button>
            ) : !user ? (
              <Button onClick={() => router.push('/auth?mode=signup')} className="w-full">
                Get Started
              </Button>
            ) : userProfile?.plan_type === 'free' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Downgrade
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`border-2 ${userProfile?.plan_type === 'pro' ? 'border-primary' : 'border-transparent'}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <CardDescription>For regular use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>60 minutes per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>High-quality transcription</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Priority processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Multiple export formats (TXT, SRT, etc.)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Email support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {loading ? (
              <Button disabled className="w-full">Loading...</Button>
            ) : !user ? (
              <Button onClick={() => router.push('/auth?mode=signup')} className="w-full">
                Get Started
              </Button>
            ) : userProfile?.plan_type === 'pro' ? (
              <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            ) : (
              <Button className="w-full" onClick={handleUpgradeClick}>
                Upgrade to Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-12 text-muted-foreground">
        <p>All plans include secure storage and basic customer support.</p>
        <p className="mt-2">Need more minutes? Contact us for custom plans.</p>
      </div>
    </div>
  );
}
