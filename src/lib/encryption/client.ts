"use client";

import { log } from "@/lib/logger";
import { iterations, hashAlgorithm } from "@/constants/encryption";
import { z } from "zod";
import { EncryptionData } from "@/types/DashboardInterface";
import { supabase } from "@/lib/supabase/client";
import { setUserEncryptionData } from "@/app/(protected)/encryption/actions";

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

    // --- 4. Encrypt the user's private key (as JWK) with the derived symmetric key ---
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", userKeyPair.privateKey);
    const privateKeyString = JSON.stringify(privateKeyJwk);
    const privateKeyBuffer = new TextEncoder().encode(privateKeyString);

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM

    const encryptedUserPrivateKey = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        derivedSymmetricKey,
        privateKeyBuffer // Encrypt the ArrayBuffer of the private key JWK string
    );

    // Export the user's public key as JWK for consistency
    const publicKeyJwk = await crypto.subtle.exportKey("jwk", userKeyPair.publicKey);

    const { error: setUserEncryptionDataError } = await setUserEncryptionData(
      userId,
      JSON.stringify(publicKeyJwk),
      arrayBufferToBase64(encryptedUserPrivateKey),
      arrayBufferToBase64(salt),
      iterations,
      hashAlgorithm,
      arrayBufferToBase64(iv)
    )

    if (setUserEncryptionDataError) {
      log({
        logLevel: 'error',
        action: 'generateUserKeysAndEncryptPrivateKey',
        message: 'Error setting encryption password',
        metadata: { userId, setUserEncryptionDataError }
      });
      return { success: false, error: "Failed to set encryption password." };
    }

    // Return the private key JWK to be stored in the client's session storage
    return { success: true, exportedPrivateKey: privateKeyJwk };
  } catch (error) {
    console.error(error)
    log({
      logLevel: 'error',
      action: 'generateUserKeysAndEncryptPrivateKey',
      message: 'Error setting encryption password',
      metadata: { userId, error }
    });
    return { success: false, error: "An unexpected error occurred." };
  }
}

export const decryptUserPrivateKey = async (password: string, encryptionData: EncryptionData): Promise<JsonWebKey> => {
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

    // --- Decrypt the user's private key (JWK string) with the re-derived symmetric key ---
    const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      reDerivedSymmetricKey,
      encryptedPrivateKey
    );

    // Decode the ArrayBuffer back to a JWK string, then parse it.
    const privateKeyString = new TextDecoder().decode(decryptedPrivateKeyBuffer);
    const privateKeyJwk = JSON.parse(privateKeyString);

    // The parsed JWK is the private key we need.
    return privateKeyJwk;
}