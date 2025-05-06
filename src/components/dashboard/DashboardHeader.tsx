import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { UserMenu } from '@/components/UserMenu';
import type { User } from '@supabase/supabase-js';

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
    transcript: "max-w-7xl mx-auto w-full px-6 md:px-8 flex items-center justify-between"
  };
  
  return (
    <header className="sticky py-3 z-10 backdrop-blur-md bg-[#171717]/95 border-b border-[#2a2a2a] h-16">
      <div className={containerStyles[layout]}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/basescribe-logo.png" 
              alt="BaseScribe Logo" 
              width={140} 
              height={40} 
              className="h-8 w-auto" 
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {showFeedbackButton && (
            <Button 
              variant="outline" 
              className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a]/40 hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-all rounded-md px-3 py-0 h-7 text-xs"
              onClick={() => window.open('https://forms.gle/example-feedback-form', '_blank')}
            >
              Feedback
            </Button>
          )}
          <UserMenu user={user} userInitials={initials} />
        </div>
      </div>
    </header>
  );
}