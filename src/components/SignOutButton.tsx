"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useToast } from '@/components/ui/UseToast';
import { signOut } from '@/app/auth/action';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      
      // The server action will handle the redirect, but we can also do it here
      // as a fallback
      router.push('/auth');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign out';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-white text-red-500 hover:text-white"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </DropdownMenuItem>
  );
}
