export interface UserProfile {
  id: string;
  email?: string;
  created_at?: Date | null;
  product_id?: string | null;
  subscription_id?: string | null;
  plan_start_date?: Date | null;
  plan_end_date?: Date | null;
  total_usage_seconds: number;
  monthly_usage_seconds: number;
}

export interface TranscriptSegment {
  timestamp: [number, number];
  text: string;
}

export interface Uploads {
  id: string;
  created_at: string;
  file_name: string;
  duration_seconds: number;
  status: 'pending' | 'processing' | 'completed'| 'failed';
  language: string;
}

export interface UploadDetail {
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
  transcript_json?: string | null;
}

export interface Folder {
  id: string;
  parent_id: string | null;
  name: string;
}

export interface EncryptionData {
  id: string;
  user_id: string;
  user_public_key_b64: string;
  encrypted_private_key_b64: string;
  salt_b64: string;
  pbkdf2_iterations: number;
  pbkdf2_hash_algorithm: string;
  iv_b64: string;
}