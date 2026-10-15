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
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Chapter {
  title: string;
  time: number; // in seconds
  label: string;
}

const CHAPTERS: Chapter[] = [
  { time: 0, label: '0:00', title: 'The Challenge' },
  { time: 4, label: '0:04', title: '1. Learn' },
  { time: 9, label: '0:09', title: '2. Practise & Build' },
  { time: 15, label: '0:15', title: '3. Assess & Verify' },
  { time: 22, label: '0:22', title: 'Brand Reveal' },
];

export default function HeroExplainerVideo() {
  // Hero Preview State
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [hasAutoplayFailed, setHasAutoplayFailed] = useState(false);

  // Full Explainer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(false);
  const [modalCurrentTime, setModalCurrentTime] = useState(0);
  const [modalDuration, setModalDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  // 1. Reduced-motion & IntersectionObserver for preview
  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      video.pause();
      setIsPlayingPreview(false);
    } else {
      video.play().catch(() => {
        setHasAutoplayFailed(true);
        setIsPlayingPreview(false);
      });
    }

    // Pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            video.pause();
          } else if (isPlayingPreview && !mediaQuery.matches) {
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (isPlayingPreview && !mediaQuery.matches) {
        video.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlayingPreview]);

  // 2. Toggle Hero Preview Play/Pause
  const togglePreviewPlay = () => {
    const video = previewVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlayingPreview(true);
      setHasAutoplayFailed(false);
    } else {
      video.pause();
      setIsPlayingPreview(false);
    }
  };

  // 3. Open Modal for Full Explainer
  const openModal = () => {
    // Pause hero preview while modal is active
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // 4. Close Modal
  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setIsModalOpen(false);
    setShowTranscript(false);
    document.body.style.overflow = '';
    // Resume preview if it was playing
    if (isPlayingPreview && previewVideoRef.current) {
      previewVideoRef.current.play().catch(() => {});
    }
  };

  // Handle Escape key in modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // 5. Modal Video Controls
  useEffect(() => {
    if (isModalOpen && modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().then(() => {
        setIsModalPlaying(true);
      }).catch(() => {
        setIsModalPlaying(false);
      });
    }
  }, [isModalOpen]);

  const toggleModalPlay = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsModalPlaying(true);
    } else {
      v.pause();
      setIsModalPlaying(false);
    }
  };

  const toggleModalMute = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleModalTimeUpdate = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    setModalCurrentTime(v.currentTime);
    if (v.duration) setModalDuration(v.duration);
  };

  const seekTo = (sec: number) => {
    const v = modalVideoRef.current;
    if (!v) return;
    v.currentTime = sec;
    setModalCurrentTime(sec);
    if (v.paused) {
      v.play();
      setIsModalPlaying(true);
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
    <div ref={containerRef} className="relative mx-auto lg:ml-auto lg:mr-0 max-w-[460px] lg:max-w-[490px] xl:max-w-[530px] 2xl:max-w-[560px] w-full px-1 sm:px-0">
      {/* ── Layered Crimson & Chiffon Ambient Depth Frames ── */}
      <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-br from-[#881337]/30 to-[#4C0519]/40 rounded-3xl transform rotate-1 blur-sm opacity-50 pointer-events-none" />
      <div className="absolute -inset-1 bg-gradient-to-br from-[#9F1239]/40 to-[#881337]/50 rounded-3xl transform -rotate-1 opacity-60 pointer-events-none" />

      {/* ── Main Premium Video Container ── */}
      <div className="relative z-20 rounded-2xl sm:rounded-3xl bg-white border border-milan-600/25 shadow-[0_20px_50px_-15px_rgba(136, 19, 55,0.28),0_8px_20px_-5px_rgba(28, 13, 18,0.08)] overflow-hidden flex flex-col">
        {/* Top Header Bar (macOS Window styling with SEVA identity) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-cream-50 via-white to-cream-50 border-b border-milan-600/15 select-none">
          {/* Traffic lights & Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10" />
            </div>
            <div className="h-4 w-px bg-milan-600/15 mx-1" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-espresso-900">
              <ShieldCheck className="w-3.5 h-3.5 text-milan-600" />
              <span>SEVA Platform Explainer</span>
            </div>
          </div>

          {/* Live Platform Preview Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-milan-50 border border-milan-600/20 text-[10px] font-bold text-milan-600">
            <span className="w-1.5 h-1.5 rounded-full bg-milan-600 animate-pulse" />
            <span className="tracking-wide">PREVIEW</span>
          </div>
        </div>

        {/* Video Area (Aspect 16:9, matching cream background #FFFDF7, object-contain to preserve 100% of the composition) */}
        <div className="relative aspect-video bg-[#FFFDF7] overflow-hidden group flex items-center justify-center p-1 sm:p-2">
          <video
            ref={previewVideoRef}
            src="/videos/seva-explainer-hero.mp4"
            poster="/videos/seva-explainer-poster.webp"
            muted
            playsInline
            loop
            autoPlay
            aria-label="SEVA Skill Passport Platform Explainer Preview"
            className="w-full h-full object-contain"
          />

          {/* Center Play Button if autoplay was blocked or paused */}
          {(!isPlayingPreview || hasAutoplayFailed) && (
            <button
              onClick={togglePreviewPlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-milan-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-milan-600 transition-all border border-white/40 focus:outline-none focus:ring-4 focus:ring-milan-600/50 z-20"
              aria-label="Play video preview"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>
          )}
        </div>

        {/* Card Footer: Credibility & Prominent Full Story / Watch with Audio CTA */}
        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-cream-50 via-[#FFE4E6]/30 to-cream-50 border-t border-milan-600/15 flex items-center justify-between text-xs gap-2 select-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-espresso-900 text-[11px] sm:text-xs">Proven Ability Engine</span>
            <span className="text-espresso-muted hidden sm:inline text-[11px]">• Real Evidence</span>
          </div>

          <button
            onClick={openModal}
            className="glow-button px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 text-white shadow-md hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-milan-600"
            id="hero-watch-full-explainer"
            aria-label="Watch full 30-second explainer video with audio"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Watch Full Explainer (0:30)</span>
          </button>
        </div>
      </div>

      {/* ── FULL EXPLAINER MASTER MODAL (With Audio, Captions & Transcript) ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explainer-modal-title"
        >
          {/* Modal Card */}
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

              {/* Close Button */}
              <button
                onClick={closeModal}
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
                onTimeUpdate={handleModalTimeUpdate}
                onEnded={() => setIsModalPlaying(false)}
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

              {/* Large Play Overlay if paused */}
              {!isModalPlaying && (
                <button
                  onClick={toggleModalPlay}
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
                  seekTo(pos * modalDuration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-milan-600 to-milan-bright rounded-full transition-all"
                  style={{ width: `${(modalCurrentTime / modalDuration) * 100}%` }}
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
                        modalCurrentTime >= ch.time &&
                        (idx === CHAPTERS.length - 1 || modalCurrentTime < CHAPTERS[idx + 1].time)
                          ? 'bg-milan-600 text-white'
                          : 'bg-cream-100 hover:bg-milan-50 text-espresso-900 border border-milan-600/15'
                      }`}
                    >
                      {ch.title}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-xs text-espresso-900 font-bold">
                  {formatTime(modalCurrentTime)} / {formatTime(modalDuration)}
                </div>
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="px-5 py-3 bg-white border-t border-milan-600/10 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause */}
                <button
                  onClick={toggleModalPlay}
                  className="p-2 rounded-xl bg-milan-50 hover:bg-milan-100 border border-milan-600/25 text-milan-600 font-bold transition-all focus:outline-none"
                  aria-label={isModalPlaying ? "Pause video" : "Play video"}
                >
                  {isModalPlaying ? <Pause className="w-4 h-4 fill-milan-600" /> : <Play className="w-4 h-4 fill-milan-600 ml-0.5" />}
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={toggleModalMute}
                  className="p-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-milan-600/20 text-espresso-900 transition-all focus:outline-none"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-milan-600" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Captions Toggle */}
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
                {/* Transcript Toggle */}
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

                {/* Fullscreen */}
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
                <div className="font-bold text-espresso-900 uppercase tracking-wider text-[10px] text-milan-600">
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
      )}
    </div>
  );
}
