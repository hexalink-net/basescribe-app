import { createClient } from '@/lib/supabase/server';
import { Pricing } from './pricing';

interface PricingContainerProps {
  country: string;
}

export async function PricingContainer({ country }: PricingContainerProps) {
  // Get the user from server-side authentication
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return <Pricing country={country} user={user} />;
}
