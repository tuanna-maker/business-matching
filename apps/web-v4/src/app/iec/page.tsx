'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Zap,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Award,
  Info,
} from 'lucide-react';

interface IECVerification {
  id: string;
  user_id: string;
  iec_level: number;
  iec_score: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  trust_score: number;
  verification_date?: string;
  documents?: Array<{ name: string; status: 'pending' | 'verified' | 'rejected' }>;
  next_review_date?: string;
  created_at: string;
}

function normalizeOrgVerification(
  s: string | undefined
): IECVerification['verification_status'] {
  if (s === 'verified') return 'verified';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

/** Cùng ngưỡng badge TrustScoreService.getBadgeLevel (0–100) → cấp hiển thị 0–4 */
function scoreToIecLevel(score: number): number {
  if (score >= 90) return 4;
  if (score >= 75) return 3;
  if (score >= 60) return 2;
  if (score >= 40) return 1;
  return 0;
}

function buildVerificationFromTrust(
  user: NonNullable<ReturnType<typeof useAuth>['user']>,
  trust: {
    score?: unknown;
    iec_score?: unknown;
  } | null
): IECVerification {
  const scoreNum = trust != null ? Number(trust.score) : 0;
  const iecScoreNum = trust != null ? Number(trust.iec_score) : 0;
  const orgVs = normalizeOrgVerification(user.org?.verification_status);
  return {
    id: user.org_id ?? user.id,
    user_id: user.id,
    iec_level: scoreToIecLevel(Number.isFinite(scoreNum) ? scoreNum : 0),
    iec_score: Math.min(
      100,
      Math.max(0, Math.round(Number.isFinite(iecScoreNum) ? iecScoreNum : 0))
    ),
    verification_status: orgVs,
    trust_score: Math.min(
      100,
      Math.max(0, Math.round(Number.isFinite(scoreNum) ? scoreNum : 0))
    ),
    documents: [],
    created_at: new Date().toISOString(),
  };
}

export default function IECVerificationPage() {
  const { user } = useAuth();
  const [verification, setVerification] = useState<IECVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchVerification = useCallback(async () => {
    if (!user?.org_id) {
      setVerification(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const trust = await api.get<{
        score?: unknown;
        iec_score?: unknown;
      } | null>(`/org/${user.org_id}/trust-score`);
      setVerification(buildVerificationFromTrust(user, trust));
    } catch (error) {
      toast.error('Failed to load verification status');
      console.error('Fetch verification error:', error);
      setVerification(buildVerificationFromTrust(user, null));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void fetchVerification();
  }, [user, fetchVerification]);

  const handleSubmitVerification = async () => {
    if (!user?.org_id) {
      toast.error('Bạn chưa thuộc tổ chức nào. Vui lòng tạo hoặc gia nhập một Organization trước.');
      return;
    }
    try {
      setSubmitting(true);
      // p0-5: /iec/verify không tồn tại — dùng recalculate trust score thay thế
      await api.post(`/org/${user.org_id}/trust-score/recalculate`, {});
      toast.success('Trust Score đã được cập nhật. IEC Verification cần được admin duyệt riêng.');
      fetchVerification();
    } catch (error) {
      toast.error('Failed to refresh trust score');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', icon: <CheckCircle className="w-5 h-5" /> };
      case 'pending':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300', icon: <Clock className="w-5 h-5" /> };
      case 'rejected':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', icon: <AlertCircle className="w-5 h-5" /> };
      default:
        return { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-300', icon: <Info className="w-5 h-5" /> };
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'from-yellow-500 to-amber-500';
    if (level >= 3) return 'from-purple-500 to-pink-500';
    if (level >= 2) return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-emerald-500';
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 4:
        return 'Platinum';
      case 3:
        return 'Gold';
      case 2:
        return 'Silver';
      case 1:
        return 'Bronze';
      default:
        return 'Unverified';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-500 border-t-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-400" aria-hidden />
            IEC Verification
          </h1>
          <p className="text-slate-600">
            Link your account to an organization to view trust score and IEC level.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(verification.verification_status || 'pending');
  const levelColor = getLevelColor(verification.iec_level || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-400" aria-hidden />
            IEC Verification
          </h1>
          <p className="text-slate-400">
            Investment Energy Currency trust score and verification level
          </p>
        </div>

        {/* Main Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-lg border ${statusColor.border} ${statusColor.bg} mb-8`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-slate-900/50`}>{statusColor.icon}</div>
              <div>
                <p className="text-slate-400 text-sm">Verification Status</p>
                <h2 className={`text-2xl font-bold ${statusColor.text}`}>
                  {(verification.verification_status ?? 'pending').toUpperCase()}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Trust Score</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {verification.trust_score || 0}%
              </p>
            </div>
          </div>

          {verification.next_review_date && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">
                Next review:{' '}
                {new Date(verification.next_review_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </motion.div>

        {/* IEC Level Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg border border-slate-700/30 bg-slate-800/20 mb-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            IEC Level
          </h3>

          <div className="flex items-center gap-6">
            {/* Level Display */}
            <div className="flex-shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${levelColor} flex items-center justify-center flex-col border-2 border-slate-700/50`}
              >
                <p className="text-4xl font-bold text-slate-900">{verification.iec_level || 0}</p>
                <p className="text-xs text-slate-200 text-center">Level</p>
              </motion.div>
            </div>

            {/* Level Info */}
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                {getLevelLabel(verification.iec_level || 0)}
              </h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">
                    IEC Score: {verification.iec_score || 0}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">
                    {verification.verification_status === 'verified'
                      ? 'Identity verified'
                      : 'Awaiting verification'}
                  </span>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Progress to next level</p>
                <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden border border-slate-600/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((verification.iec_score || 0) / 100) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${levelColor}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Documents */}
        {verification.documents && verification.documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg border border-slate-700/30 bg-slate-800/20 mb-8"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Verification Documents</h3>

            <div className="space-y-3">
              {verification.documents.map((doc, idx) => {
                const docStatus = getStatusColor(doc.status);
                return (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-600/20"
                  >
                    <span className="text-slate-200 font-medium">{doc.name}</span>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold border ${docStatus.border} ${docStatus.bg} ${docStatus.text}`}>
                      {docStatus.icon}
                      {doc.status.toUpperCase()}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          {verification.verification_status === 'pending' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitVerification}
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium border border-blue-400/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </motion.button>
          )}

          {verification.verification_status === 'rejected' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitVerification}
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium border border-amber-400/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resubmitting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resubmit
                </>
              )}
            </motion.button>
          )}

          <Link href="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 font-medium border border-slate-600/50 transition-colors"
            >
              Settings
            </motion.button>
          </Link>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">About IEC (Investment Energy Currency)</p>
              <p>
                Your IEC Level reflects your trustworthiness within the platform. Higher levels
                unlock more opportunities and features. Maintain your level by staying active and
                engaged in the community.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
