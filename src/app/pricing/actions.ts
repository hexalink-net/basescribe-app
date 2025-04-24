'use server'

import { createClient, getUserSubscriptionSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';

/**
 * Fetch pricing data for the user
 * This server action encapsulates all data fetching for the pricing page
 */
export async function fetchPricingData() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // If no user is logged in, return just the user data
    if (!user) {
      return {
        user: null,
        userSubscription: null,
        error: null
      };
    }

    // Get user subscription data
    const userSubscription = await getUserSubscriptionSSR(supabase, user.id);

    return {
      user,
      userSubscription: userSubscription.data || null,
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'fetchPricingData',
      message: 'Error fetching pricing data',
      metadata: { error: errorMessage }
    });

    return {
      user: null,
      userSubscription: null,
      error: 'Failed to load pricing data'
    };
  }
}
