"use server";

import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { encryptionRateLimiter } from "@/lib/upstash/ratelimit";
import { EncryptionData } from "@/types/DashboardInterface";

// Rate Limiter
async function checkEncryptionRateLimit(userId: string) {
  try {
    const { success } = await encryptionRateLimiter.limit(userId);
    
    if (!success) {
      log({
        logLevel: 'warn',
        action: 'checkEncryptionRateLimit',
        message: 'Rate limit exceeded for encryption operations',
        metadata: { userId }
      });
    }
    
    return success;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log({
      logLevel: 'error',
      action: 'checkEncryptionRateLimit',
      message: 'Error checking encryption rate limit',
      metadata: { userId, error: errorMessage }
    });
    return false;
  }
}

export const setUserEncryptionData = async (userId: string, userPublicKey: string, encryptedUserPrivateKey: string, salt: string, iterations: number, hashAlgorithm: string, iv: string) => {
    const exceedLimit = await checkEncryptionRateLimit(userId);
    
    if (!exceedLimit) {
      throw new Error("Too many requests. Please try again in a few minutes.");
    }
    
    // Create server client
    const supabase = await createClient();

    const { error } = await supabase.from('user_encryptions').insert({
      user_id: userId,
      user_public_key_b64: userPublicKey,
      encrypted_private_key_b64: encryptedUserPrivateKey,
      salt_b64: salt,
      pbkdf2_iterations: iterations,
      pbkdf2_hash_algorithm: hashAlgorithm,
      iv_b64: iv
    })
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'setUserEncryptionData',
        message: 'Error setting user encryption data',
        metadata: { userId, error }
      });
      return { success: false, error: "Failed to set encryption password." };
    }

    return { success: true };
}

export const getUserEncryptionData = async (userIdParam: string): Promise<{ data: EncryptionData | null; error: Error | null }> => {
    // Create server client
    const supabase = await createClient();

    const { data, error } = await supabase.from('user_encryptions').select('*').eq('user_id', userIdParam);
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'getUserEncryptionData',
        message: 'Error fetching user encryption data',
        metadata: { userIdParam, error }
      });
    }

    if (data && data.length > 0) {
      return { data: data[0] as EncryptionData, error: null };
    }

    return { data: null, error: null };
}