export interface UserProfile {
  id: string;
  email?: string;
  created_at?: string;
  plan_type: 'free' | 'pro';
  plan_id?: string | null;
  paddle_id?: string | null;
  total_usage_minutes: number;
  monthly_usage_minutes: number;
  last_reset_date?: string | null;
  usage_bytes?: number;
}

export interface Upload {
  id: string;
  user_id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  duration_minutes: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'error';
  transcript_text?: string | null;
  transcript_json?: any | null;
}