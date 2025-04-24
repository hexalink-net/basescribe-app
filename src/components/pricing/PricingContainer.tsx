import { Pricing } from './pricing';
import { fetchPricingData } from '@/app/pricing/actions';

interface PricingContainerProps {
  country: string;
}

export async function PricingContainer({ country }: PricingContainerProps) {
  // Fetch user and subscription data using server action
  const { user, userSubscription, error } = await fetchPricingData();
  
  // Handle any errors from data fetching
  if (error) {
    console.error('Error loading pricing data:', error);
  }

  return <Pricing country={country} user={user} userSubs={userSubscription} />;
}
