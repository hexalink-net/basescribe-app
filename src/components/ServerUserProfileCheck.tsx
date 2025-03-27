import { createClient, getUserProfileSSR } from "@/lib/supabase/server";

export default async function ServerUserProfileCheck({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId: string;
}) {
  // Check if user exists in the database
  const supabase = await createClient();
  
  // Check if user exists in database
  const { data: existingUser, error: userError } = await getUserProfileSSR(supabase, userId);
  
  // If user doesn't exist, create a new record
  if (!existingUser && !userError) {
    console.log('[ServerUserCheck] Creating new user profile');
    
    // Get user email from auth
    const { data: userData } = await supabase.auth.getUser(userId);
    const userEmail = userData?.user?.email;
    
    // Create user record
    if (userEmail) {
      try {
        await supabase
          .from('users')
          .insert([
            { 
              id: userId, 
              email: userEmail,
              plan_type: 'free',
              total_usage_minutes: 0,
              monthly_usage_minutes: 0,
            }
          ]);
        console.log('[ServerUserCheck] User profile created successfully');
      } catch (createError) {
        console.error('[ServerUserCheck] Error creating user profile:', createError);
      }
    }
  }

  // Simply render children - the check happens on the server
  return <>{children}</>;
}
