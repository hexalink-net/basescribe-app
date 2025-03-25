"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        
        // Create user record in the database
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id,
                email: data.user.email,
                plan_type: 'free',
                total_usage_minutes: 0,
                monthly_usage_minutes: 0,
              }
            ]);
            
          if (profileError) console.error('Error creating user profile:', profileError);
        }
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your signup.",
        });
        
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Signed in successfully",
          description: "Welcome back to BaseScribe!",
        });
        
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during Google authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto py-20">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'signup' ? 'Create Account' : 'Sign In'}</CardTitle>
          <CardDescription>
            {mode === 'signup' 
              ? 'Enter your email below to create your account'
              : 'Enter your email and password to sign in'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
            >
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? 'Loading...' 
                : mode === 'signup' 
                  ? 'Create Account' 
                  : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              {mode === 'signup' ? (
                <p>
                  Already have an account?{" "}
                  <a
                    href="/auth"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
                  </a>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <a
                    href="/auth?mode=signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </a>
                </p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
