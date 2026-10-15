'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService, UserProfile, StoredCredential } from '@/lib/data-service';
import { CertificateService, CredentialAuditRecord } from '@/lib/credentials/service';
import { ProjectSubmissionRecord } from '@/lib/projects/service';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Award,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  Search,
  Filter,
  Trash2,
  Undo2,
  Lock,
  Loader2,
  Sliders
} from 'lucide-react';

export default function AdminPortalPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'credentials' | 'rules' | 'audit'>('projects');

  // Submissions state
  const [submissions, setSubmissions] = useState<ProjectSubmissionRecord[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmissionRecord | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [evaluationRubric, setEvaluationRubric] = useState({
    architecture: 8,
    codeQuality: 8,
    functionality: 8,
    documentation: 4,
  });
  const [isRevisionRequested, setIsRevisionRequested] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Credentials state
  const [allCredentials, setAllCredentials] = useState<StoredCredential[]>([]);
  const [credSearch, setCredSearch] = useState('');
  const [selectedCredToRevoke, setSelectedCredToRevoke] = useState<StoredCredential | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<CredentialAuditRecord[]>([]);

  useEffect(() => {
    DataService.getCurrentUser().then(async (user) => {
      setCurrentUser(user);
      if (user && ['admin', 'instructor', 'reviewer'].includes(user.role || '')) {
        await loadAdminData(user.id, user.role || 'admin');
      }
      setLoading(false);
    });
  }, []);

  const loadAdminData = async (userId: string, role: string) => {
    try {
      // 1. Load submissions
      const res = await fetch(`/api/instructor/submissions?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }

      // 2. Load all credentials
      const creds = CertificateService.getAllCredentials();
      setAllCredentials(creds);

      // 3. Load audit logs
      const logs = CertificateService.getAuditHistory();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleEvaluateSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission || !currentUser) return;
    setEvaluating(true);
    setEvalMessage(null);

    // Safeguard: Check self-review
    if (selectedSubmission.userId === currentUser.id) {
      setEvalMessage({
        type: 'error',
        text: 'Security Violation: Evaluators are strictly prohibited from evaluating their own submissions.',
      });
      setEvaluating(false);
      return;
    }

    try {
      const res = await fetch('/api/projects/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          reviewerId: currentUser.id,
          reviewerRole: currentUser.role || 'reviewer',
          status: isRevisionRequested ? 'revisions_requested' : status,
          feedback: evaluationFeedback || (status === 'approved' ? 'Approved based on rubric requirements.' : 'Submission does not meet required benchmarks.'),
          rubricScores: evaluationRubric,
          revisionNotes: isRevisionRequested ? evaluationFeedback : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setEvalMessage({ type: 'error', text: json.error || 'Evaluation failed.' });
      } else {
        setEvalMessage({
          type: 'success',
          text: `Submission successfully marked as "${json.submission?.status || status}". Evidence hash sealed.`,
        });
        setSelectedSubmission(null);
        setEvaluationFeedback('');
        await loadAdminData(currentUser.id, currentUser.role || 'admin');
      }
    } catch (err: any) {
      setEvalMessage({ type: 'error', text: err.message || 'Network error evaluating submission.' });
    } finally {
      setEvaluating(false);
    }
  };

  const handleRevokeCredential = async () => {
    if (!selectedCredToRevoke || !currentUser) return;
    setRevoking(true);
    setCredMessage(null);

    try {
      const res = await fetch('/api/credentials/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: selectedCredToRevoke.id,
          reviewerRole: currentUser.role || 'admin',
          reason: revocationReason,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setCredMessage({ type: 'error', text: json.error || 'Failed to revoke credential.' });
      } else {
        setCredMessage({
          type: 'success',
          text: `Credential "${selectedCredToRevoke.id}" officially revoked and marked invalid in the registry.`,
        });
        setSelectedCredToRevoke(null);
        setRevocationReason('');
        await loadAdminData(currentUser.id, currentUser.role || 'admin');
      }
    } catch (err: any) {
      setCredMessage({ type: 'error', text: err.message || 'Network error revoking credential.' });
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-8 text-[#1C0D12]">
        <Loader2 className="w-8 h-8 text-[#881337] animate-spin" />
      </div>
    );
  }

  // 403 Forbidden Access Guard for Students or Unauthenticated Visitors
  const userRole = currentUser?.role || 'student';
  const isAuthorized = ['admin', 'instructor', 'reviewer'].includes(userRole);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-rose-300 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#1C0D12]">403 Forbidden</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Administrative and Instructor portals are restricted to authorized reviewers, faculty, and platform administrators.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 text-left">
            <strong>Active Session:</strong> {currentUser?.fullName || 'Anonymous'} ({userRole})
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#881337] text-white text-xs font-bold rounded-xl hover:bg-[#4C0519] transition-colors shadow-md"
            >
              <span>Return to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredCredentials = allCredentials.filter((c) => {
    if (!credSearch) return true;
    const term = credSearch.toLowerCase();
    return (
      c.id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.userId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1C0D12] pb-16">
      {/* Top Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#1C0D12] via-[#1C0D12] to-[#1C0D12] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-amber-900/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFE4E6] mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Faculty &amp; Administration Workspace
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Academic Administration &amp; Review Portal
              </h1>
              <p className="mt-1 text-white/80 text-xs sm:text-sm max-w-xl">
                Authorized evaluator role: <span className="font-bold uppercase text-[#FFE4E6]">{userRole}</span> ({currentUser?.fullName})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
              >
                Student View
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-[#FFE4E6] pb-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-[#FFE4E6]/40 border border-[#FFE4E6]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Project Review Queue ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-[#FFE4E6]/40 border border-[#FFE4E6]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Credentials &amp; Revocation ({allCredentials.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-[#FFE4E6]/40 border border-[#FFE4E6]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Completion Rules
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-[#881337] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-[#FFE4E6]/40 border border-[#FFE4E6]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: PROJECT REVIEW QUEUE */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {evalMessage && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
                  evalMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}
              >
                {evalMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span className="font-semibold">{evalMessage.text}</span>
              </div>
            )}

            {submissions.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-[#FFE4E6] text-center space-y-2">
                <FileCheck2 className="w-8 h-8 text-[#881337] mx-auto" />
                <h3 className="text-base font-bold text-[#1C0D12]">No Submissions in Queue</h3>
                <p className="text-xs text-slate-600">All student capstone submissions have been evaluated.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {submissions.map((sub) => {
                  const isOwn = sub.userId === currentUser?.id;
                  return (
                    <div
                      key={sub.id}
                      className="bg-white border border-[#FFE4E6] rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 border-amber-300 text-amber-900">
                            {sub.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(sub.submittedAt || sub.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-[#1C0D12]">
                          Project: {sub.projectId.toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Learner ID: <span className="font-mono font-bold text-[#1C0D12]">{sub.userId}</span>
                          {isOwn && <span className="text-rose-600 font-bold ml-2">(Your Account)</span>}
                        </p>
                        <p className="text-xs text-slate-700 line-clamp-2 italic bg-[#FFFDF7] p-2 rounded-xl border border-[#FFE4E6]">
                          &quot;{sub.summary}&quot;
                        </p>

                        <div className="text-[11px] space-y-1 text-slate-600">
                          <div>
                            <strong>Repository:</strong>{' '}
                            <a
                              href={sub.repositoryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#881337] underline"
                            >
                              {sub.repositoryUrl}
                            </a>
                          </div>
                          {sub.deploymentUrl && (
                            <div>
                              <strong>Live URL:</strong>{' '}
                              <a
                                href={sub.deploymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 underline"
                              >
                                {sub.deploymentUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        {isOwn ? (
                          <div className="text-[11px] text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl text-center">
                            Self-Review Prevented (Security Rule)
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="w-full py-2 bg-[#881337] hover:bg-[#4C0519] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Evaluate Submission
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Evaluation Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-[#FFE4E6] max-w-xl w-full p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-[#FFE4E6] pb-3">
                    <h3 className="text-base font-black text-[#1C0D12]">
                      Evaluate Submission: {selectedSubmission.projectId.toUpperCase()}
                    </h3>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="text-slate-400 hover:text-[#1C0D12] text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Rubric Sliders */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Architecture &amp; Design (max 10):</span>
                      <span className="font-mono text-[#881337]">{evaluationRubric.architecture} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={evaluationRubric.architecture}
                      onChange={(e) =>
                        setEvaluationRubric({ ...evaluationRubric, architecture: Number(e.target.value) })
                      }
                      className="w-full"
                    />

                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Code Quality &amp; Cleanliness (max 10):</span>
                      <span className="font-mono text-[#881337]">{evaluationRubric.codeQuality} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={evaluationRubric.codeQuality}
                      onChange={(e) =>
                        setEvaluationRubric({ ...evaluationRubric, codeQuality: Number(e.target.value) })
                      }
                      className="w-full"
                    />

                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Functionality &amp; Specs (max 10):</span>
                      <span className="font-mono text-[#881337]">{evaluationRubric.functionality} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={evaluationRubric.functionality}
                      onChange={(e) =>
                        setEvaluationRubric({ ...evaluationRubric, functionality: Number(e.target.value) })
                      }
                      className="w-full"
                    />

                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Documentation &amp; Git (max 5):</span>
                      <span className="font-mono text-[#881337]">{evaluationRubric.documentation} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={evaluationRubric.documentation}
                      onChange={(e) =>
                        setEvaluationRubric({ ...evaluationRubric, documentation: Number(e.target.value) })
                      }
                      className="w-full"
                    />

                    <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-[#FFE4E6] flex items-center justify-between font-black">
                      <span>Total Rubric Score:</span>
                      <span className="text-base text-[#881337] font-mono">
                        {evaluationRubric.architecture +
                          evaluationRubric.codeQuality +
                          evaluationRubric.functionality +
                          evaluationRubric.documentation}{' '}
                        / 35
                      </span>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-[#1C0D12]">Evaluator Feedback &amp; Rubric Notes:</label>
                    <textarea
                      rows={3}
                      value={evaluationFeedback}
                      onChange={(e) => setEvaluationFeedback(e.target.value)}
                      placeholder="Specify code feedback, architectural strengths, or reasons for revision..."
                      className="w-full p-2.5 bg-[#FFFDF7] border border-[#FFE4E6] rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="revReq"
                      checked={isRevisionRequested}
                      onChange={(e) => setIsRevisionRequested(e.target.checked)}
                    />
                    <label htmlFor="revReq" className="font-bold text-[#1C0D12]">
                      Request Revisions (Learner can amend and re-submit)
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEvaluateSubmission('approved')}
                      disabled={evaluating}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                      {evaluating ? 'Recording...' : '✓ Approve Project'}
                    </button>
                    <button
                      onClick={() => handleEvaluateSubmission('rejected')}
                      disabled={evaluating}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                      {evaluating ? 'Recording...' : '✗ Reject / Revisions'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREDENTIALS & REVOCATION */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            {credMessage && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
                  credMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}
              >
                {credMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span className="font-semibold">{credMessage.text}</span>
              </div>
            )}

            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#FFE4E6] shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search credentials by ID, title, or student..."
                value={credSearch}
                onChange={(e) => setCredSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-[#1C0D12] focus:outline-none"
              />
            </div>

            {/* Credentials Table */}
            <div className="bg-white rounded-3xl border border-[#FFE4E6] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF7] border-b border-[#FFE4E6] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="p-4">Credential ID</th>
                    <th className="p-4">Title &amp; Type</th>
                    <th className="p-4">Student ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE4E6]">
                  {filteredCredentials.map((cred) => {
                    const isRevoked = cred.status === ('revoked' as any);
                    return (
                      <tr key={cred.id} className="hover:bg-[#FFFDF7]/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#1C0D12]">{cred.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-[#1C0D12]">{cred.title}</div>
                          <div className="text-[10px] text-slate-500">{cred.credentialType}</div>
                        </td>
                        <td className="p-4 font-mono text-slate-600">{cred.userId}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              isRevoked
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isRevoked ? 'REVOKED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/verify?id=${cred.verificationId || cred.id}`}
                              className="px-2.5 py-1 bg-[#FFFDF7] border border-[#FFE4E6] hover:bg-[#FFE4E6] text-[#1C0D12] rounded-lg text-[11px] font-bold"
                            >
                              Verify
                            </Link>
                            {!isRevoked && (
                              <button
                                onClick={() => setSelectedCredToRevoke(cred)}
                                className="px-2.5 py-1 bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-lg text-[11px] font-bold"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Revoke Credential Modal */}
            {selectedCredToRevoke && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-rose-300 max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3 text-rose-700">
                    <ShieldAlert className="w-6 h-6" />
                    <h3 className="text-base font-black">Revoke Verifiable Credential</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Revoking credential <strong>{selectedCredToRevoke.id}</strong> will permanently invalidate it in the SEVA registry. Any subsequent employer verification check will display a prominent revocation notice.
                  </p>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-[#1C0D12]">
                      Documented Revocation Reason (Mandatory):
                    </label>
                    <textarea
                      rows={3}
                      value={revocationReason}
                      onChange={(e) => setRevocationReason(e.target.value)}
                      placeholder="e.g. Academic integrity violation, administrative error, or unauthorized submission..."
                      className="w-full p-2.5 bg-[#FFFDF7] border border-rose-300 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleRevokeCredential}
                      disabled={revoking || revocationReason.trim().length < 5}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-40"
                    >
                      {revoking ? 'Revoking...' : 'Confirm Revocation'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCredToRevoke(null);
                        setRevocationReason('');
                      }}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETION RULES */}
        {activeTab === 'rules' && (
          <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-[#1C0D12]">Course &amp; Competency Completion Benchmarks</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Configured institutional rules required for automatic certificate unlocking and Skill Passport issuance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#FFE4E6] space-y-2">
                <span className="font-bold text-[#881337] uppercase text-[10px] tracking-wider block">
                  Course Completion Certificate
                </span>
                <p className="text-slate-700">
                  <strong>Threshold:</strong> 10 Curriculum Lessons completed idempotently.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Requires genuine lesson completion saved to database records. Merely viewing the lesson does not qualify.
                </p>
              </div>

              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#FFE4E6] space-y-2">
                <span className="font-bold text-[#881337] uppercase text-[10px] tracking-wider block">
                  Platform Assessment Credential
                </span>
                <p className="text-slate-700">
                  <strong>Threshold:</strong> Graded Assessment Score ≥ 70%.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Evaluated through server-side question sanitization, server-side grading, and cooldown enforcement.
                </p>
              </div>

              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#FFE4E6] space-y-2">
                <span className="font-bold text-[#881337] uppercase text-[10px] tracking-wider block">
                  Hands-On Practice Labs
                </span>
                <p className="text-slate-700">
                  <strong>Threshold:</strong> ≥ 3 Practice Lab challenges passed with test runner verification.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Verified through automated unit test assertions and SHA-256 evidence generation.
                </p>
              </div>

              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#FFE4E6] space-y-2">
                <span className="font-bold text-[#881337] uppercase text-[10px] tracking-wider block">
                  Capstone Project Review
                </span>
                <p className="text-slate-700">
                  <strong>Threshold:</strong> Rubric score ≥ 25 / 35 marks with Authorized Evaluator Approval.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Requires non-self-review by a certified instructor, reviewer, or administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#FFE4E6] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-black text-[#1C0D12]">Immutable Academic &amp; Credential Audit Log</h3>
            <p className="text-xs text-slate-600">
              Cryptographically timestamped trail of all administrative actions, issuances, and revocations.
            </p>

            <div className="divide-y divide-[#FFE4E6] border-t border-[#FFE4E6] pt-2">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No audit events recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            log.action === 'REVOKED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-[#1C0D12]">{log.credentialId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        By: <span className="font-mono text-slate-700">{log.performedBy}</span>
                        {log.reason && <span className="ml-2 italic text-rose-700">— &quot;{log.reason}&quot;</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
