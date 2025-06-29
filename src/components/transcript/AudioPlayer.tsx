"use client";

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2 } from 'lucide-react';
import { setupDecryptedAudioPlayer } from '@/lib/decryption/client';

interface AudioPlayerProps {
  uploadId: string;
  uploadDuration: number;
  fileName: string;
  onTimeChange?: (time: number) => void;
}

function EncryptedAudioPlayer({ uploadId, handleTimeUpdate, handleLoadedMetadata, setIsPlaying, audioRef, setIsAudioReady }: { 
  uploadId: string, 
  handleTimeUpdate: () => void, 
  handleLoadedMetadata: () => void, 
  setIsPlaying: (isPlaying: boolean) => void, 
  audioRef: React.RefObject<HTMLAudioElement | null>,
  setIsAudioReady: (ready: boolean) => void 
}) {
  
  // Track whether we've already set up this audio player
  const setupCompleted = useRef(false);
  
  // Only run this once per upload ID / audio ref combination
  useEffect(() => {
    // Early return if no upload ID, no audio element, or setup was already completed
    if (!uploadId || !audioRef.current || setupCompleted.current) {
      return;
    }
    
    // Get the private key
    const privateKeyJWK = sessionStorage.getItem("privateKey");
    if (!privateKeyJWK) {
      console.error("Private key not found in session storage.");
      setIsAudioReady(false);
      return;
    }
    
    const privateKeyStr = JSON.parse(privateKeyJWK);
    
    // Mark as started to prevent duplicate attempts
    setupCompleted.current = true;
    
    // Set loading state to true when starting decryption
    setIsAudioReady(false);
    console.log("Starting encrypted audio setup for:", uploadId);
    
    // Setup the decrypted audio player
    setupDecryptedAudioPlayer(uploadId, privateKeyStr.privateKey, audioRef.current)
      .then(() => {
        console.log("Audio player setup completed successfully");
        
        // Audio is now ready
        setIsAudioReady(true);
        
        // Only add event listeners if we still have a valid audio element
        if (audioRef.current) {
          // Function references to use for both adding and cleanup
          const timeUpdateHandler = handleTimeUpdate;
          const metadataHandler = handleLoadedMetadata;
          const endedHandler = () => setIsPlaying(false);
          const errorHandler = (event: Event) => {
            const audioEl = event.target as HTMLAudioElement;
            const mediaError = audioEl.error;
            
            let errorMessage = "Unknown error";
            if (mediaError) {
              errorMessage = `Code: ${mediaError.code}, Message: ${mediaError.message || 'No details'}`;
            }
            
            console.error("Audio playback error", errorMessage);
          };
          
          // Add all event listeners
          audioRef.current.addEventListener('timeupdate', timeUpdateHandler);
          audioRef.current.addEventListener('loadedmetadata', metadataHandler);
          audioRef.current.addEventListener('ended', endedHandler);
          audioRef.current.addEventListener('error', errorHandler);
          
          // Cleanup function to remove event listeners when component unmounts
          const cleanup = () => {
            if (audioRef.current) {
              audioRef.current.removeEventListener('timeupdate', timeUpdateHandler);
              audioRef.current.removeEventListener('loadedmetadata', metadataHandler);
              audioRef.current.removeEventListener('ended', endedHandler);
              audioRef.current.removeEventListener('error', errorHandler);
            }
          };
          
          // Store cleanup function for when component unmounts
          return cleanup;
        }
      })
      .catch(error => {
        console.error('Error setting up encrypted audio:', error);
        setupCompleted.current = false; // Allow retry on error

        if (error = "Encrypting audio file") {
          console.log(error);
          setIsAudioReady(false);
          return;
        }
        // Set audio as not ready on error
        setIsAudioReady(false);
      });
  }, [uploadId, audioRef, setIsAudioReady]); // Added setIsAudioReady to dependencies
  
  return null; // We don't need to render anything
}

export const AudioPlayer = forwardRef<{ seekTo: (time: number) => void }, AudioPlayerProps>(
  ({ uploadId, uploadDuration, fileName, onTimeChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(uploadDuration);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle playback speed change
  const changePlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedOptions(false);
    }
  };

  // Close speed menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeChange?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = uploadDuration;
      console.log("Audio duration:", audioDuration);
      if (isFinite(audioDuration)) {
        setDuration(audioDuration);
        console.log("Metadata loaded, audio duration:", audioDuration);
      } else {
        console.warn("Audio duration is not finite:", audioDuration);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current && isFinite(newTime) && audioRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const validTime = Math.min(Math.max(newTime, 0), audioRef.current.duration || 0);
      audioRef.current.currentTime = validTime;
      console.log(`Setting current time to ${validTime}`);
    }
  };

  // Helper function to format timestamps
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Expose seekTo function through ref
  useEffect(() => {
    if (ref && typeof ref === 'object') {
      ref.current = {
        seekTo: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }
      };
    }
  }, [ref]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 border-t border-[#2a2a2a] p-3 py-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        <div className="text-sm text-center font-medium text-gray-300 mb-1">
          {fileName}
        </div>
        
        {!isAudioReady && (
          <div className="py-3 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Decrypting audio...</span>
            </div>
          </div>
        )}
        
        {isAudioReady && (
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlayPause}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-gray-400 w-12 text-right">
                {formatTimestamp(currentTime)}
              </span>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-400 w-12">
                {formatTimestamp(duration)}
              </span>
            </div>
            
            {/* Playback speed control */}
            <div className="relative" ref={speedMenuRef}>
              <button 
                onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                className="flex items-center justify-center px-2 py-1 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors text-xs text-gray-300"
              >
                {playbackRate}x
              </button>
              
              {showSpeedOptions && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg p-1 w-24">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`block w-full text-left px-2 py-1 text-xs rounded ${playbackRate === rate ? 'bg-[#2a2a2a] text-white' : 'text-gray-300 hover:bg-[#2a2a2a]'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-28">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        className="hidden"
      />
      <EncryptedAudioPlayer 
        uploadId={uploadId} 
        handleTimeUpdate={handleTimeUpdate} 
        handleLoadedMetadata={handleLoadedMetadata} 
        setIsPlaying={setIsPlaying} 
        audioRef={audioRef}
        setIsAudioReady={setIsAudioReady}
      />
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
