"use client";

import { supabase } from "@/lib/supabase/client";
import { BucketNameUpload } from "@/constants/SupabaseBucket";

// Extend HTMLAudioElement to include our custom property
declare global {
  interface HTMLAudioElement {
    lastSeekTime?: number;
  }
}

interface ChunkMetadata {
    index: number;
    start_time: number;
    end_time: number;
    path: string;
}

interface MetadataResult {
    encryptedKeyBase64: string;
    nonceBase64: string;
    algorithm: string;
    chunkMetadata: ChunkMetadata[];
    chunks: number;
}

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

// function printMagicHeader(buffer: ArrayBuffer) {
//   const bytes = new Uint8Array(buffer);
  
//   // Print first 16 bytes in hex
//   const hexHeader = Array.from(bytes.slice(0, 16))
//     .map(b => b.toString(16).padStart(2, '0'))
//     .join(' ');
//   console.log(`Chunk header (hex): ${hexHeader}`);
  
//   // Check for MP3 frame header
//   if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
//     console.log(`Chunk: VALID MP3 frame header found`);
//   } else {
//     console.log(`Chunk: NO valid MP3 frame header`);
    
//     // Search for frame header in first 100 bytes
//     for (let i = 0; i < Math.min(100, bytes.length - 1); i++) {
//       if (bytes[i] === 0xFF && (bytes[i+1] & 0xE0) === 0xE0) {
//         console.log(`  Found MP3 frame at offset ${i}: ${bytes[i].toString(16)} ${bytes[i+1].toString(16)}`);
//         break;
//       }
//     }
//   }
  
//   console.log(`Chunk size: ${buffer.byteLength} bytes`);
//   }

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
        chunkMetadata: metadataJson.chunk_metadata,
        chunks: metadataJson.chunks,
    }

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

export async function setupDecryptedAudioPlayer(uploadId: string, uploadDuration: number, privateKeyJWK: JsonWebKey, audioElement?: HTMLAudioElement, onBufferStart?: () => void, onBufferEnd?: () => void) {
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
        
            const p = new Promise(async (resolve, reject) => {
              mediaSource.addEventListener('sourceopen', async () => {
                console.log('✅ MediaSource is now open:', mediaSource.readyState);
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg'); // For MP3  
                    mediaSource.duration = uploadDuration;                    
                    await loadChunks(sourceBuffer, metadataJson, aesKey, nonce, audio, uploadDuration, onBufferStart, onBufferEnd)
                    .catch(error => {
                        console.error('Error loading audio chunks:', error);
                    })

                    resolve(() => {
                      console.log("Cleaning up audio player resources...");
                      if (mediaSource.readyState === 'open') {
                          mediaSource.endOfStream();
                      }
                      URL.revokeObjectURL(audio.src);
                  });
                } catch (error) {
                    reject(error);
                }
              }, { once: true })
            });

            audio.src = URL.createObjectURL(mediaSource);
        
            // Add error handler
            mediaSource.addEventListener('error', (e) => {
                console.error('MediaSource error:', e);
            });

            return p;
        }}
    catch(error){
        throw error;
    }
};

