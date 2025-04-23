import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgressBarWrapper from '@/components/ui/ProgressBarWrapper';

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
    <>
      <ProgressBarWrapper />
      {children}
    </>
  );
}
