import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { UserMenu } from '@/components/UserMenu';
import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-[#171717]/95 border-b border-[#2a2a2a] flex items-center justify-between px-6 h-16">
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
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a]/40 hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-all rounded-md px-3 py-0 h-7 text-xs"
          onClick={() => window.open('https://forms.gle/example-feedback-form', '_blank')}
        >
          Feedback
        </Button>
        <UserMenu user={user} userInitials={user.email ? user.email.charAt(0).toUpperCase() : '?'} />
      </div>
    </header>
  );
}