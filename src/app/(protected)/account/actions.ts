'use server';

import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';
import { LinkGetSubscriptionInfoPaddle } from '@/constants/PaddleUrl';

/**
 * Fetch account data for the user
 * This server action encapsulates the data fetching for the account page
 */
export async function fetchAccountData() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        user: null,
        userProfile: null,
        userInitials: null,
        error: 'Not authenticated'
      };
    }
    
    // Pre-compute user initials on the server side
    const userInitials = !user.email ? '?' : user.email.charAt(0).toUpperCase();
    
    // Get user profile from database
    const userProfileResult = await getUserProfileSSR(supabase, user.id);
    
    if (!userProfileResult || userProfileResult.error) {
      return {
        user,
        userProfile: null,
        userInitials,
        error: 'Error loading user profile'
      };
    }
    
    return {
      user,
      userProfile: userProfileResult.data,
      userInitials,
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'fetchAccountData',
      message: 'Error fetching account data',
      metadata: { error: errorMessage }
    });
    
    return {
      user: null,
      userProfile: null,
      userInitials: null,
      error: 'Failed to load account data'
    };
  }
}

export async function cancelPlan(subscriptionId: string) {
  try {
    const getCustomerInfoPaddleUrl = `${LinkGetSubscriptionInfoPaddle}${subscriptionId}`;
    const res = await fetch(getCustomerInfoPaddleUrl, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
    });
    
    if (!res.ok) {
      log({
        logLevel: 'error',
        action: 'getSubscriptionInfo',
        message: 'Failed to fetch Paddle subscription',
        metadata: {
          response: await res.text()
        }
      });
      return { error: 'Failed to fetch subscription information' };
    }
            
    const subscription = await res.json();
    const cancelSubscriptionUrl = subscription.data.management_urls.cancel;
    
    // Return the URL so the client can open it in a new tab
    return { cancelUrl: cancelSubscriptionUrl };
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'cancelPlan',
      message: 'Error getting cancel subscription URL',
      metadata: { error }
    });
    return { error: 'An error occurred while processing your request' };
  }
}
  