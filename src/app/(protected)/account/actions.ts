'use server';

import { createClient, getUserProfileSSR } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { log } from '@/lib/logger';

// Server actions for plan management
export async function updatePlan(userId: string, planType: 'free' | 'pro') {
  const supabase = await createClient();
  
  try {
    // Update the user's plan in the database
    const { error } = await supabase
      .from('users')
      .update({ 
        plan_type: planType,
        // For Pro plan, add simulated subscription data
        ...(planType === 'pro' ? {
          product_id: 'simulated_plan_id',
          subscription_id: 'simulated_paddle_id'
        } : {
          product_id: null,
          paddle_id: null
        })
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile');    
  } catch (error: unknown) {
    log({
      logLevel: 'error',
      action: 'updatePlan',
      message: `Error ${planType === 'pro' ? 'upgrading' : 'downgrading'} plan`,
      metadata: { userId, planType, error }
    });
  }
}

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
