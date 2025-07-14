"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { UserMenu } from '@/components/UserMenu';
import type { User } from '@supabase/supabase-js';
import { refreshAllRevalidate } from '@/app/(protected)/dashboard/actions';
import { useRouter } from 'next/navigation';
import { RefreshCw, MessageSquare } from 'lucide-react';

interface DashboardHeaderProps {
  user: User;
  userInitials?: string;
  layout?: 'dashboard' | 'account' | 'transcript';
  showFeedbackButton?: boolean;
}

export function DashboardHeader({ 
  user, 
  userInitials, 
  layout = 'dashboard',
  showFeedbackButton = true 
}: DashboardHeaderProps) {
  // Use the user's email first character as fallback if userInitials is not provided
  const initials = userInitials || (user.email ? user.email.charAt(0).toUpperCase() : '?');
  
  // Different container styles based on layout
  const containerStyles = {
    dashboard: "flex items-center justify-between px-6 w-full",
    account: "max-w-6xl mx-auto w-full px-6 md:px-8 flex items-center justify-between",
    transcript: "max-w-340 mx-auto w-full px-6 md:px-8 flex items-center justify-between"
  };

  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllRevalidate(user.id);
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="sticky py-3 z-10 backdrop-blur-md bg-[#171717]/95 border-b border-[#2a2a2a] h-16">
      <div className={containerStyles[layout]}>
        <div className="flex items-center gap-3 ml-12 md:ml-0">
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/basescribe-logo.png" 
              alt="BaseScribe Logo" 
              width={140} 
              height={40} 
              className="h-8 w-auto hidden md:block" 
              priority
            />
            <Image 
              src="/basescribe-logo-mobile.png" 
              alt="BaseScribe Logo" 
              width={140} 
              height={40} 
              className="h-8 w-auto block md:hidden" 
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`cursor-pointer border-[#2a2a2a] bg-[#1a1a1a]/40 hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-all rounded-md px-3 py-0 h-7 text-xs ${isRefreshing ? 'opacity-70' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {showFeedbackButton && (
            <Button 
              variant="outline" 
              className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a]/40 hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-all rounded-md px-3 py-0 h-7 text-xs"
              onClick={() => window.open('https://forms.gle/H9ixHkUKjegP35399', '_blank')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          )}
          <UserMenu user={user} userInitials={initials} />
        </div>
      </div>
    </header>
  );
}