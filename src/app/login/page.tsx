'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mail,
  CheckCircle2,
  RefreshCw,
  Lock,
  KeyRound,
  X,
  Sparkles,
  Award,
  Check,
  Layers,
  FileCode,
  GraduationCap
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import GlowButton from '@/components/ui/GlowButton';

function getSafeReturnUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/dashboard';
  // Prevent open redirects: must be relative path starting with '/', no '//', no backslashes
  if (!rawUrl.startsWith('/') || rawUrl.startsWith('//') || rawUrl.includes('\\')) {
    return '/dashboard';
  }
  // Prevent redirect loops
  if (rawUrl === '/login' || rawUrl.startsWith('/login?') || rawUrl.startsWith('/login#') || rawUrl === '/signup') {
    return '/dashboard';
  }
  return rawUrl;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Email confirmation state
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendEmailInput, setResendEmailInput] = useState('');
  const [showManualResend, setShowManualResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password recovery flow state (Scenario 8)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Read returnUrl & saved email on mount
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const isRecovery = hash.includes('type=recovery') || params.get('type') === 'recovery';

    if (isRecovery) {
      setIsRecoveryMode(true);
    } else {
      // Check if user is already authenticated
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.getSession().then(async ({ data }) => {
          if (data?.session?.user) {
            const hasExplicitReturn = Boolean(params.get('returnUrl'));
            const destination = getSafeReturnUrl(params.get('returnUrl'));
            if (!hasExplicitReturn || destination === '/dashboard') {
              const active = await DataService.getActiveUserEnrollment(data.session.user.id);
              if (!active) {
                window.location.href = '/onboarding/choose-course';
                return;
              }
            }
            window.location.href = destination;
          }
        });
      }
    }

    if (typeof window !== 'undefined') {
      if (params.get('verified') === 'true' || (hash.includes('access_token') && !hash.includes('type=recovery'))) {
        setJustVerified(true);
      }

      // Check for remembered email
      try {
        const remembered = localStorage.getItem('seva_remember_email');
        if (remembered) {
          setForm((prev) => ({ ...prev, email: remembered, rememberMe: true }));
          setForgotPasswordEmail(remembered);
        }
      } catch {}
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    const emailTrimmed = form.email.trim();
    if (!emailTrimmed) {
      errs.email = 'Please enter your email address';
    } else if (!emailTrimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errs.password = 'Please enter your password';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    setResendMessage(null);

    const emailTrimmed = form.email.trim();

    // Handle remember me preference
    try {
      if (form.rememberMe) {
        localStorage.setItem('seva_remember_email', emailTrimmed);
      } else {
        localStorage.removeItem('seva_remember_email');
      }
    } catch {}

    try {
      const { user, error, isEmailUnconfirmed } = await DataService.loginUser(emailTrimmed, form.password);

      if (isEmailUnconfirmed) {
        setUnconfirmedEmail(emailTrimmed);
        setResendEmailInput(emailTrimmed);
        setServerError(null);
        setLoading(false);
        return;
      }

      if (error) {
        setServerError(error);
        setLoading(false);
        return;
      }

      if (user) {
        const params = new URLSearchParams(window.location.search);
        const hasExplicitReturn = Boolean(params.get('returnUrl'));
        const destination = getSafeReturnUrl(params.get('returnUrl'));
        if (!hasExplicitReturn || destination === '/dashboard') {
          const active = await DataService.getActiveUserEnrollment(user.id);
          if (!active) {
            window.location.href = '/onboarding/choose-course';
            return;
          }
        }
        window.location.href = destination;
      }
    } catch (err: any) {
      setServerError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (emailToResend: string) => {
    const targetEmail = (emailToResend || resendEmailInput).trim();
    if (!targetEmail) {
      setResendMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    try {
      const { success, message } = await DataService.resendConfirmationEmail(targetEmail);
      if (success) {
        setResendMessage({ type: 'success', text: message });
      } else {
        setResendMessage({ type: 'error', text: message });
      }
    } catch (err: any) {
      setResendMessage({
        type: 'error',
        text: err?.message || 'Unable to send confirmation email. Please try again.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotPasswordEmail.trim();
    if (!cleanEmail || !cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setForgotPasswordStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordStatus(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?reset=true` : undefined,
        });

        if (error) {
          setForgotPasswordStatus({ type: 'error', message: error.message });
          return;
        }
      }

      setForgotPasswordStatus({
        type: 'success',
        message: 'Password reset link sent! Check your inbox to choose a new password.',
      });
    } catch (err: any) {
      setForgotPasswordStatus({
        type: 'error',
        message: err?.message || 'Failed to send password reset request.',
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setNewPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordError('Passwords do not match');
      return;
    }

    setRecoveryLoading(true);
    setNewPasswordError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setNewPasswordError(error.message);
          return;
        }
      }
      setRecoverySuccess(true);
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (err: any) {
      setNewPasswordError(err?.message || 'Failed to update password');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 flex flex-col justify-center relative overflow-hidden w-full max-w-full selection:bg-milan-600/20 selection:text-milan-800">
      {/* ── AMBIENT WARM LIGHTING & DOT GRID BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none max-w-full [contain:paint]" aria-hidden="true">
        {/* Soft edge blends */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FFFDF7] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FFFDF7] to-transparent" />

        {/* Ambient warm chiffon and red glow blooms */}
        <div className="absolute top-[-5%] left-[-5%] w-[220px] h-[220px] sm:w-[650px] sm:h-[650px] bg-milan-500/10 rounded-full blur-[80px] sm:blur-[150px]" />
        <div className="hidden sm:block absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-[#FFE4E6]/50 rounded-full blur-[140px]" />
        <div className="hidden sm:block absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] bg-milan-400/5 rounded-full blur-[120px]" />

        {/* Subtle geometric dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, #E6DACD 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ── MAIN CONTENT CONTAINER (Desktop Two-Column / Mobile Stacked) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10 w-full flex-1 flex items-center min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
          
          {/* ══════════════════════════════════════════════════════════════════
              LEFT PANEL: BRAND STORYTELLING (~54% on Desktop)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-7 min-w-0 space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Top Brand Header Pill & Logo */}
            <div className="space-y-3 sm:space-y-4">
              <Link href="/" className="inline-block group focus:outline-none focus:ring-2 focus:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]" id="login-brand-logo">
                <Image
                  src="/images/seva-skill-passport-logo-cropped-transparent.png"
                  alt="SEVA Skill Passport — Powered by Team OG"
                  width={240}
                  height={85}
                  priority
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </Link>

              {/* Academic Innovation Platform Badge */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-milan-600/25 text-xs font-bold text-milan-600 shadow-[0_2px_10px_rgba(136, 19, 55,0.08)]">
                  <span className="w-2 h-2 rounded-full bg-milan-600 animate-pulse" />
                  <span>Academic Innovation Platform</span>
                </div>
              </div>
            </div>

            {/* Powerful Narrative Headline */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-espresso-900 tracking-tight leading-[1.15]">
                Your skills deserve to be{' '}
                <span className="text-milan-600 relative inline-block">
                  proven.
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-gradient-to-r from-milan-600 via-milan-bright to-transparent rounded-full opacity-70" />
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-espresso-muted leading-relaxed max-w-xl font-normal">
                Learn through structured courses, practise in interactive labs, build real projects, and showcase verified evidence of your abilities.
              </p>
            </div>

            {/* ── 5-STAGE LEARNING JOURNEY STEPPER ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-milan-600/20 shadow-sm space-y-3 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-espresso-900">
                <span className="uppercase tracking-wider text-[10px] sm:text-[11px] text-milan-600 font-black">Demonstrated Competency Pathway</span>
                <span className="text-[10px] sm:text-[11px] text-espresso-muted">Stage-Gated Evidence</span>
              </div>

              {/* Connected Line Stepper */}
              <div className="relative pt-2 pb-1 overflow-hidden">
                {/* Connecting bar */}
                <div className="absolute top-5 inset-x-4 h-1 bg-cream-200 -translate-y-1/2 z-0" />
                <div className="absolute top-5 left-4 w-3/4 h-1 bg-gradient-to-r from-milan-600 via-milan-bright to-emerald-500 -translate-y-1/2 z-0" />

                <div className="relative z-10 grid grid-cols-5 text-center">
                  {[
                    { num: '1', label: 'LEARN', done: true },
                    { num: '2', label: 'PRACTISE', done: true },
                    { num: '3', label: 'BUILD', done: true },
                    { num: '4', label: 'ASSESS', done: true },
                    { num: '5', label: 'VERIFY', active: true },
                  ].map((st, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-0">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm transition-transform hover:scale-110 ${
                          st.done
                            ? 'bg-emerald-600 text-white'
                            : st.active
                            ? 'bg-milan-600 text-white ring-4 ring-milan-500/20 animate-pulse'
                            : 'bg-cream-100 text-espresso-muted border border-milan-600/20'
                        }`}
                      >
                        {st.done ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : st.num}
                      </div>
                      <span
                        className={`text-[8px] sm:text-[10px] font-extrabold mt-1 tracking-wider truncate max-w-full px-0.5 ${
                          st.active ? 'text-milan-600' : st.done ? 'text-espresso-900' : 'text-espresso-muted'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── FLOATING SKILL PASSPORT PREVIEW CARD ── */}
            <div className="relative w-full max-w-lg min-w-0">
              {/* Layered ambient depth shadows */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#881337]/25 to-[#4C0519]/30 rounded-2xl sm:rounded-3xl transform rotate-0.5 blur-sm opacity-60 pointer-events-none" />
              
              <div className="relative z-10 rounded-2xl sm:rounded-3xl bg-white border border-milan-600/25 p-4 sm:p-6 shadow-[0_20px_50px_-15px_rgba(136, 19, 55,0.22)] space-y-4 min-w-0">
                {/* Passport Header Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-milan-600/15 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-milan-500 to-milan-700 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm flex-shrink-0">
                      AK
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-espresso-900 truncate">Aarav K. Sharma</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[9px] sm:text-[10px] font-bold text-emerald-700 border border-emerald-200 flex-shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      </div>
                      <p className="font-mono text-[10px] sm:text-[11px] text-espresso-muted">ID: SEVA-IND-2026-8942</p>
                    </div>
                  </div>

                  {/* Tamper-Proof Seal Pill */}
                  <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-milan-600">SHA-256 Ledger</span>
                    <span className="font-mono text-[10px] text-espresso-muted">0x7f83b165...</span>
                  </div>
                </div>

                {/* Live Competency Bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-900 mb-1">
                      <span className="truncate pr-2">Full-Stack Architecture</span>
                      <span className="text-milan-600 font-extrabold flex-shrink-0">94% Competent</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-milan-600 to-milan-bright rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-espresso-900 mb-1">
                      <span className="truncate pr-2">Socratic AI & Distributed Systems</span>
                      <span className="text-amber-700 font-extrabold flex-shrink-0">88% Competent</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-[88%]" />
                    </div>
                  </div>
                </div>

                {/* Evidence Item Footnote */}
                <div className="p-2.5 sm:p-3 bg-[#FFFDF7] rounded-xl border border-milan-600/15 flex items-center justify-between text-xs min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Award className="w-4 h-4 text-milan-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-espresso-900 text-[10px] sm:text-[11px] truncate">Capstone Project: Civic Services Dashboard</p>
                      <p className="text-[9px] sm:text-[10px] text-espresso-muted truncate">Multi-File Microservices • 98.4% Test Coverage</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-700 flex-shrink-0 ml-2">96/100</span>
                </div>
              </div>
            </div>

            {/* Three Supporting Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-milan-600/20 text-[11px] sm:text-xs font-semibold text-espresso-800 shadow-sm">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-milan-600" />
                <span>Evidence-backed skills</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-milan-600/20 text-[11px] sm:text-xs font-semibold text-espresso-800 shadow-sm">
                <FileCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-milan-600" />
                <span>Practical project learning</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-milan-600/20 text-[11px] sm:text-xs font-semibold text-espresso-800 shadow-sm">
                <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-milan-600" />
                <span>Shareable Skill Passport</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT PANEL: AUTHENTICATION FORM (~46% on Desktop, First on Mobile)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5 min-w-0 w-full flex justify-center order-1 lg:order-2">
            <div className="max-w-md w-full relative min-w-0">
              {/* Ambient Glow behind Login Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#881337]/25 via-transparent to-[#F3C9BE]/30 rounded-3xl blur-md opacity-60 pointer-events-none" />

              <div className="relative z-10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-white border border-milan-600/20 shadow-[0_20px_60px_-15px_rgba(136, 19, 55,0.18),0_8px_25px_-5px_rgba(28, 13, 18,0.06)] space-y-5 sm:space-y-6 min-w-0">
                
                {/* Card Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-milan-50 border border-milan-600/20 text-[10px] font-bold text-milan-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-milan-600 animate-pulse" />
                      <span>SECURE AUTHENTICATION</span>
                    </div>

                    <Link
                      href="/"
                      className="text-xs font-semibold text-espresso-muted hover:text-milan-600 transition-colors flex-shrink-0"
                      title="Return to Homepage"
                    >
                      ← Back to Home
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-espresso-900 tracking-tight pt-1">
                    Welcome back.
                  </h2>
                  <p className="text-xs sm:text-sm text-espresso-muted font-normal">
                    Continue building skills you can prove.
                  </p>
                </div>

                {/* Just Verified Notification */}
                {justVerified && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Email verified successfully! You may now sign in with your credentials.</span>
                  </div>
                )}

                {/* Unconfirmed Email Notice Card */}
                {unconfirmedEmail && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs" id="unconfirmed-email-notice">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl text-amber-800 flex-shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 text-xs">Email Confirmation Required</h3>
                        <p className="text-amber-800 mt-1 leading-relaxed">
                          Your account is registered, but your email has not been verified yet. Supabase Auth requires email confirmation before access is granted.
                        </p>
                        <p className="text-espresso-900 font-bold mt-1">
                          Target: <span className="underline text-milan-600">{unconfirmedEmail}</span>
                        </p>
                      </div>
                    </div>

                    {resendMessage && (
                      <div
                        className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                          resendMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {resendMessage.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                        )}
                        <span>{resendMessage.text}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleResend(unconfirmedEmail)}
                        disabled={resendLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-milan-600 hover:bg-milan-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                        id="login-resend-btn"
                      >
                        {resendLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span>{resendLoading ? 'Sending…' : 'Resend confirmation'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUnconfirmedEmail(null);
                          setResendMessage(null);
                        }}
                        className="text-xs text-espresso-muted hover:text-espresso-900 transition-colors py-1.5 px-2 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Standard Server Error Alert */}
                {serverError && !unconfirmedEmail && (
                  <div
                    className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs"
                    id="login-error-alert"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed font-medium">{serverError}</span>
                  </div>
                )}

                {/* ── THE SIGN-IN FORM ── */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold text-espresso-900 uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-espresso-muted">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                          if (serverError) setServerError(null);
                          if (unconfirmedEmail) setUnconfirmedEmail(null);
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-[#FFFDF7] border rounded-2xl text-xs sm:text-sm font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-all ${
                          fieldErrors.email ? 'border-rose-400 bg-rose-50/50' : 'border-milan-600/25'
                        }`}
                        placeholder="you@university.edu or email@domain.com"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p id="email-error" className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-bold text-espresso-900 uppercase tracking-wider"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordEmail(form.email);
                          setShowForgotPassword(true);
                        }}
                        className="text-xs text-milan-600 hover:text-milan-700 hover:underline transition-colors font-bold cursor-pointer"
                        id="forgot-password-trigger"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-espresso-muted">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password"
                        type={showPwd ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                          if (serverError) setServerError(null);
                        }}
                        className={`w-full pl-10 pr-11 py-3 bg-[#FFFDF7] border rounded-2xl text-xs sm:text-sm font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-all ${
                          fieldErrors.password ? 'border-rose-400 bg-rose-50/50' : 'border-milan-600/25'
                        }`}
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        id="password-toggle-btn"
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso-muted hover:text-espresso-900 transition-colors p-1 cursor-pointer"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p id="password-error" className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="login-remember-me"
                        checked={form.rememberMe}
                        onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                        className="w-4 h-4 rounded border-milan-600/30 text-milan-600 focus:ring-milan-500 cursor-pointer accent-milan-600"
                      />
                      <span className="text-xs font-medium text-espresso-800">Remember my email</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      id="login-submit"
                      className="w-full relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#9F1239] via-[#881337] to-[#881337] hover:from-[#9F1239] hover:to-[#700F2E] border border-white/25 shadow-[0_12px_28px_-5px_rgba(136, 19, 55,0.45)] hover:shadow-[0_16px_36px_-5px_rgba(136, 19, 55,0.6)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-4 focus:ring-milan-600/30"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing in to SEVA…</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in to SEVA</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Expandable Manual Resend Confirmation Section */}
                <div className="pt-4 border-t border-milan-600/15 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualResend(!showManualResend)}
                    className="text-xs text-espresso-muted hover:text-milan-600 transition-colors font-medium underline cursor-pointer"
                    id="unconfirmed-resend-toggle"
                  >
                    Didn&apos;t receive confirmation email? Resend here
                  </button>

                  {showManualResend && (
                    <div className="mt-3 p-3.5 bg-[#FFFDF7] border border-milan-600/20 rounded-2xl space-y-2 text-left animate-in fade-in duration-200">
                      <label className="text-[11px] font-bold text-espresso-900 block uppercase tracking-wider">
                        Enter your registered email:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={resendEmailInput}
                          onChange={(e) => setResendEmailInput(e.target.value)}
                          placeholder="student@example.com"
                          className="flex-1 px-3 py-2 bg-white border border-milan-600/20 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-milan-600/30"
                          id="manual-resend-email-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleResend(resendEmailInput)}
                          disabled={resendLoading}
                          className="px-4 py-2 bg-milan-600 text-white rounded-xl text-xs font-bold hover:bg-milan-700 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                          id="manual-resend-submit"
                        >
                          {resendLoading ? 'Sending…' : 'Resend'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Account Link Footer */}
                <div className="pt-2 text-center text-xs text-espresso-muted">
                  Don&apos;t have a Skill Passport account?{' '}
                  <Link
                    href="/signup"
                    className="text-milan-600 font-black hover:text-milan-700 hover:underline transition-colors"
                    id="login-to-signup"
                  >
                    Create an account →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-modal-title"
        >
          <div className="bg-white border border-milan-600/25 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordStatus(null);
              }}
              className="absolute right-4 top-4 text-espresso-muted hover:text-espresso-900 p-1.5 rounded-full hover:bg-milan-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-milan-50 border border-milan-600/20 rounded-2xl text-milan-600 shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 id="forgot-password-modal-title" className="text-base font-extrabold text-espresso-900 leading-tight">
                  Reset Password
                </h3>
                <p className="text-xs text-espresso-muted">Receive a recovery link via email</p>
              </div>
            </div>

            {forgotPasswordStatus && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                  forgotPasswordStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {forgotPasswordStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                )}
                <span className="leading-relaxed">{forgotPasswordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-espresso-900 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-espresso-muted">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-espresso-700 hover:bg-cream-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="px-4 py-2 bg-milan-600 hover:bg-milan-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-milan-600/20"
                >
                  {forgotPasswordLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SET NEW PASSWORD RECOVERY MODAL (Scenario 8) ── */}
      {isRecoveryMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-modal-title"
          id="recovery-password-modal"
        >
          <div className="bg-white border border-milan-600/25 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-milan-50 border border-milan-600/20 rounded-2xl text-milan-600 shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 id="recovery-modal-title" className="text-base font-extrabold text-espresso-900 leading-tight">
                  Set New Password
                </h3>
                <p className="text-xs text-espresso-muted">Choose a new password for your account</p>
              </div>
            </div>

            {recoverySuccess ? (
              <div className="space-y-4 pt-1">
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <span className="leading-relaxed">
                    Your password has been successfully updated! You can now sign in with your new password.
                  </span>
                </div>
                <button
                  type="button"
                  id="recovery-proceed-signin"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setRecoverySuccess(false);
                  }}
                  className="w-full py-2.5 px-4 bg-milan-600 hover:bg-milan-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-milan-600/20 cursor-pointer"
                >
                  Proceed to Sign In →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetNewPassword} className="space-y-3.5" noValidate>
                {newPasswordError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2 text-rose-800 text-xs font-semibold" id="recovery-error-alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    <span>{newPasswordError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-espresso-900 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="recovery-new-password"
                      type={showNewPwd ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (newPasswordError) setNewPasswordError(null);
                      }}
                      placeholder="At least 8 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30"
                    />
                    <button
                      type="button"
                      id="recovery-pwd-toggle"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted hover:text-espresso-900 p-1 cursor-pointer"
                      aria-label={showNewPwd ? 'Hide password' : 'Show password'}
                    >
                      {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-espresso-900 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    id="recovery-confirm-password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (newPasswordError) setNewPasswordError(null);
                    }}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-milan-600/20 rounded-xl text-xs text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(false);
                      setNewPasswordError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-espresso-700 hover:bg-cream-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="recovery-submit-btn"
                    disabled={recoveryLoading}
                    className="px-4 py-2 bg-milan-600 hover:bg-milan-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-milan-600/20"
                  >
                    {recoveryLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
