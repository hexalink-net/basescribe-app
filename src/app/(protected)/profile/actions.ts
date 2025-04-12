'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    console.error(`Error ${planType === 'pro' ? 'upgrading' : 'downgrading'} plan:`, error);
  }
}
