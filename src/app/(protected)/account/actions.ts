'use server';

import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { log } from '@/lib/logger';
import { LinkGetCustomerInfoPaddle, LinkGetSubscriptionInfoPaddle } from '@/constants/PaddleUrl';

interface PaddleSubscriptionResponse {
  data: {
    management_urls: {
      cancel: string;
      update_payment_method: string;
    };
  };
}

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
            
    const subscription: PaddleSubscriptionResponse = await res.json();
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

export async function changePaymentMethod(subscriptionId: string) {
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
            
    const subscription: PaddleSubscriptionResponse = await res.json();
    const changePaymentMethodUrl = subscription.data.management_urls.update_payment_method;
    
    // Return the URL so the client can open it in a new tab
    return { cancelUrl: changePaymentMethodUrl };
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'cancelPlan',
      message: 'Error getting change payment method URL',
      metadata: { error }
    });
    return { error: 'An error occurred while processing your request' };
  }
}

export async function getBillingHistory(customerId: string) {
  try {
    const getSubscriptionInfoUrl = `${LinkGetCustomerInfoPaddle}${customerId}/portal-sessions`;
    const res = await fetch(getSubscriptionInfoUrl, {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
    });
    
    if (!res.ok) {
      console.log(res)
      log({
        logLevel: 'error',
        action: 'getBillingHistoryUrl',
        message: 'Failed to fetch Paddle subscription',
        metadata: {
          response: await res.text()
        }
      });
      return { error: 'Failed to fetch billing history information' };
    }
            
    const portalSession = await res.json();
    
    const portalUrl = portalSession.data.urls.general.overview.replace('overview', 'payments');
    
    return { billingHistoryUrl: portalUrl };
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'getBillingHistoryUrl',
      message: 'Error getting billing history URL',
      metadata: { error }
    });
    return { error: 'An error occurred while processing your request' };
  }
}

export async function getSubscriptionUpgradePreview(subscriptionId: string) {
  try {
    const getSubscriptionInfoUrl = `${LinkGetSubscriptionInfoPaddle}${subscriptionId}/preview`;
    const res = await fetch(getSubscriptionInfoUrl, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      body: JSON.stringify({
        proration_billing_mode: "prorated_immediately",
        items: [
          {
            price_id: "pri_01jragmnqnywa9gxq1kt6rrszb",
            quantity: 1
          }
        ]
      }),
    });
    
    if (!res.ok) {
      log({
        logLevel: 'error',
        action: 'getSubscriptionUpgradePreview',
        message: 'Failed to fetch Paddle subscription upgrade preview',
        metadata: {
          response: await res.text()
        }
      });
      return { error: 'Failed to fetch subscription upgrade preview information' };
    }
            
    const subscriptionUpgradePreview = await res.json();

    const startBillingPeriod = subscriptionUpgradePreview.data.current_billing_period.starts_at;
    const endBillingPeriod = subscriptionUpgradePreview.data.current_billing_period.ends_at;

    const totalAmount = subscriptionUpgradePreview.data.update_summary.charge.amount;
    const totalAmountFormatted = totalAmount.slice(0, -2) + '.' + totalAmount.slice(-2);

    const dueAmount = (parseInt(subscriptionUpgradePreview.data.update_summary.result.amount) - parseInt(subscriptionUpgradePreview.data.recurring_transaction_details.totals.credit)).toString();
    const dueAmountFormatted = dueAmount.slice(0, -2) + '.' + dueAmount.slice(-2);
    
    return { subscriptionUpgradePreview, startBillingPeriod, endBillingPeriod, totalAmountFormatted, dueAmountFormatted };
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'getSubscriptionUpgradePreview',
      message: 'Error getting subscription upgrade preview',
      metadata: { error }
    });
    return { error: 'An error occurred while processing your request' };
  }
}

export async function upgradeSubscription(subscriptionId: string) {
  try {
    const getSubscriptionInfoUrl = `${LinkGetSubscriptionInfoPaddle}${subscriptionId}`;
    const res = await fetch(getSubscriptionInfoUrl, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      body: JSON.stringify({
        proration_billing_mode: "prorated_immediately",
        items: [
          {
            price_id: "pri_01jragmnqnywa9gxq1kt6rrszb",
            quantity: 1
          }
        ]
      }),
    });
    
    if (!res.ok) {
      log({
        logLevel: 'error',
        action: 'getSubscriptionUpgradePreview',
        message: 'Failed to fetch Paddle subscription upgrade preview',
        metadata: {
          response: await res.text()
        }
      });
      return { error: 'Failed to fetch subscription upgrade preview information' };
    }
            
    return;
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'getSubscriptionUpgradePreview',
      message: 'Error getting subscription upgrade preview',
      metadata: { error }
    });
    return { error: 'An error occurred while processing your request' };
  }
}