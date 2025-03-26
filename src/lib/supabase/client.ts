import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  users: {
    id: string;
    email: string;
    created_at: string;
    plan_type: 'free' | 'pro';
    plan_id: string | null;
    paddle_id: string | null;
    total_usage_minutes: number;
    monthly_usage_minutes: number;
    last_reset_date: string | null;
  };
  uploads: {
    id: string;
    user_id: string;
    created_at: string;
    file_name: string;
    file_path: string;
    file_size: number;
    duration_minutes: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    transcript_text: string | null;
    transcript_json: any | null;
  };
};

// Database helper functions

/**
 * Create a new user record in the database
 */
export async function createUser(userId: string, email: string | undefined) {
  return supabase
    .from('users')
    .insert([
      { 
        id: userId,
        email: email,
        plan_type: 'free',
        total_usage_minutes: 0,
        monthly_usage_minutes: 0,
      }
    ]);
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
}

/**
 * Update user's plan type
 */
export async function updateUserPlan(userId: string, planType: 'free' | 'pro', planId?: string, paddleId?: string) {
  const updates: any = { plan_type: planType };
  
  if (planId) updates.plan_id = planId;
  if (paddleId) updates.paddle_id = paddleId;
  
  return supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
}

/**
 * Update user's usage minutes
 */
export async function updateUserUsage(userId: string, totalMinutes: number, monthlyMinutes: number) {
  return supabase
    .from('users')
    .update({ 
      total_usage_minutes: totalMinutes,
      monthly_usage_minutes: monthlyMinutes 
    })
    .eq('id', userId);
}

/**
 * Create a new upload record
 */
export async function createUpload(userId: string, fileName: string, filePath: string, fileSize: number) {
  return supabase
    .from('uploads')
    .insert([
      {
        user_id: userId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        duration_minutes: 0,
        status: 'pending'
      }
    ])
    .select();
}

/**
 * Get all uploads for a user
 */
export async function getUserUploads(userId: string) {
  return supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

/**
 * Update upload status
 */
export async function updateUploadStatus(uploadId: string, status: 'pending' | 'processing' | 'completed' | 'error', durationMinutes?: number, transcriptText?: string, transcriptJson?: any) {
  const updates: any = { status };
  
  if (durationMinutes !== undefined) updates.duration_minutes = durationMinutes;
  if (transcriptText) updates.transcript_text = transcriptText;
  if (transcriptJson) updates.transcript_json = transcriptJson;
  
  return supabase
    .from('uploads')
    .update(updates)
    .eq('id', uploadId);
}

/**
 * Create an authenticated Supabase client with a provided access token
 */
export function createAuthenticatedSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
