export interface UserProfile {
    id: string;
    email?: string;
    plan_type: 'free' | 'pro';
    total_usage_minutes: number;
    monthly_usage_minutes: number;
    subscription_tier?: string;
    usage_bytes?: number;
  }

export interface Upload {
    id: string;
    created_at: string;
    file_name: string;
    file_size: number;
    file_path: string;
    duration_minutes: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    user_id: string;
  }