"use server"

import { createClient } from '@/lib/supabase/server';

export async function updateUserCustomerId(customerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase.rpc('update_customer_id', {
    target_user_id: user.id,
    new_customer_id: customerId
  });
    
  if (error) {
    console.error('Error updating customer ID:', error);
    throw error;
  }

  console.log("Success update customer id")
  
  return data;
}
