"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  TrendingUp,
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

interface MatchEvent {
  id: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  note: string | null;
  created_at: string;
}

// Trạng thái trong DB dùng lowercase (khớp MatchStatus enum trong shared)
const STATUS_LABELS: { [key: string]: string } = {
  pending_intro: "Pending Intro",
  intro_done: "Intro Done",
  in_discussion: "In Discussion",
  meeting_scheduled: "Meeting Scheduled",
  due_diligence: "Due Diligence",
  negotiation: "Negotiation",
  closed_deal: "Closed - Deal",
  closed_lost: "Closed - Lost",
  rejected: "Rejected",
};

// p1-10: transitions theo đúng enum lowercase — khớp với VALID_STAGE_TRANSITIONS ở BE
const VALID_TRANSITIONS: { [key: string]: string[] } = {
  pending_intro: ["intro_done", "rejected"],
  intro_done: ["in_discussion", "rejected", "closed_lost"],
  in_discussion: ["meeting_scheduled", "rejected", "closed_lost"],
  meeting_scheduled: ["due_diligence", "in_discussion", "rejected", "closed_lost"],
  due_diligence: ["negotiation", "rejected", "closed_lost"],
  negotiation: ["closed_deal", "closed_lost", "rejected"],
  closed_deal: [],
  closed_lost: [],
  rejected: [],
};

// p1-10: quyền chuyển trạng thái theo role
// startup: đẩy deal về phía trước hoặc decline
// investor: chỉ có thể withdraw (closed_lost/rejected từ phía mình)
const STARTUP_ALLOWED_TRANSITIONS: { [key: string]: string[] } = {
  pending_intro: ["intro_done", "rejected"],
  intro_done: ["in_discussion", "rejected"],
  in_discussion: ["meeting_scheduled", "rejected"],
  meeting_scheduled: ["due_diligence", "in_discussion", "rejected"],
  due_diligence: ["negotiation", "rejected"],
  negotiation: ["closed_deal", "closed_lost", "rejected"],
  closed_deal: [],
  closed_lost: [],
  rejected: [],
};

const INVESTOR_ALLOWED_TRANSITIONS: { [key: string]: string[] } = {
  pending_intro: ["closed_lost"],
  intro_done: ["closed_lost"],
  in_discussion: ["closed_lost"],
  meeting_scheduled: ["closed_lost"],
  due_diligence: ["closed_lost"],
  negotiation: ["closed_lost"],
  closed_deal: [],
  closed_lost: [],
  rejected: [],
};

export default function MatchDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showTransitionMenu, setShowTransitionMenu] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      try {
        const [matchData, eventsData] = await Promise.all([
          api.get<Match>(`/matching/matches/${matchId}`),
          api.get<MatchEvent[]>(`/matching/matches/${matchId}/events`),
        ]);
        setMatch(matchData);
        setEvents(eventsData);
      } catch (error) {
        toast.error("Failed to load match details");
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  const handleTransition = async (newStatus: string) => {
    if (!match) return;
    setTransitioning(true);
    try {
      const updated = await api.patch<Match>(`/matching/matches/${match.id}/status`, {
        status: newStatus,
      });
      setMatch(updated);

      // Fetch updated events
      const newEvents = await api.get<MatchEvent[]>(`/matching/matches/${matchId}/events`);
      setEvents(newEvents);

      setShowTransitionMenu(false);
      setNote("");
      toast.success(`Match transitioned to ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      toast.error("Failed to transition match status");
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen px-4 md:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link href="/matches" className="flex items-center gap-2 text-brand mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Matches
          </Link>
          <p className="text-slate-600/60">Match not found</p>
        </motion.div>
      </div>
    );
  }

  // p1-10: lọc transitions theo role người dùng
  const isStartup = user?.user_type === "startup";
  const roleTransitions = isStartup
    ? STARTUP_ALLOWED_TRANSITIONS
    : INVESTOR_ALLOWED_TRANSITIONS;
  const nextStatuses = roleTransitions[match.status] ?? [];

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/matches" className="flex items-center gap-2 text-brand mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>

        {/* Match Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 w-fit max-w-full">
                Match <span className="text-brand">Details</span>
              </h1>
              <p className="text-sm text-slate-600/60">
                Created {new Date(match.created_at).toLocaleDateString()} • Last updated{" "}
                {new Date(match.updated_at).toLocaleDateString()}
              </p>
            </div>

            {/* Status Transition */}
            <div className="relative">
              <motion.button
                onClick={() => setShowTransitionMenu(!showTransitionMenu)}
                disabled={nextStatuses.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  nextStatuses.length === 0
                    ? "bg-slate-900/5 text-slate-600/40 cursor-not-allowed"
                    : "bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30"
                }`}
                whileHover={nextStatuses.length > 0 ? { scale: 1.02 } : {}}
                whileTap={nextStatuses.length > 0 ? { scale: 0.98 } : {}}
              >
                {transitioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Progress
                  </>
                )}
                {nextStatuses.length > 0 && <ChevronDown className="w-4 h-4" />}
              </motion.button>

              {/* Dropdown Menu */}
              {showTransitionMenu && nextStatuses.length > 0 && (
                <motion.div
                  className="absolute right-0 mt-2 w-56 glass-card overflow-hidden z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {nextStatuses.map((status) => (
                    <motion.button
                      key={status}
                      onClick={() => handleTransition(status)}
                      disabled={transitioning}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-900/10 transition-colors first:pt-2 last:pb-2 border-b border-slate-200/70 last:border-0 disabled:opacity-50"
                      whileTap={{ scale: 0.98 }}
                    >
                      {STATUS_LABELS[status]}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="inline-block px-4 py-2 rounded-lg bg-slate-900/5 border border-slate-200/70 text-sm font-medium">
            ✓ Current Status: <span className="text-brand">{STATUS_LABELS[match.status]}</span>
          </div>
        </div>

        {/* Match Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-600/40" />
              <span className="text-xs uppercase text-slate-600/40">Project ID</span>
            </div>
            <p className="font-mono text-sm text-slate-800/80 truncate">{match.project_id}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-600/40" />
              <span className="text-xs uppercase text-slate-600/40">Startup ID</span>
            </div>
            <p className="font-mono text-sm text-slate-800/80 truncate">{match.startup_id}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-slate-600/40" />
              <span className="text-xs uppercase text-slate-600/40">Investor ID</span>
            </div>
            <p className="font-mono text-sm text-slate-800/80 truncate">{match.investor_id}</p>
          </div>
        </div>

        {match.iec_level_at_match && (
          <div className="glass-card p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-slate-600/40" />
              <span className="text-xs uppercase text-slate-600/40">IEC Level at Match</span>
            </div>
            <p className="text-lg font-semibold">{match.iec_level_at_match}</p>
          </div>
        )}

        {/* Match Events Timeline */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="glass-card p-6">
            {events.length === 0 ? (
              <p className="text-slate-600/40 text-sm">No events yet</p>
            ) : (
              <div className="space-y-4">
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4"
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/50 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-brand" />
                      </div>
                      {idx < events.length - 1 && <div className="w-0.5 h-8 bg-slate-900/5 my-2" />}
                    </div>

                    {/* Event content */}
                    <div className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                          {event.old_status && event.new_status && (
                            <p className="text-xs text-slate-600/50 mt-1">
                              {STATUS_LABELS[event.old_status]} → {STATUS_LABELS[event.new_status]}
                            </p>
                          )}
                          {event.note && <p className="text-sm text-slate-600/60 mt-2 italic">&quot;{event.note}&quot;</p>}
                        </div>
                        <span className="text-xs text-slate-600/40">{new Date(event.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
