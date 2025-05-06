"use client";

import { useState, useEffect, useRef, SyntheticEvent } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/UseToast';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
}

export function AudioPlayer({ audioUrl, fileName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Helper function to format timestamps
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a]/50 backdrop-blur-sm border-[#3a3a3a]/50 border-t border-[#2a2a2a] p-3 py-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        <div className="text-sm text-center font-medium text-gray-300 mb-1">
          {fileName}
        </div>
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
      </div>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={(e: SyntheticEvent<HTMLAudioElement, Event>) => {
          console.error("Audio error:", e);
          toast({
            title: "Audio playback error",
            description: "There was an error playing the audio file. Try downloading it instead.",
            variant: "destructive"
          });
        }}
        className="hidden"
      />
    </div>
  );
}
