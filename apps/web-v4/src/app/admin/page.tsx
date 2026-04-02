'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  Settings,
  LogOut,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react';

/** Khớp GET /api/admin/dashboard/metrics */
interface AdminMetricsApi {
  startups: number;
  investors: number;
  projects: number;
  matches: number;
  iec_distribution: { L0: number; L1: number; L3: number };
}

interface AdminMetrics {
  total_users: number;
  total_investors: number;
  total_startups: number;
  total_projects: number;
  total_matches: number;
  pending_approvals: number;
}

/** Khớp AuditLog từ Prisma (GET /api/admin/audit-logs) */
interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  payload_before?: unknown;
  payload_after?: unknown;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.user_type !== 'admin') {
      toast.error('Access denied');
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchMetrics = async () => {
    try {
      const raw = await api.get<AdminMetricsApi>('/admin/dashboard/metrics');
      const pendingRes = await api
        .get<{ pending: unknown[] }>('/admin/approvals/pending')
        .catch(() => ({ pending: [] }));
      const pending = Array.isArray(pendingRes.pending)
        ? pendingRes.pending.length
        : 0;
      setMetrics({
        total_users: raw.startups + raw.investors,
        total_investors: raw.investors,
        total_startups: raw.startups,
        total_projects: raw.projects,
        total_matches: raw.matches,
        pending_approvals: pending,
      });
    } catch (error) {
      toast.error('Failed to load metrics');
      console.error('Fetch metrics error:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const rows = await api.get<AuditLog[]>('/admin/audit-logs?take=20');
      setAuditLogs(Array.isArray(rows) ? rows : []);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error('Fetch logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_type === 'admin') {
      fetchMetrics();
      fetchAuditLogs();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (user.user_type !== 'admin') {
    return null;
  }

  const metricCards = [
    { label: 'Total Users', value: metrics?.total_users || 0, icon: Users, color: 'blue' },
    { label: 'Investors', value: metrics?.total_investors || 0, icon: TrendingUp, color: 'green' },
    { label: 'Startups', value: metrics?.total_startups || 0, icon: BarChart3, color: 'purple' },
    { label: 'Projects', value: metrics?.total_projects || 0, icon: Activity, color: 'amber' },
    { label: 'Matches', value: metrics?.total_matches || 0, icon: CheckCircle, color: 'cyan' },
    {
      label: 'Pending Approvals',
      value: metrics?.pending_approvals || 0,
      icon: AlertCircle,
      color: 'red',
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'update':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'delete':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'approve':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'reject':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-20 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">System metrics and activity logs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/settings')}
            className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            const colorMap: Record<string, string> = {
              blue: 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent',
              green: 'border-l-green-500 bg-gradient-to-r from-green-500/10 to-transparent',
              purple: 'border-l-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent',
              amber: 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent',
              cyan: 'border-l-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent',
              red: 'border-l-red-500 bg-gradient-to-r from-red-500/10 to-transparent',
            };

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-lg border-l-4 ${colorMap[card.color]} border border-slate-700/30`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium mb-2">{card.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{card.value.toLocaleString()}</h3>
                  </div>
                  <Icon className="w-6 h-6 text-slate-600" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Audit Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-lg border border-slate-700/30 bg-slate-800/20 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-700/30">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block">
                <div className="w-6 h-6 rounded-full border-2 border-slate-500 border-t-blue-400 animate-spin" />
              </div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No activity logged yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {auditLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedLog(log)}
                  className="px-6 py-4 hover:bg-slate-700/20 transition-colors cursor-pointer border-b border-slate-700/20 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Action Badge */}
                    <div
                      className={`px-3 py-1 rounded text-xs font-semibold border ${getActionColor(log.action)}`}
                    >
                      {log.action.toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium">
                        {log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1)}{' '}
                        <span className="text-slate-400">{log.entity_id ?? '—'}</span>
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Actor: {log.actor_id ?? '—'}</p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-slate-500 text-sm flex-shrink-0">
                      <Clock className="w-4 h-4" />
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Detail Modal */}
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLog(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-white mb-4">Activity Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Action</p>
                  <p className="text-slate-900 font-medium capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-slate-400">Entity type</p>
                  <p className="text-slate-900 font-medium capitalize">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <p className="text-slate-400">Entity ID</p>
                  <p className="text-slate-900 font-mono text-xs">{selectedLog.entity_id ?? '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Actor ID</p>
                  <p className="text-slate-900 font-mono text-xs">{selectedLog.actor_id ?? '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Timestamp</p>
                  <p className="text-slate-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                {(selectedLog.payload_after ?? selectedLog.payload_before) != null && (
                  <div>
                    <p className="text-slate-400">Payload</p>
                    <pre className="text-slate-300 bg-slate-900/50 p-2 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(
                        { before: selectedLog.payload_before, after: selectedLog.payload_after },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLog(null)}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium border border-blue-500/30 transition-colors"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