async function loadChunks(sourceBuffer: SourceBuffer, metadata: MetadataResult, aesKey: ArrayBuffer, nonce: string, audio: HTMLAudioElement, uploadDuration: number, onBufferStart?: () => void, onBufferEnd?: () => void) {
    const chunks = metadata.chunkMetadata;
    const baseNonce = base64ToArrayBuffer(nonce);
    let isChunkLoading = false;
    
    // Import the AES key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw', 
      aesKey, 
      { name: 'AES-CTR' }, 
      false, 
      ['decrypt']
    );

    // Track which chunks have been loaded
    const loadedChunks = new Set<number>();
    
    // Initialize lastSeekTime
    audio.lastSeekTime = 0;
    
    // Initial buffer management
    if (sourceBuffer.buffered.length > 0) {
      const start = sourceBuffer.buffered.start(0);
      const end = sourceBuffer.buffered.end(0);
  
      if (!sourceBuffer.updating) {
        sourceBuffer.remove(start, end);
  
        // Wait until removal is complete
        await new Promise((resolve) => {
          const handleUpdateEnd = () => {
            resolve(undefined);
          };
          sourceBuffer.addEventListener('updateend', handleUpdateEnd, { once: true });
        });
      }
    }
    
    // Function to wait for source buffer to finish updating
    const waitForSourceBuffer = async () => {
      if (sourceBuffer.updating) {
        return new Promise<void>(resolve => {
          sourceBuffer.addEventListener('updateend', () => {
            resolve();
          }, { once: true });
        });
      } else {
        return Promise.resolve();
      }
    };
    

    // Function to manage buffer and remove old chunks
    const manageBuffer = async (currentChunkIndex: number) => {
      if (sourceBuffer.buffered.length === 0) return;
      
      // Find chunks to remove - anything before the current chunk
      const chunksToRemove = [...loadedChunks].filter(idx => idx < currentChunkIndex || idx > currentChunkIndex + 1);
      
      if (chunksToRemove.length === 0) return;
            
      // Get all buffered ranges
      const bufferedRanges = [];
      for (let i = 0; i < sourceBuffer.buffered.length; i++) {
        bufferedRanges.push({
          start: sourceBuffer.buffered.start(i),
          end: sourceBuffer.buffered.end(i)
        });
      }
      
      // Process removals sequentially
      for (const chunkIndex of chunksToRemove) {
        const chunk = chunks[chunkIndex];
        if (!chunk) {
          console.log(`No chunk data for index ${chunkIndex}`);
          continue;
        }
        
        // Find the buffered range that contains this chunk
        for (const range of bufferedRanges) {
          const epsilon = 0.05; // tolerance for float precision
          if (chunk.start_time >= range.start && chunk.end_time <= range.end + epsilon) {
            try {
              // Make sure no operation is in progress
              await waitForSourceBuffer();
              
              console.log(`Removing chunk ${chunkIndex} from buffer (${chunk.start_time}s to ${chunk.end_time}s)`);
              sourceBuffer.remove(chunk.start_time, chunk.end_time);
              
              // Wait for removal to complete before continuing
              await waitForSourceBuffer();
              
              console.log(`Finished removing chunk ${chunkIndex}`);
              loadedChunks.delete(chunkIndex);
              console.log('Loaded chunks', loadedChunks)
              break;
            } catch (error) {
              console.error(`Error removing chunk ${chunkIndex}:`, error);
            }
          }
        }
      }
    };

    // Function to load a specific chunk and its neighbors
    const loadChunkAtTime = async (currentTime: number) => {
      // Find the chunk that contains the current time
      const currentChunk = chunks.find(chunk => 
        currentTime >= chunk.start_time && currentTime <= chunk.end_time
      );
      
      if (!currentChunk) {
        console.log(`No chunk found for current time ${currentTime}`);
        return;
      }
      
      const chunkIndex = currentChunk.index;
      
      // Define the range of chunks to load (current + next chunk)
      const startIdx = chunkIndex;
      const endIdx = Math.min(chunkIndex + 1, chunks.length - 1);
      
      // If this is a seek operation (significant time change), manage the buffer
      const isSeek = Math.abs(audio.currentTime - (audio.lastSeekTime || 0)) > 30;
      if (isSeek) {
        await manageBuffer(chunkIndex);
      }

      await waitForSourceBuffer();
      
      // Load the chunks in sequence if not already loaded
      for (let i = startIdx; i <= endIdx; i++) {
        if (!loadedChunks.has(i)) {
          if (loadedChunks.size > 2) {
            sourceBuffer.remove(0, uploadDuration || Infinity);
            await waitForSourceBuffer();
            loadedChunks.clear();
          }
          try {
            loadedChunks.add(i);
            if (isSeek) {
              await processChunk(i, chunks[i].path, sourceBuffer, cryptoKey, baseNonce, chunks[i].start_time);
            } else {
              await processChunk(i, chunks[i].path, sourceBuffer, cryptoKey, baseNonce);
            }
          } catch (error) {
            console.error(`Failed to load chunk ${i}:`, error);
          }
        }
      }
      
      // Update the last seek time
      audio.lastSeekTime = audio.currentTime;
    };

    // Function to decrypt and append a single chunk
    async function processChunk(index: number, path: string, sourceBuffer: SourceBuffer, key: CryptoKey, baseNonce: ArrayBuffer, startTime?: number) {
      onBufferStart?.();
      try {
        // Fetch the encrypted chunk
        const { data: chunkData, error: chunkDataError } = await supabase.storage.from(BucketNameUpload)
        .createSignedUrl(path, 3600);
        
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
          key,
          encryptedData
        );

        // printMagicHeader(decryptedData);
        console.log("chunk", index, "startTime", startTime)
        
        // Important: wait for any pending buffer operations to complete
        await waitForSourceBuffer();
        console.log("buffered", sourceBuffer.updating)
        if (startTime) {
          sourceBuffer.timestampOffset = startTime;
        }
        sourceBuffer.appendBuffer(decryptedData);
        
        // Wait for append to complete
        return new Promise(resolve => {
          sourceBuffer.addEventListener('updateend', () => {
            onBufferEnd?.();
            resolve(undefined);
          }, { once: true });
        });
      } catch (error) {
        console.error(`Error processing chunk ${index}:`, error);
        onBufferEnd?.(); // Ensure we end buffering on error
        throw error;
      }
    } 
    
    // Load initial chunks based on starting position
    await loadChunkAtTime(audio.currentTime);
    
    // Set up event listeners for time updates and seeking
    const timeUpdateHandler = async () => {
      if (isChunkLoading) {
        return;
      }

      // Check if we've moved to a new chunk
      const currentChunk = chunks.find(chunk => 
        audio.currentTime >= chunk.start_time && audio.currentTime <= chunk.end_time
      );
      
      if (currentChunk && currentChunk.index < chunks.length - 1) {
        if (!loadedChunks.has(currentChunk.index + 1)) {
          try {
            isChunkLoading = true;
            await waitForSourceBuffer();
            await loadChunkAtTime(audio.currentTime);
          } finally {
            isChunkLoading = false;
          }
        }
      }
    };
    
    const seekHandler = async () => {
      if (isChunkLoading) {
        await waitForSourceBuffer();
      }
      try {
        isChunkLoading = true;
        if (audio.currentTime !== 0) {
          const currentChunk = chunks.find(chunk => 
            audio.currentTime >= chunk.start_time && audio.currentTime <= chunk.end_time
          );
          if (currentChunk && (loadedChunks.has(currentChunk.index) == false)) {
            sourceBuffer.remove(0, uploadDuration || Infinity);
            await waitForSourceBuffer();
            loadedChunks.clear();
          }
        }
        await loadChunkAtTime(audio.currentTime);
      } catch (error) {
        console.error('Error in seek handler:', error);
      } finally {
        isChunkLoading = false;
      }
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', timeUpdateHandler);
    audio.addEventListener('seeking', seekHandler);
  }

  function calculateCounterForChunk(baseNonce: ArrayBuffer, chunkIndex: number) {
    // Create a copy of the nonce
    const counter = new Uint8Array(baseNonce.slice(0));
    const dataView = new DataView(counter.buffer);
    
    const offsetBlocks = chunkIndex * (CHUNK_SIZE / 16);
    
    // Get the current counter value (last 8 bytes)
    const oldCounter = dataView.getBigUint64(8, true); // little endian
    
    // Add the offset and update
    dataView.setBigUint64(8, oldCounter + BigInt(offsetBlocks), true);
        
    return counter;
}