"use client";

import { useEffect, useState } from 'react';
import { supabase, createUser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function UserProfileCheck({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[UserCheck] User authenticated, checking profile');
          
          // Check if user exists in database
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // If user doesn't exist, create a new record
          if (!existingUser && !userError) {
            console.log('[UserCheck] Creating new user profile');
            
            const { error: createError } = await createUser(
              session.user.id, 
              session.user.email
            );
            
            if (createError) {
              console.error('[UserCheck] Error creating user profile:', createError);
              toast({
                title: "Profile Error",
                description: "There was an issue setting up your profile. Some features may be limited.",
                variant: "destructive",
              });
            } else {
              console.log('[UserCheck] User profile created successfully');
            }
          }
        }
      } catch (error) {
        console.error('[UserCheck] Error checking user profile:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserProfile();
    
    // Also set up an auth state listener for future sign-ins
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          checkUserProfile();
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  // Simply render children - the check happens in the background
  return <>{children}</>;
}
