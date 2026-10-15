'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Mail, RefreshCw, Lock, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import { INDIA_STATES, EDUCATION_OPTIONS } from '@/data';
import { DataService } from '@/lib/data-service';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import GlowButton from '@/components/ui/GlowButton';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  education: string;
  state: string;
  district: string;
  agreeTerms: boolean;
  agreeMarketing?: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    education: '',
    state: '',
    district: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          router.replace('/dashboard');
        }
      });
    }
  }, [router]);

  const field = (key: keyof Omit<FormData, 'agreeTerms' | 'agreeMarketing'>) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: undefined });
      if (serverError) setServerError(null);
    },
  });

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) {
      e.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      e.fullName = 'Please enter a valid full name';
    }

    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      e.email = 'Please enter a valid email address';
    }

    if (!form.mobile.trim()) {
      e.mobile = 'Mobile number is required';
    } else if (!form.mobile.match(/^[6-9]\d{9}$/)) {
      e.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    if (!form.education) {
      e.education = 'Highest education level is required';
    }

    if (!form.state) {
      e.state = 'State / UT is required';
    }

    if (!form.district.trim()) {
      e.district = 'District is required';
    }

    if (!form.agreeTerms) {
      e.agreeTerms = 'You must accept the terms and privacy policy to continue';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);
    setResendMessage(null);

    const emailToRegister = form.email.trim();

    try {
      const result = await DataService.registerUser({
        email: emailToRegister,
        password: form.password,
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        education: form.education,
        state: form.state,
        district: form.district.trim(),
      });

      if (result.error) {
        setServerError(result.error);
        return;
      }

      // Check if immediate session was established or email confirmation is required
      if (result.needsEmailConfirmation) {
        setRegisteredEmail(emailToRegister);
      } else if (result.user) {
        router.push('/onboarding/choose-course');
      } else {
        setRegisteredEmail(emailToRegister);
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const { success, message } = await DataService.resendConfirmationEmail(registeredEmail);
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

  const inputClass = (key: keyof FormData) =>
    `w-full px-4 py-2.5 bg-[#FFFDF7] border rounded-xl text-xs font-medium text-espresso-900 placeholder-espresso-muted focus:outline-none focus:ring-2 focus:ring-milan-600/30 focus:border-milan-600 transition-all ${
      errors[key] ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-milan-600/20'
    }`;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-espresso-900 py-16 px-4 relative overflow-hidden flex flex-col justify-center">
      {/* Ambient background bloom */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-milan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3 focus:outline-none focus:ring-2 focus:ring-[#881337] rounded-xl p-1 transition-transform duration-200 hover:scale-[1.02]">
            <Image
              src="/images/seva-skill-passport-logo-cropped-transparent.png"
              alt="SEVA Skill Passport — Powered by Team OG"
              width={220}
              height={78}
              priority
              className="h-11 sm:h-12 w-auto object-contain mx-auto"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-espresso-900 tracking-tight">Create Account</h1>
          <p className="text-espresso-muted text-xs sm:text-sm mt-1">Start building your verifiable SEVA Skill Passport</p>
        </div>

        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-milan-600/20 shadow-xl">
          {registeredEmail ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-2xl mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-espresso-900">Account Created Successfully</h2>
              <p className="text-xs sm:text-sm text-espresso-muted max-w-md mx-auto leading-relaxed">
                We&apos;ve sent a verification link to <span className="font-bold text-milan-600">{registeredEmail}</span>. Please verify your email, then sign in to access your Skill Passport dashboard.
              </p>

              {resendMessage && (
                <div
                  className={`p-3 max-w-md mx-auto rounded-xl text-xs flex items-center justify-center gap-2 ${
                    resendMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {resendMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  )}
                  <span>{resendMessage.text}</span>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto glow-button px-6 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 rounded-full"
                  id="signup-to-login"
                >
                  Go to Login <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-milan-600/25 hover:border-milan-600 bg-white text-espresso-900 text-xs sm:text-sm font-semibold rounded-full transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                  id="signup-resend-btn"
                >
                  {resendLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-milan-600" />
                  ) : (
                    <Mail className="w-4 h-4 text-milan-600" />
                  )}
                  {resendLoading ? 'Sending…' : 'Resend confirmation email'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredEmail(null);
                    setResendMessage(null);
                  }}
                  className="text-xs text-espresso-muted hover:text-espresso-900 underline"
                >
                  Register another account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {serverError && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-800 text-xs" id="signup-server-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className={inputClass('fullName')}
                  {...field('fullName')}
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass('email')}
                    {...field('email')}
                  />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="signup-mobile" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    id="signup-mobile"
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    className={inputClass('mobile')}
                    {...field('mobile')}
                  />
                  {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>}
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-password" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className={inputClass('password')}
                      {...field('password')}
                    />
                    <button
                      type="button"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted hover:text-espresso-900"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="signup-confirm-password" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPwd ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className={inputClass('confirmPassword')}
                      {...field('confirmPassword')}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPwd ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted hover:text-espresso-900"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <label htmlFor="signup-education" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                  Highest Education Level *
                </label>
                <select id="signup-education" className={inputClass('education')} {...field('education')}>
                  <option value="">Select your education</option>
                  {EDUCATION_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                {errors.education && <p className="text-xs text-rose-600 mt-1">{errors.education}</p>}
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-state" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    State / UT *
                  </label>
                  <select id="signup-state" className={inputClass('state')} {...field('state')}>
                    <option value="">Select State</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-rose-600 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label htmlFor="signup-district" className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <input
                    id="signup-district"
                    type="text"
                    placeholder="Enter district"
                    className={inputClass('district')}
                    {...field('district')}
                  />
                  {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
                </div>
              </div>

              {/* Personal Data Purpose Disclosure */}
              <div className="p-3 bg-[#FFE4E6]/40 border border-[#881337]/15 rounded-xl text-[11px] text-[#6B4E56] leading-relaxed">
                <span className="font-semibold text-[#881337]">Data Minimization: </span>
                Your name, education, and state are collected solely to generate your tamper-evident SEVA Skill Passport credential and tailor your curriculum. We never sell your personal data.
              </div>

              {/* Terms Acceptance */}
              <div className="pt-1 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="signup-terms"
                    checked={form.agreeTerms}
                    onChange={(e) => {
                      setForm({ ...form, agreeTerms: e.target.checked });
                      if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-milan-600/30 text-milan-600 focus:ring-milan-500 cursor-pointer"
                  />
                  <span className="text-xs text-espresso-700 leading-snug">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="font-semibold text-[#881337] underline hover:text-[#700F2E]">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" className="font-semibold text-[#881337] underline hover:text-[#700F2E]">
                      Privacy Policy
                    </Link>{' '}
                    of SEVA Skill Passport. <span className="text-rose-600 font-bold">*</span>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-rose-600 ml-6">{errors.agreeTerms}</p>}

                {/* Optional Unchecked Marketing Consent */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="signup-marketing"
                    checked={Boolean(form.agreeMarketing)}
                    onChange={(e) => {
                      setForm({ ...form, agreeMarketing: e.target.checked });
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-milan-600/30 text-milan-600 focus:ring-milan-500 cursor-pointer"
                  />
                  <span className="text-xs text-[#6B4E56] leading-snug">
                    (Optional) Keep me informed about new course releases, community challenges, and skill tracks via email. You can{' '}
                    <Link href="/unsubscribe" target="_blank" className="underline hover:text-[#881337]">
                      unsubscribe anytime
                    </Link>.
                  </span>
                </label>
              </div>

              <GlowButton
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-3"
                disabled={loading}
                id="signup-submit"
              >
                <span>{loading ? 'Creating Account…' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </GlowButton>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-espresso-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-milan-600 font-bold hover:underline" id="signup-signin-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
