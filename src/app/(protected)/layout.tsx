import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Import the ServerUserProfileCheck component
// If TypeScript still shows an error, it will be resolved after a full build
import ServerUserProfileCheck from '@/components/ServerUserProfileCheck';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is now handled by middleware
  // This is just a secondary check and to get the user data for the layout
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // This should rarely happen due to middleware, but just in case
    redirect('/auth');
  }
  
  return (
    <ServerUserProfileCheck userId={user.id}>
      {children}
    </ServerUserProfileCheck>
  );
}
