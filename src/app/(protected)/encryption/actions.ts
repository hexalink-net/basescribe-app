"use server";

import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { iterations, hashAlgorithm } from "@/constants/encryption";
import { z } from "zod";
import { encryptionRateLimiter } from "@/lib/upstash/ratelimit";
import { EncryptionData } from "@/types/DashboardInterface";

/**
 * Sets the encryption password for a user
 * @param userId The ID of the user
 * @param password The encryption password to set
 * @returns An object with success status and optional error message
 */

// Schema for encryption password validation
const encryptionPasswordSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

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

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary_string = atob(base64Fixed);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function getPrivateKeyIfValid() {
  const item = sessionStorage.getItem("privateKey");
  if (!item) return null;

  const parsed = JSON.parse(item);
  if (Date.now() > parsed.expiresAt) {
    sessionStorage.removeItem("privateKey");
    return null;
  }

  return parsed.encryptedPrivateKey;
}

export async function generateUserKeysAndEncryptPrivateKey(
  userId: string,
  password: string
): Promise<{ success: boolean; exportedPrivateKey?: JsonWebKey; error?: string }> {
  try {
    // Check rate limit first
    const canProceed = await checkEncryptionRateLimit(userId);
    if (!canProceed) {
      return { success: false, error: "Too many password inputs. Please try again in a few minutes." };
    }

    // Validate inputs
    const validationResult = encryptionPasswordSchema.safeParse({ userId, password });
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      log({
        logLevel: 'warn',
        action: 'generateUserKeysAndEncryptPrivateKey',
        message: 'Input validation failed',
        metadata: { userId, error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }

    // Create server client
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return { success: false, error: "Unauthorized. Please sign in again." };
    }

    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes is standard for salt

    const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false, // Not extractable (the password itself shouldn't be exportable)
        ['deriveKey']
    );

    const derivedSymmetricKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: hashAlgorithm,
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 }, // We want an AES-256 GCM key
        true, // This derived key IS extractable if we want to save it or use it (e.g., to wrap another key)
        ['encrypt', 'decrypt'] // For encrypting the private key later
    );

    // --- 3. Generate the user's RSA public/private key pair ---
    const userKeyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
            hash: "SHA-256",
        },
        true, // The private key must be extractable so we can encrypt it
        ["encrypt", "decrypt"]
    );

    // Export the user's private key to PEM format (PKCS8) as ArrayBuffer
    const userPrivateKeyPem = await crypto.subtle.exportKey("pkcs8", userKeyPair.privateKey);

    // --- 4. Encrypt the user's private key (PEM bytes) with the derived symmetric key ---
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM

    const encryptedUserPrivateKey = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        derivedSymmetricKey,
        userPrivateKeyPem // The ArrayBuffer of the private key PEM
    );

    // Export the user's public key (SPKI)
    const userPublicKeyPem = await crypto.subtle.exportKey("spki", userKeyPair.publicKey);

    // Update user profile with encryption key hash
    const { error } = await supabase.functions.invoke('set-encryption-data', {
      body: JSON.stringify({ 
        userId: userId,
        userPublicKey: arrayBufferToBase64(userPublicKeyPem),
        encryptedUserPrivateKey: arrayBufferToBase64(encryptedUserPrivateKey),
        salt: arrayBufferToBase64(salt),
        iterations,
        hashAlgorithm,
        iv: arrayBufferToBase64(iv)
      })
    })

    if (error) {
      log({
        logLevel: 'error',
        action: 'generateUserKeysAndEncryptPrivateKey',
        message: 'Error setting encryption password',
        metadata: { userId, error }
      });
      return { success: false, error: "Failed to set encryption password." };
    }

    // Export for storage
    const exportedKey = await crypto.subtle.exportKey("jwk", userKeyPair.privateKey);

    return { success: true, exportedPrivateKey: exportedKey };
  } catch (error) {
    log({
      logLevel: 'error',
      action: 'generateUserKeysAndEncryptPrivateKey',
      message: 'Error setting encryption password',
      metadata: { userId, error }
    });
    return { success: false, error: "An unexpected error occurred." };
  }
}

export const getUserEncryptionData = async (userIdParam: string) => {
    // Create server client
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke('get-encryption-data', {
      body: JSON.stringify({ userId: userIdParam })
    })
    
    if (error) {
      log({
        logLevel: 'error',
        action: 'getUserEncryptionData',
        message: 'Error fetching user encryption data',
        metadata: { userIdParam, error }
      });
    }

    return { data, error };
}

export const decryptUserPrivateKey = async (password: string, encryptionData: EncryptionData) => {
    // Validate encryptionData and all required properties
    if (!encryptionData) {
      throw new Error("Encryption data not found");
    }
    
    // Validate all required properties are present
    const requiredProps = [
      'salt_b64', 
      'iv_b64', 
      'encrypted_private_key_b64', 
      'pbkdf2_iterations',
      'pbkdf2_hash_algorithm'
    ];
    
    for (const prop of requiredProps) {
      if (!(prop in encryptionData) || !encryptionData[prop as keyof EncryptionData]) {
        throw new Error(`Missing encryption data property: ${prop}`);
      }
    }
    
    // Validate that values are of expected types
    if (typeof encryptionData.pbkdf2_iterations !== 'number' || encryptionData.pbkdf2_iterations <= 0) {
      throw new Error('Invalid pbkdf2_iterations value');
    }
    const salt = base64ToArrayBuffer(encryptionData.salt_b64);
    const iv = base64ToArrayBuffer(encryptionData.iv_b64);
    const encryptedPrivateKey = base64ToArrayBuffer(encryptionData.encrypted_private_key_b64);

    const iterations = encryptionData.pbkdf2_iterations;
    const hashAlgorithm = encryptionData.pbkdf2_hash_algorithm;

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false, // Not extractable
      ['deriveKey']
    );

    const reDerivedSymmetricKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: hashAlgorithm,
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 }, // Must match encryption
      false, // Not extractable, as it's derived from password
      ['encrypt', 'decrypt']
    );

    // --- Decrypt the user's private key (PEM bytes) with the re-derived symmetric key ---
    const decryptedPrivateKeyPem = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      reDerivedSymmetricKey,
      encryptedPrivateKey
    );

    // --- Import the decrypted private key as a CryptoKey ---
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8", // this is the format used when exporting/importing RSA private keys
      decryptedPrivateKeyPem,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true, 
      ["decrypt"]
    );

    const exportedKey = await crypto.subtle.exportKey("jwk", cryptoKey);
    return exportedKey;
}