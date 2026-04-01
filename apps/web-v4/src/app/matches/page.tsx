"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface Match {
  id: string;
  project_id: string;
  startup_id: string;
  investor_id: string;
  status: string;
  iec_level_at_match: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  title: string;
}

interface Startup {
  id: string;
  company_name: string;
}

interface Investor {
  id: string;
  company_name: string;
}

interface MatchWithDetails extends Match {
  project?: Project;
  startup?: Startup;
  investor?: Investor;
}

const MATCH_STATUSES = [
  { key: "PENDING_INTRO", label: "Pending Intro", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: Clock },
  { key: "INTRO_DONE", label: "Intro Done", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertCircle },
  { key: "IN_DISCUSSION", label: "In Discussion", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: TrendingUp },
  { key: "MEETING_SCHEDULED", label: "Meeting Scheduled", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: Clock },
  { key: "DUE_DILIGENCE", label: "Due Diligence", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: TrendingUp },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: TrendingUp },
  { key: "CLOSED_DEAL", label: "Closed - Deal", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  { key: "CLOSED_LOST", label: "Closed - Lost", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
  { key: "REJECTED", label: "Rejected", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: XCircle },
];

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const data = await api.get<MatchWithDetails[]>("/matching/matches");
        setMatches(data);
      } catch (error) {
        toast.error("Failed to load matches");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const statusGroups = useMemo(() => {
    const groups: { [key: string]: MatchWithDetails[] } = {};

    MATCH_STATUSES.forEach((status) => {
      groups[status.key] = matches.filter((m) => m.status === status.key);
    });

    return groups;
  }, [matches]);

  const filteredMatches = selectedStatus ? statusGroups[selectedStatus] || [] : matches;

  const countByStatus = useMemo(() => {
    const counts: { [key: string]: number } = {};
    MATCH_STATUSES.forEach((status) => {
      counts[status.key] = statusGroups[status.key]?.length || 0;
    });
    return counts;
  }, [statusGroups]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1 w-fit max-w-full">
            Your <span className="text-brand">Matches</span>
          </h1>
          <p className="text-sm text-slate-600/60">
            Track your deal pipeline and manage match stages
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <motion.button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                !selectedStatus
                  ? "bg-slate-900/5 text-slate-700 border border-slate-200/80"
                  : "bg-slate-900/3 text-slate-600/60 hover:bg-slate-900/5 border border-slate-200/70"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              All ({matches.length})
            </motion.button>
            {MATCH_STATUSES.map((status) => {
              const count = countByStatus[status.key];
              return (
                <motion.button
                  key={status.key}
                  onClick={() => setSelectedStatus(selectedStatus === status.key ? null : status.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    selectedStatus === status.key
                      ? `${status.color}`
                      : "bg-slate-900/3 text-slate-600/60 hover:bg-slate-900/5 border-slate-200/70"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status.label} ({count})
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <span className="text-slate-600/60">Loading matches...</span>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center text-center">
            <div>
              <Filter className="w-12 h-12 text-slate-900/20 mx-auto mb-4" />
              <p className="text-slate-600/60">No matches in this stage</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const statusConfig = MATCH_STATUSES.find((s) => s.key === match.status) || MATCH_STATUSES[0];
              const StatusIcon = statusConfig.icon;

              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <motion.div
                    className="glass-card p-4 hover:bg-white/[0.08] transition-colors cursor-pointer group"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Status Badge + Match Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-lg border ${statusConfig.color} flex-shrink-0`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{match.project?.title || "Project"}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-600/50 mt-1">
                            <span>{match.startup?.company_name || "Startup"}</span>
                            <span>·</span>
                            <span>{match.investor?.company_name || "Investor"}</span>
                            {match.iec_level_at_match && (
                              <>
                                <span>·</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-900/5 text-slate-700/70">
                                  {match.iec_level_at_match}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Updated Date + Arrow */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-600/50">
                            {new Date(match.updated_at).toLocaleDateString()}
                          </p>
                          <p className={`text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-600/30 group-hover:text-slate-600/50 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
