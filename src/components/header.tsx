import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

// Dynamic imports for client components
// These will be resolved after a full build
import { UserMenu } from '@/components/UserMenu';

export async function Header() {
  // Get user data from server-side
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;
  
  // Pre-compute the user initials on the server side
  const userInitials = !user || !user.email ? '?' : user.email.charAt(0).toUpperCase();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">BaseScribe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} userInitials={userInitials} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth?mode=signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
