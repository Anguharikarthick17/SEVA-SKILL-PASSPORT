'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Github,
  Globe,
  Save,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';
import { DEMO_STUDENT, INDIA_STATES, EDUCATION_OPTIONS } from '@/data';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: DEMO_STUDENT.name,
    email: DEMO_STUDENT.email,
    mobile: DEMO_STUDENT.mobile,
    education: DEMO_STUDENT.education,
    state: DEMO_STUDENT.state,
    district: DEMO_STUDENT.district,
    targetRole: 'Full Stack Developer',
    githubUsername: 'arjunsharma',
    passportPublic: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    DataService.getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setFormData({
          name: u.fullName,
          email: u.email,
          mobile: u.mobile || '',
          education: u.education || DEMO_STUDENT.education,
          state: u.state || DEMO_STUDENT.state,
          district: u.district || DEMO_STUDENT.district,
          targetRole: u.targetRole || 'Full Stack Developer',
          githubUsername: u.githubHandle || 'arjunsharma',
          passportPublic: u.passportVisibility !== 'private',
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await DataService.updateProfile(user.id, {
        fullName: formData.name,
        mobile: formData.mobile,
        education: formData.education,
        state: formData.state,
        district: formData.district,
        targetRole: formData.targetRole,
        githubHandle: formData.githubUsername,
        passportVisibility: formData.passportPublic ? 'public' : 'private',
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-gov-bg pb-16">
      {/* Header Banner */}
      <section className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-saffron-300 mb-2">
              <User className="w-4 h-4" />
              Learner Profile & Identity
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Profile & Account Settings</h1>
            <p className="mt-2 text-blue-100 text-sm md:text-base max-w-xl">
              Manage your personal information, career goals, connected accounts, and public Skill Passport sharing preferences.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6">
            <div>
              <span className="block text-2xl font-black text-saffron-400">STD-001</span>
              <span className="text-xs text-blue-100">Learner ID</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black text-white">Active</span>
              <span className="text-xs text-blue-100">Enrollment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-medium">
              Profile changes saved successfully! Your Skill Passport identity details have been updated.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              AS
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">{formData.name}</h2>
              <p className="text-xs text-slate-500">Enrolled in Full Stack Developer Programme</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Verified Candidate
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: std-001</span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Education</label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {EDUCATION_OPTIONS.map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / UT</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {INDIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District / City</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Engineering Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Username</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Skill Passport Visibility */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Passport Privacy & Verification Link
            </h3>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                {formData.passportPublic ? (
                  <Eye className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-navy-900 block">
                    Public Skill Passport Verification Link
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allow potential recruiters and employers to inspect evidence via verification ID.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.passportPublic}
                onChange={(e) => setFormData({ ...formData, passportPublic: e.target.checked })}
                className="w-4 h-4 text-navy-900 rounded focus:ring-navy-600"
              />
            </div>
          </div>

          {/* Fee Receipt Record */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-navy-700" />
              <div>
                <span className="font-bold text-navy-900 block">Learning Access Fee Paid (₹100)</span>
                <span className="text-[11px] text-slate-500">Txn ID: SEVA-TXN-2024-88419 • October 1, 2024</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
              Active Access
            </span>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
