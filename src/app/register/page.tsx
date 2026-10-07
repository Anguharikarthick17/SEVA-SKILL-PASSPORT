'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { INDIA_STATES, EDUCATION_OPTIONS } from '@/data';
import { DataService } from '@/lib/data-service';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  education: string;
  state: string;
  district: string;
}

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    education: '',
    state: '',
    district: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: undefined });
      if (serverError) setServerError(null);
    },
  });

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email is required';
    if (!form.mobile.match(/^[6-9]\d{9}$/)) e.mobile = 'Valid 10-digit mobile number required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.education) e.education = 'Education is required';
    if (!form.state) e.state = 'State is required';
    if (!form.district.trim()) e.district = 'District is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);

    try {
      const { user, error } = await DataService.registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobile: form.mobile.trim(),
        education: form.education,
        state: form.state,
        district: form.district.trim(),
      });

      if (error) {
        setServerError(error);
        setLoading(false);
        return;
      }

      if (user) {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check network and try again.');
      setLoading(false);
    }
  };

  const inputClass = (key: keyof FormData) =>
    `w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

  return (
    <div className="min-h-screen bg-gov-bg py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-900 rounded-xl mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Start building your Skill Passport</p>
        </div>

        <div className="gov-card shadow-gov-lg">
          {serverError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Personal */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input id="reg-name" type="text" required autoComplete="name" {...field('fullName')} className={inputClass('fullName')} placeholder="As per official documents" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                    <input id="reg-email" type="email" required autoComplete="email" {...field('email')} className={inputClass('email')} placeholder="you@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="reg-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">Mobile *</label>
                    <input id="reg-mobile" type="tel" required autoComplete="tel" {...field('mobile')} className={inputClass('mobile')} placeholder="10-digit number" />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-pwd" className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      id="reg-pwd"
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={inputClass('password') + ' pr-10'}
                      placeholder="Min. 8 characters"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="reg-cpwd" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
                  <input id="reg-cpwd" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={inputClass('confirmPassword')} placeholder="Repeat password" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Academic & Location */}
            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Academic & Location</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reg-edu" className="block text-sm font-medium text-slate-700 mb-1.5">Education *</label>
                  <select id="reg-edu" required value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className={inputClass('education')}>
                    <option value="">Select qualification</option>
                    {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-state" className="block text-sm font-medium text-slate-700 mb-1.5">State *</label>
                    <select id="reg-state" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass('state')}>
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label htmlFor="reg-district" className="block text-sm font-medium text-slate-700 mb-1.5">District *</label>
                    <input id="reg-district" type="text" required {...field('district')} className={inputClass('district')} placeholder="Your district" />
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3.5 disabled:opacity-70 disabled:cursor-not-allowed" id="register-submit">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account…
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5 pt-5 border-t border-slate-100">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-navy-700 hover:text-navy-900">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Secure authentication backed by Supabase & database identity</p>
      </div>
    </div>
  );
}
