'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface VideoPlayerProps {
  moduleId: string;
  moduleTitle: string;
  moduleNumber: string;
  conceptTitle: string;
  videoUrl: string;
  captionUrl?: string;
  transcriptUrl?: string;
  durationSeconds?: number;
  initialProgressSeconds?: number;
  onProgressUpdate?: (seconds: number, completed: boolean) => void;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

interface VttCueItem {
  start: number;
  end: number;
  text: string;
}

function parseVttTime(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return 0;
}

function parseVttContent(vtt: string): VttCueItem[] {
  const lines = vtt.split(/\r?\n/);
  const cues: VttCueItem[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let currentTextLines: string[] = [];
  let inCue = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->');
      currentStart = parseVttTime(startStr);
      currentEnd = parseVttTime(endStr);
      currentTextLines = [];
      inCue = true;
    } else if (inCue && line === '') {
      if (currentTextLines.length > 0) {
        cues.push({
          start: currentStart,
          end: currentEnd,
          text: currentTextLines.join(' ')
        });
      }
      inCue = false;
    } else if (inCue && !line.startsWith('NOTE') && !line.match(/^\d+$/)) {
      currentTextLines.push(line);
    }
  }

  if (inCue && currentTextLines.length > 0) {
    cues.push({
      start: currentStart,
      end: currentEnd,
      text: currentTextLines.join(' ')
    });
  }

  return cues;
}

export default function VideoLessonPlayer({
  moduleId,
  moduleTitle,
  moduleNumber,
  conceptTitle,
  videoUrl,
  captionUrl,
  transcriptUrl,
  durationSeconds = 0,
  initialProgressSeconds = 0,
  onProgressUpdate,
  onComplete,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cues, setCues] = useState<VttCueItem[]>([]);
  const [activeCueText, setActiveCueText] = useState<string>('');

  // Resume playback on mount if initialProgress provided
  useEffect(() => {
    if (videoRef.current && initialProgressSeconds > 0) {
      videoRef.current.currentTime = initialProgressSeconds;
      setCurrentTime(initialProgressSeconds);
    }
  }, [initialProgressSeconds]);

  // Load captions and parse cues
  useEffect(() => {
    if (!captionUrl) {
      setCues([]);
      setActiveCueText('');
      return;
    }
    fetch(captionUrl)
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        if (text) {
          setCues(parseVttContent(text));
        }
      })
      .catch(() => setCues([]));
  }, [captionUrl]);

  // Load transcript when requested or available
  useEffect(() => {
    if (transcriptUrl) {
      fetch(transcriptUrl)
        .then((res) => {
          if (res.ok) return res.text();
          throw new Error('Transcript not found');
        })
        .then((text) => setTranscriptText(text))
        .catch(() => setTranscriptText(''));
    }
  }, [transcriptUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Time update and completion tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || durationSeconds;
    setCurrentTime(current);
    setDuration(dur);

    // Sync active caption cue
    const currentCue = cues.find((c) => current >= c.start && current <= c.end);
    setActiveCueText(currentCue ? currentCue.text : '');

    const completed = dur > 0 && current / dur >= 0.9;
    if (completed && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }

    onProgressUpdate?.(current, completed);
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Speed change
  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format time (MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Video Container (Cinema Milan Red & Deep Espresso Frame) */}
      <div
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden bg-[#1C0D12] border-2 border-milan-600/30 shadow-2xl transition-all"
      >
        {/* Main Video Element */}
        <div className="relative aspect-video flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setIsCompleted(true);
              onComplete?.();
            }}
            onError={() => setHasError(true)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            playsInline
          >
            {captionUrl && (
              <track
                kind="subtitles"
                label="English"
                src={captionUrl}
                srcLang="en"
              />
            )}
          </video>

          {/* Dedicated Subtitle Safe Area Banner */}
          {showCaptions && activeCueText && (
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-10 flex justify-center pointer-events-none z-20">
              <div className="bg-[#1C0D12]/92 border border-[#881337]/60 text-[#FFE4E6] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold max-w-2xl text-center shadow-2xl backdrop-blur-md leading-relaxed animate-fade-in">
                {activeCueText}
              </div>
            </div>
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-10">
              <div className="w-12 h-12 border-4 border-[#881337] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Big Play Overlay (when paused) */}
          {!isPlaying && !hasError && !isBuffering && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9F1239] to-[#881337] flex items-center justify-center text-white shadow-xl shadow-milan-600/40 group-hover:scale-110 transition-transform">
                <Play className="w-9 h-9 fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Error Fallback */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C0D12] p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 text-milan-600 mb-3" />
              <h4 className="text-lg font-bold">Media Stream Initializing</h4>
              <p className="text-xs text-white/70 max-w-md mt-1">
                The video stream for Module {moduleNumber} is compiling. Please refresh or read the synchronized transcript below.
              </p>
            </div>
          )}

          {/* Top Info Bar */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-milan-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Module {moduleNumber}
              </span>
              <span className="text-xs text-white/90 font-medium truncate max-w-sm sm:max-w-md">
                {conceptTitle}
              </span>
            </div>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold rounded-full backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lesson Completed
              </span>
            )}
          </div>
        </div>

        {/* Video Control Bar */}
        <div className="p-4 bg-gradient-to-t from-black via-black/90 to-black/60 text-white space-y-3">
          {/* Progress Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/70 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9F1239]"
            />
            <span className="text-xs font-mono text-white/70 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Play/Pause & Skip */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, currentTime - 10);
                  }
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/80"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-milan-600" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Playback Speed, Captions, Transcript & Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Speed Selector */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-xs font-mono">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-milan-600 text-white font-bold'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Captions Toggle */}
              {captionUrl && (
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`p-2 rounded-lg transition-colors ${
                    showCaptions ? 'bg-milan-600 text-white' : 'hover:bg-white/10 text-white/70'
                  }`}
                  title="Toggle Synchronized Captions"
                >
                  <Subtitles className="w-4 h-4" />
                </button>
              )}

              {/* Transcript Toggle */}
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-2 rounded-lg transition-colors ${
                  showTranscript ? 'bg-milan-600 text-white' : 'hover:bg-white/10 text-white/70'
                }`}
                title="Toggle Script & Transcript"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons (Prev / Next Lesson) */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            hasPrevious
              ? 'bg-[#FFFDF7] text-espresso-900 border-milan-600/20 hover:border-milan-600/40 hover:bg-white shadow-sm'
              : 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous Lesson
        </button>

        <span className="text-xs text-espresso-muted font-medium">
          Lesson Completion: {Math.round((currentTime / (duration || 1)) * 100)}%
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            hasNext
              ? 'bg-gradient-to-r from-[#9F1239] to-[#881337] text-white hover:opacity-95 shadow-milan-600/20'
              : 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border border-stone-200'
          }`}
        >
          Next Lesson
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transcript Drawer / Tab */}
      {showTranscript && (
        <div className="p-6 rounded-3xl bg-white border border-milan-600/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-milan-600/10">
            <div className="flex items-center gap-2 text-milan-600 font-extrabold text-sm uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              Verified Spoken Lesson Transcript
            </div>
            <span className="text-[11px] text-espresso-muted font-mono">
              Module {moduleNumber} · Synchronized Audio
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 text-xs leading-relaxed text-espresso-800 font-sans pr-2">
            {transcriptText ? (
              <div className="whitespace-pre-wrap font-sans">{transcriptText}</div>
            ) : (
              <p className="text-espresso-muted italic">Transcript loading or unavailable.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
