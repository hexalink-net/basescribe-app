export interface UserProfile {
  id: string;
  email?: string;
  created_at?: Date | null;
  plan_id?: string | null;
  subscription_id?: string | null;
  plan_start_date?: Date | null;
  plan_end_date?: Date | null;
  total_usage_seconds: number;
  monthly_usage_seconds: number;
}

export interface Upload {
  id: string;
  user_id: string;
  folder_id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  duration_seconds: number;
  status: 'pending' | 'processing' | 'completed'| 'error';
  transcript_text?: string | null;
  transcript_json?: any | null;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}
  