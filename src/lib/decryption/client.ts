"use client";

import { supabase } from "@/lib/supabase/client";
import { BucketNameUpload } from "@/constants/SupabaseBucket";

interface MetadataResult {
    encryptedKeyBase64: string;
    nonceBase64: string;
    algorithm: string;
    chunkPaths: string[];
    chunks: number;
}

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

function printMagicHeader(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer).slice(0, 10);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log("Magic header:", hex);
  
    const text = new TextDecoder("ascii").decode(bytes);
    console.log("Magic ASCII:", text);

    console.log("Buffer length:", buffer.byteLength)
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

async function fetchMetadata(uploadId: string) {
    const { data: metadataUrlData, error: metadataUrlError } = await supabase.from('uploads').select('file_path').eq('id', uploadId).single();
    if (metadataUrlError) {
        throw metadataUrlError;
    }

    const { data: metadata, error: metadataError } = await supabase.storage.from(BucketNameUpload)
    .createSignedUrl(metadataUrlData.file_path, 3600);

    if (metadataError) {
        throw metadataError;
    }

    if (metadataUrlData.file_path.includes("temp")) {
        throw new Error('Encrypting audio file');
    }

    const response = await fetch(metadata.signedUrl);

    if (!response.ok) {
        throw new Error('Failed to fetch metadata');
    }
    const metadataJson = await response.json();

    const encryptionInfo = metadataJson.encryption;
    
    const metadataResult = {
        encryptedKeyBase64: encryptionInfo.encrypted_key,
        nonceBase64: encryptionInfo.nonce,
        algorithm: encryptionInfo.algorithm,
        chunkPaths: metadataJson.chunk_paths,
        chunks: metadataJson.chunks,
    }

    console.log(metadataResult)

    return metadataResult;
}

async function decryptAESKey(encryptedAESKeyBase64: string, privateKeyJWK: JsonWebKey) {
    // Convert base64 to ArrayBuffer
    const encryptedKeyBytes = base64ToArrayBuffer(encryptedAESKeyBase64);
    
    // Import your private key (should be securely stored)
    const privateKey = await crypto.subtle.importKey(
        "jwk",
        privateKeyJWK,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
    );
    
    // Decrypt the AES key
    const aesKeyBytes = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      encryptedKeyBytes
    );
    
    return aesKeyBytes;
  }

export async function setupDecryptedAudioPlayer(uploadId: string, privateKeyJWK: JsonWebKey, audioElement?: HTMLAudioElement) {
    try{
        const metadataJson = await fetchMetadata(uploadId);

        const aesKey = await decryptAESKey(metadataJson.encryptedKeyBase64, privateKeyJWK);

        const nonce = metadataJson.nonceBase64;

        if ("MediaSource" in window) {
            const mediaSource = new MediaSource();
            // Use the provided audio element or create a new one
            const audio = audioElement || document.createElement('audio');
            audio.controls = true;
            
            // Only append to document if we created a new element
            if (!audioElement) {
                document.body.appendChild(audio);
            }    
        
            mediaSource.addEventListener('sourceopen', async () => {
                console.log('✅ MediaSource is now open:', mediaSource.readyState);
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg'); // For MP3
                    await loadChunks(sourceBuffer, metadataJson, aesKey, nonce)
                    .then(() => {
                        console.log("finished")
                        console.log(mediaSource.readyState)
                        console.log(sourceBuffer.buffered.length)
                        console.log(audio.readyState)
                        console.log(HTMLMediaElement.HAVE_METADATA)
                        // Signal end of stream when all chunks are processed
                        mediaSource.endOfStream();
                    })
                    .catch(error => {
                        console.error('Error loading audio chunks:', error);
                    });
                } catch (error) {
                    console.error('Error setting up media source:', error);
                    }
            });

            audio.src = URL.createObjectURL(mediaSource);
        
            // Add error handler
            mediaSource.addEventListener('error', (e) => {
                console.error('MediaSource error:', e);
            });
        }}
    catch(error){
        throw error;
    }
};

  async function loadChunks(sourceBuffer: SourceBuffer, metadata: MetadataResult, aesKey: ArrayBuffer, nonce: string) {
    const chunkPaths = metadata.chunkPaths;
    const baseNonce = base64ToArrayBuffer(nonce);
    
    // Import the AES key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw', 
      aesKey, 
      { name: 'AES-CTR' }, 
      false, 
      ['decrypt']
    );

    if (sourceBuffer.buffered.length > 0) {
        const start = sourceBuffer.buffered.start(0);
        const end = sourceBuffer.buffered.end(0);
    
        if (!sourceBuffer.updating) {
          sourceBuffer.remove(start, end);
    
          // Wait until removal is complete
          await new Promise((resolve) => {
            sourceBuffer.addEventListener('updateend', resolve, { once: true });
          });
        }
    }
    
    // Process chunks in sequence
    for (let i = 0; i < metadata.chunks; i++) {
      console.log('Processing chunk', i);
      await processChunk(i, chunkPaths[i], sourceBuffer, cryptoKey, baseNonce);
    }
  }

  async function processChunk(index: number, chunkPath: string, sourceBuffer: SourceBuffer, cryptoKey: CryptoKey, baseNonce: ArrayBuffer) {
    // Fetch the encrypted chunk
    const { data: chunkData, error: chunkDataError } = await supabase.storage.from(BucketNameUpload)
    .createSignedUrl(chunkPath, 3600);
    
    if (chunkDataError) {
      throw chunkDataError;
    }
    const response = await fetch(chunkData.signedUrl);
    const encryptedData = await response.arrayBuffer();
    
    // Calculate counter offset for this chunk
    const counter = calculateCounterForChunk(baseNonce, index);
    
    // Decrypt the chunk
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: counter,
        length: 128 // Counter length in bits
      },
      cryptoKey,
      encryptedData
    );

    printMagicHeader(decryptedData);
    
    // Wait if the source buffer is updating
    if (sourceBuffer.updating) {
      await new Promise(resolve => {
        sourceBuffer.addEventListener('updateend', resolve, { once: true });
      });
    }

    console.log("✅ Chunk processed:", index);

    if (!sourceBuffer || sourceBuffer.updating || sourceBuffer.buffered.length < 0) {
        throw new Error(`🚨 Invalid SourceBuffer state before appending chunk ${index}`);
      }
    
    // Append to the media source
    sourceBuffer.appendBuffer(decryptedData);
    
    // Wait for this chunk to be processed
    return new Promise(resolve => {
      sourceBuffer.addEventListener('updateend', resolve, { once: true });
    });
  }

  function calculateCounterForChunk(baseNonce: ArrayBuffer, chunkIndex: number) {
    const counter = new Uint8Array(baseNonce); // 16 bytes

    const dataView = new DataView(counter.buffer);
    const offsetBlocks = chunkIndex * (CHUNK_SIZE / 16); // 16 bytes per AES block

    const oldCounter = dataView.getBigUint64(8, true); // last 8 bytes (little endian)
    dataView.setBigUint64(8, oldCounter + BigInt(offsetBlocks), true);

    return counter;
  }