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
          plan_id: 'simulated_plan_id',
          paddle_id: 'simulated_paddle_id'
        } : {
          plan_id: null,
          paddle_id: null
        })
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error: unknown) {
    console.error(`Error ${planType === 'pro' ? 'upgrading' : 'downgrading'} plan:`, error);
    return { success: false, error: "Unable to update plan" };
  }
}
