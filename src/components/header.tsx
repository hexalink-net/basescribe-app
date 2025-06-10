import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/StyleUtils';

// Dynamic imports for client components
// These will be resolved after a full build
import { UserMenu } from '@/components/UserMenu';
import Image from 'next/image';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export async function Header({ variant = 'default' }: HeaderProps = {}) {
  // Get user data from server-side securely
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Pre-compute the user initials on the server side
  const userInitials = !user || !user.email ? '?' : user.email.charAt(0).toUpperCase();

  return (
    <header className={cn(
      "transition-all duration-300 sticky top-0 z-50",
      variant === 'default' ? "border-b border-zinc-800/30 bg-zinc-900/80 backdrop-blur-md text-white" : 
      "bg-transparent backdrop-blur-md text-white"
    )}>
      <div className="container mx-auto px-4 py-3 flex items-center">
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/basescribe-logo.png" 
              alt="BaseScribe Logo" 
              width={140} 
              height={40} 
              className="h-8 w-auto" 
              priority
            />
            <span className="mt-2 text-[#F0F177] text-xs font-bold border border-[#2a2a2a] px-1 py-0 rounded-sm border-[#F0F177] opacity-80">BETA</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link 
            href="/" 
            className="text-sm font-medium text-white/80 hover:text-white transition-all relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm font-medium text-white/80 hover:text-white transition-all relative group"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {user ? (
            <UserMenu user={user} userInitials={userInitials} variant={variant} />
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-white hover:text-white hover:bg-white/10 transition-all rounded-full px-5"
                asChild
              >
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button 
                className="bg-gradient-to-r from-[#F0F177] to-[#d9e021] hover:opacity-90 text-black font-medium transition-all rounded-full px-5 shadow-lg shadow-[#F0F177]/20"
                asChild
              >
                <Link href="/auth?mode=signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
