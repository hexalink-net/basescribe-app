import { createClient, getUserSubscriptionSSR } from '@/lib/supabase/server';
import { Pricing } from './pricing';
import { getUserProfileSSR } from '@/lib/supabase/server';

interface PricingContainerProps {
  country: string;
}

export async function PricingContainer({ country }: PricingContainerProps) {
  // Get the user from server-side authentication
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const userSubscription = await getUserSubscriptionSSR(supabase, user?.id || '');

  return <Pricing country={country} user={user} userSubs={userSubscription.data || null}/>;
}
