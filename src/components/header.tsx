import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/StyleUtils';

// Dynamic imports for client components
// These will be resolved after a full build
import { UserMenu } from '@/components/UserMenu';

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
      "transition-all duration-300",
      variant === 'default' ? "border-b bg-background" : 
      "bg-transparent backdrop-blur-sm"
    )}>
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2">
            <span className={cn(
              "font-bold text-xl", 
              variant === 'transparent' && "text-white"
            )}>BaseScribe</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link 
            href="/" 
            className={cn(
              "text-sm font-medium transition-colors",
              variant === 'default' ? "hover:text-primary" : "text-gray-300 hover:text-white"
            )}
          >
            Home
          </Link>
          <Link 
            href="/pricing" 
            className={cn(
              "text-sm font-medium transition-colors",
              variant === 'default' ? "hover:text-primary" : "text-gray-300 hover:text-white"
            )}
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {user ? (
            <UserMenu user={user} userInitials={userInitials} variant={variant} />
          ) : (
            <>
              <Button 
                variant={variant === 'default' ? "ghost" : "outline"} 
                className={cn(
                  variant === 'transparent' && "border-[#3a3a3a] bg-[#222222]/50 hover:bg-[#2a2a2a] text-white hover:text-white transition-all"
                )}
                asChild
              >
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button 
                className={cn(
                  variant === 'transparent' && "bg-[#F0F177] hover:bg-[#d9e021] text-black"
                )}
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
