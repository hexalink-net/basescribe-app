"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/StyleUtils';

// Import the SignOutButton component
// TypeScript may show an error until a full build is done
import { SignOutButton } from './SignOutButton';

interface UserMenuProps {
  user: {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
    };
  };
  userInitials: string;
  variant?: 'default' | 'transparent';
}

export function UserMenu({ user, userInitials, variant = 'default' }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-10 w-10 rounded-full cursor-pointer",
            variant === 'default' ? "hover:bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]/50 text-white"
          )}
        >
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
            <AvatarFallback className={cn(
              "text-white",
              "bg-purple-800"
            )}>
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md shadow-lg py-1 min-w-[180px]">
        <DropdownMenuItem asChild className="text-sm px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-white">
          <Link href="/dashboard" className="w-full">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-sm px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-white">
          <Link href="/account" className="w-full">Account</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
