'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import {
  User,
  Github,
  Save,
  CheckCircle2,
  Receipt,
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
      if (!u) {
        window.location.href = '/login?returnUrl=' + encodeURIComponent('/profile');
        return;
      }
      setUser(u);
      setFormData({
        name: u.fullName,
        email: u.email,
        mobile: u.mobile || '',
        education: u.education || DEMO_STUDENT.education,
        state: u.state || DEMO_STUDENT.state,
        district: u.district || DEMO_STUDENT.district,
        targetRole: u.targetRole || 'Full Stack Developer',
        githubHandle: u.githubHandle || 'arjunsharma',
        passportPublic: u.passportVisibility !== 'private',
      } as any);
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
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Header Banner - Milan Red Glossy Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#4C0519] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-red-400/30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <User className="w-4 h-4 text-[#FFE4E6]" />
                Learner Profile &amp; Identity
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Profile &amp; Account Settings</h1>
              <p className="mt-2 text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                Manage your personal information, career goals, connected accounts, and public Skill Passport sharing preferences.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center md:text-right flex items-center justify-around md:justify-end gap-6 shadow-md">
              <div>
                <span className="block text-2xl font-black text-[#FFE4E6]">STD-001</span>
                <span className="text-xs text-white/80">Learner ID</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-black text-emerald-300">Active</span>
                <span className="text-xs text-white/80">Enrollment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-bold">
              Profile changes saved successfully! Your Skill Passport identity details have been updated.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#FFE4E6] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#FFE4E6]">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] text-[#881337] flex items-center justify-center font-black text-xl shadow-sm">
              AS
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1C0D12]">{formData.name}</h2>
              <p className="text-xs text-slate-500">Enrolled in Full Stack Developer Programme</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                  Verified Candidate
                </span>
                <span className="text-[10px] text-[#881337] font-mono">ID: std-001</span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">Highest Education</label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-bold text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
              >
                {EDUCATION_OPTIONS.map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">State / UT</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-bold text-[#1C0D12] focus:outline-none focus:ring-2 focus:ring-[#881337]"
              >
                {INDIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">District / City</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">Target Engineering Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C0D12] mb-1.5">GitHub Username</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFE4E6]/30 border border-[#FECDD3] rounded-xl text-xs font-mono text-[#1C0D12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#881337]"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Skill Passport Visibility */}
          <div className="pt-4 border-t border-[#FFE4E6] space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Passport Privacy &amp; Verification Link
            </h3>
            <div className="flex items-center justify-between p-4 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6]">
              <div className="flex items-center gap-3">
                {formData.passportPublic ? (
                  <Eye className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1C0D12] block">
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
                className="w-4 h-4 text-[#881337] rounded focus:ring-[#881337] border-[#FECDD3] cursor-pointer"
              />
            </div>
          </div>

          {/* Fee Receipt Record */}
          <div className="p-4 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-[#881337]" />
              <div>
                <span className="font-bold text-[#1C0D12] block">Learning Access Fee Paid (₹100)</span>
                <span className="text-[11px] text-slate-500">Txn ID: SEVA-TXN-2024-88419 • October 1, 2024</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
              Active Access
            </span>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="glow-button text-xs py-2.5 px-6 flex items-center gap-1.5 font-bold cursor-pointer"
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
