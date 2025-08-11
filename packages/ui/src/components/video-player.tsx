'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../utils/cn';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Subtitles,
  SkipBack,
  SkipForward,
  PictureInPicture,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Types
export interface VideoSource {
  src: string;
  type: string;
  quality?: '360p' | '480p' | '720p' | '1080p' | '4K';
  label?: string;
}

export interface VideoChapter {
  title: string;
  startTime: number;
  endTime?: number;
  thumbnail?: string;
}

export interface VideoSubtitle {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

export interface VideoPlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  sources: VideoSource[];
  subtitles?: VideoSubtitle[];
  chapters?: VideoChapter[];
}

export interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  subtitles?: VideoSubtitle[];
  chapters?: VideoChapter[];
  playlist?: VideoPlaylistItem[];
  currentPlaylistIndex?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onQualityChange?: (quality: string) => void;
  onSubtitleChange?: (srclang: string | null) => void;
  onPlaylistItemChange?: (index: number) => void;
  onError?: (error: Error) => void;
  showDownload?: boolean;
  showShare?: boolean;
  customControls?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({
  sources,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className,
  subtitles = [],
  chapters = [],
  playlist = [],
  currentPlaylistIndex = 0,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onVolumeChange,
  onPlaybackRateChange,
  onQualityChange,
  onSubtitleChange,
  onPlaylistItemChange,
  onError,
  showDownload = false,
  showShare = false,
  customControls = true,
  theme = 'dark'
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState(currentPlaylistIndex);

  // Get current video source
  const currentSource = useMemo(() => {
    if (currentQuality === 'auto') {
      return sources[sources.length - 1]; // Highest quality by default
    }
    return sources.find(s => s.quality === currentQuality) || sources[0];
  }, [sources, currentQuality]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
        onError?.(error);
      });
      setIsPlaying(true);
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause, onError]);

  // Volume control
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
    onVolumeChange?.(clampedVolume);
  }, [onVolumeChange]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      handleVolumeChange(volume || 0.5);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume, handleVolumeChange]);

  // Seek to position
  const seek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, time));
  }, [duration]);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      onError?.(error as Error);
    }
  }, [isFullscreen, onError]);

  // Picture-in-Picture toggle
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (!isPiPActive) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      }
    } catch (error) {
      console.error('PiP error:', error);
      onError?.(error as Error);
    }
  }, [isPiPActive, onError]);

  // Change playback rate
  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    onPlaybackRateChange?.(rate);
  }, [onPlaybackRateChange]);

  // Change quality
  const changeQuality = useCallback((quality: string) => {
    if (!videoRef.current) return;
    const currentTimeBeforeChange = videoRef.current.currentTime;
    const wasPlaying = isPlaying;
    
    setCurrentQuality(quality);
    onQualityChange?.(quality);
    
    // Resume playback at same position
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeBeforeChange;
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
    }, 100);
  }, [isPlaying, onQualityChange]);

  // Change subtitle
  const changeSubtitle = useCallback((srclang: string | null) => {
    setCurrentSubtitle(srclang);
    onSubtitleChange?.(srclang);
  }, [onSubtitleChange]);

  // Play playlist item
  const playPlaylistItem = useCallback((index: number) => {
    if (!playlist[index]) return;
    setPlaylistIndex(index);
    onPlaylistItemChange?.(index);
  }, [playlist, onPlaylistItemChange]);

  // Handle controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Download video
  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = currentSource.src;
    a.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentSource]);

  // Share video
  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Check out this video',
        url: window.location.href
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
      
      // Auto-play next in playlist
      if (playlist.length > 0 && playlistIndex < playlist.length - 1) {
        playPlaylistItem(playlistIndex + 1);
      }
    };

    const handleLeavePiP = () => {
      setIsPiPActive(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [onTimeUpdate, onEnded, playlist, playlistIndex, playPlaylistItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 'c':
          e.preventDefault();
          changeSubtitle(currentSubtitle ? null : subtitles[0]?.srclang || null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay, 
    skip, 
    handleVolumeChange, 
    volume, 
    toggleFullscreen, 
    toggleMute, 
    togglePiP,
    changeSubtitle,
    currentSubtitle,
    subtitles
  ]);

  const themeClasses = theme === 'light' 
    ? 'bg-white text-gray-900' 
    : theme === 'dark'
    ? 'bg-black text-white'
    : 'bg-black text-white dark:bg-white dark:text-gray-900';

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative group overflow-hidden rounded-lg',
        themeClasses,
        className
      )}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={!customControls && controls}
        onClick={togglePlay}
      >
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            src={subtitle.src}
            srcLang={subtitle.srclang}
            label={subtitle.label}
            default={subtitle.default || currentSubtitle === subtitle.srclang}
          />
        ))}
      </video>

      {/* Custom Controls */}
      {customControls && controls && (
        <div className={cn(
          'absolute inset-0 flex flex-col justify-end transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Top Controls Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            {/* Title/Chapter */}
            {chapters.length > 0 && (
              <div className="text-sm font-medium">
                {chapters.find(ch => currentTime >= ch.startTime && (!ch.endTime || currentTime < ch.endTime))?.title}
              </div>
            )}

            {/* Top Right Controls */}
            <div className="flex items-center gap-2 ml-auto">
              {showShare && (
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
              {showDownload && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={togglePiP}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Picture in Picture"
                disabled={!document.pictureInPictureEnabled}
              >
                <PictureInPicture className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-20 left-0 right-0 px-4">
            <div 
              className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
              }}
            >
              {/* Buffered */}
              <div 
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div 
                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {/* Chapters */}
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/50"
                  style={{ left: `${(chapter.startTime / duration) * 100}%` }}
                  title={chapter.title}
                />
              ))}
              {/* Scrubber */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="relative p-4 flex items-center gap-4">
            {/* Play Controls */}
            <div className="flex items-center gap-2">
              {playlist.length > 0 && (
                <button
                  onClick={() => playPlaylistItem(Math.max(0, playlistIndex - 1))}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  disabled={playlistIndex === 0}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => skip(-10)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Skip Backward"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={() => skip(10)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Skip Forward"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              {playlist.length > 0 && (
                <button
                  onClick={() => playPlaylistItem(Math.min(playlist.length - 1, playlistIndex + 1))}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  disabled={playlistIndex === playlist.length - 1}
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-blue-500"
                aria-label="Volume"
              />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Subtitles */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={cn(
                      'p-2 rounded-full hover:bg-white/20 transition-colors',
                      currentSubtitle && 'text-blue-500'
                    )}
                    aria-label="Subtitles"
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                  {showSubtitles && (
                    <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 rounded-lg min-w-[150px]">
                      <button
                        onClick={() => changeSubtitle(null)}
                        className={cn(
                          'block w-full text-left px-3 py-1 rounded hover:bg-white/20',
                          !currentSubtitle && 'bg-white/20'
                        )}
                      >
                        Off
                      </button>
                      {subtitles.map((subtitle) => (
                        <button
                          key={subtitle.srclang}
                          onClick={() => changeSubtitle(subtitle.srclang)}
                          className={cn(
                            'block w-full text-left px-3 py-1 rounded hover:bg-white/20',
                            currentSubtitle === subtitle.srclang && 'bg-white/20'
                          )}
                        >
                          {subtitle.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 rounded-lg min-w-[200px]">
                    {/* Playback Speed */}
                    <div className="mb-2">
                      <div className="text-xs text-gray-400 px-3 py-1">Speed</div>
                      {playbackRates.map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={cn(
                            'block w-full text-left px-3 py-1 rounded hover:bg-white/20',
                            playbackRate === rate && 'bg-white/20'
                          )}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                    {/* Quality */}
                    {sources.length > 1 && (
                      <div>
                        <div className="text-xs text-gray-400 px-3 py-1">Quality</div>
                        <button
                          onClick={() => changeQuality('auto')}
                          className={cn(
                            'block w-full text-left px-3 py-1 rounded hover:bg-white/20',
                            currentQuality === 'auto' && 'bg-white/20'
                          )}
                        >
                          Auto
                        </button>
                        {sources.map((source) => (
                          <button
                            key={source.quality}
                            onClick={() => changeQuality(source.quality!)}
                            className={cn(
                              'block w-full text-left px-3 py-1 rounded hover:bg-white/20',
                              currentQuality === source.quality && 'bg-white/20'
                            )}
                          >
                            {source.quality || source.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Sidebar */}
      {playlist.length > 0 && showPlaylist && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-black/95 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Playlist</h3>
          {playlist.map((item, index) => (
            <button
              key={item.id}
              onClick={() => playPlaylistItem(index)}
              className={cn(
                'w-full flex gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors mb-2',
                index === playlistIndex && 'bg-white/20'
              )}
            >
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-20 h-12 object-cover rounded"
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium line-clamp-2">{item.title}</div>
                <div className="text-xs text-gray-400">{formatTime(item.duration)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}