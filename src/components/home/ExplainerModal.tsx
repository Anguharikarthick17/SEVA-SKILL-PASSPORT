'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Subtitles,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface Chapter {
  title: string;
  time: number;
  label: string;
}

const CHAPTERS: Chapter[] = [
  { time: 0, label: '0:00', title: 'The Challenge' },
  { time: 4, label: '0:04', title: '1. Learn' },
  { time: 9, label: '0:09', title: '2. Practise & Build' },
  { time: 15, label: '0:15', title: '3. Assess & Verify' },
  { time: 22, label: '0:22', title: 'Brand Reveal' },
];

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExplainerModal({ isOpen, onClose }: ExplainerModalProps) {
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  // Keyboard navigation (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle open state & autoplay unmuted
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (modalVideoRef.current) {
        modalVideoRef.current.currentTime = 0;
        modalVideoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      document.body.style.overflow = '';
      if (modalVideoRef.current) {
        modalVideoRef.current.pause();
      }
      setShowTranscript(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration) setDuration(v.duration);
  };

  const seekTo = (sec: number) => {
    const v = modalVideoRef.current;
    if (!v) return;
    v.currentTime = sec;
    setCurrentTime(sec);
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    }
  };

  const toggleCaptions = () => {
    const v = modalVideoRef.current;
    if (!v || !v.textTracks || v.textTracks.length === 0) return;
    const track = v.textTracks[0];
    if (showCaptions) {
      track.mode = 'hidden';
      setShowCaptions(false);
    } else {
      track.mode = 'showing';
      setShowCaptions(true);
    }
  };

  const toggleFullscreen = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      v.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explainer-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-milan-600/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cream-50 via-white to-cream-50 border-b border-milan-600/15">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-milan-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="explainer-modal-title" className="text-sm font-extrabold text-espresso-900 leading-tight">
                SEVA Skill Passport — Official 30s Explainer
              </h3>
              <p className="text-[11px] text-espresso-muted">
                Learn Skills. Build Ability. Prove What You Can Do.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-milan-100 border border-milan-600/20 flex items-center justify-center text-espresso-900 hover:text-milan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-milan-600"
            aria-label="Close explainer video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={modalVideoRef}
            src="/videos/seva-explainer-master.mp4"
            poster="/videos/seva-explainer-poster.webp"
            playsInline
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            aria-label="Full SEVA Explainer Video with Audio"
          >
            <track
              kind="captions"
              src="/captions/seva-explainer.vtt"
              srcLang="en"
              label="English Captions"
              default
            />
          </video>

          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-milan-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-milan-600 transition-all border border-white/40 focus:outline-none"
              aria-label="Play video"
            >
              <Play className="w-7 h-7 fill-white ml-0.5" />
            </button>
          )}
        </div>

        {/* Scrubber Progress Bar */}
        <div className="px-5 pt-3 pb-1 bg-white">
          <div
            className="relative w-full h-2 bg-cream-200 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-milan-600 to-milan-bright rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Chapter Seek Markers */}
          <div className="flex items-center justify-between text-[11px] text-espresso-muted pt-1.5">
            <div className="flex items-center gap-1 sm:gap-2">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => seekTo(ch.time)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    currentTime >= ch.time &&
                    (idx === CHAPTERS.length - 1 || currentTime < CHAPTERS[idx + 1].time)
                      ? 'bg-milan-600 text-white'
                      : 'bg-cream-100 hover:bg-milan-50 text-espresso-900 border border-milan-600/15'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
            <div className="font-mono text-xs text-espresso-900 font-bold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="px-5 py-3 bg-white border-t border-milan-600/10 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-milan-50 hover:bg-milan-100 border border-milan-600/25 text-milan-600 font-bold transition-all focus:outline-none"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-milan-600" /> : <Play className="w-4 h-4 fill-milan-600 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-milan-600/20 text-espresso-900 transition-all focus:outline-none"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-milan-600" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleCaptions}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${
                showCaptions
                  ? 'bg-milan-600 text-white border-milan-600'
                  : 'bg-cream-50 text-espresso-900 border-milan-600/20 hover:bg-cream-100'
              }`}
              aria-label="Toggle closed captions"
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>CC</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${
                showTranscript
                  ? 'bg-espresso-900 text-white border-espresso-900'
                  : 'bg-cream-50 text-espresso-900 border-milan-600/20 hover:bg-cream-100'
              }`}
              aria-label="Toggle transcript"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transcript</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-milan-600/20 text-espresso-900 transition-all focus:outline-none"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Transcript Panel */}
        {showTranscript && (
          <div className="px-5 py-4 bg-cream-50 border-t border-milan-600/15 overflow-y-auto max-h-48 text-xs space-y-2">
            <div className="font-bold uppercase tracking-wider text-[10px] text-milan-600">
              Full Narration Transcript
            </div>
            <p className="leading-relaxed text-espresso-800">
              <strong>[0:00 - 0:04]</strong> &ldquo;Learning a skill is just the beginning.&rdquo;
            </p>
            <p className="leading-relaxed text-espresso-800">
              <strong>[0:04 - 0:09]</strong> &ldquo;SEVA Skill Passport helps you take the next step. Learn through structured lessons.&rdquo;
            </p>
            <p className="leading-relaxed text-espresso-800">
              <strong>[0:09 - 0:15]</strong> &ldquo;Practise with hands-on labs. Build real projects.&rdquo;
            </p>
            <p className="leading-relaxed text-espresso-800">
              <strong>[0:15 - 0:22]</strong> &ldquo;Test your skills through assessments. Then bring your demonstrated abilities together in a shareable Skill Passport, backed by evidence.&rdquo;
            </p>
            <p className="leading-relaxed text-espresso-800">
              <strong>[0:22 - 0:30]</strong> &ldquo;SEVA Skill Passport. Learn Skills. Build Ability. Prove What You Can Do.&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
