"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Building2,
  Rocket,
  Shield,
  Calendar,
  Plus,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";
import { MatchScore } from "@/components/ui/match-score";
import { ProjectCard } from "@/components/cards/project-card";
import { FeaturedOpportunity } from "@/components/dashboard/featured-opportunity";
import { StatCard } from "@/components/cards/stat-card";
import { QuickAction } from "@/components/cards/quick-action";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

interface AnalyticsOverview {
  total_projects: number;
  total_organizations: number;
  total_matches: number;
  total_investors: number;
  total_startups: number;
  active_deals: number;
  closed_deals: number;
  projects_growth_pct?: number;
  organizations_growth_pct?: number;
  matches_growth_pct?: number;
  platform_users_growth_pct?: number;
}

interface Project {
  id: string;
  title: string;
  summary?: string | null;
  description: string | null;
  status: string;
  iec_level: string | null;
  industry: string | null;
  stage: string | null;
  funding_need_amount: number | null;
  hero_image_url?: string | null;
  view_count?: number | null;
  interest_count?: number | null;
  brand_palette?: string | null;
  growth_rate_pct?: number | null;
  created_at: string;
}

interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
}

function getTrustLevel(score: number): "newcomer" | "verified" | "trusted" | "elite" {
  if (score >= 80) return "elite";
  if (score >= 60) return "trusted";
  if (score >= 30) return "verified";
  return "newcomer";
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [analyticsRes, projectsRes, notifRes] = await Promise.allSettled([
          api.get<AnalyticsOverview>("/analytics/overview"),
          api.get<Project[]>("/projects?owner=me"),
          api.get<Notification[]>("/notifications"),
        ]);

        if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
        if (projectsRes.status === "fulfilled") setProjects(projectsRes.value);
        if (notifRes.status === "fulfilled") setNotifications(notifRes.value);

        // Fetch trust score if org exists
        if (user?.org_id) {
          try {
            const ts = await api.get<{
              score?: number | null;
            } | null>(`/org/${user.org_id}/trust-score`);
            const s = ts && typeof ts === "object" ? ts.score : null;
            setTrustScore(typeof s === "number" ? s : null);
          } catch {
            setTrustScore(null);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchDashboardData();
  }, [user]);

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const orgName = user?.org?.name || "Your Organization";
  const trustScoreAvailable = trustScore !== null;
  const trustLevel = trustScoreAvailable ? getTrustLevel(trustScore!) : "newcomer";
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const spotlightProject = useMemo(() => {
    if (!projects.length) return null;
    return [...projects].sort(
      (a, b) => (b.interest_count ?? 0) - (a.interest_count ?? 0)
    )[0];
  }, [projects]);

  const projectCards = projects.slice(0, 3).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description || p.summary || "No description",
    coverImage: p.hero_image_url ?? null,
    matchScore: (p as any).interest_count != null && (p as any).interest_count > 0
      ? Math.min(99, 50 + (p as any).interest_count * 3)
      : undefined,
    views: typeof p.view_count === "number" ? p.view_count : 0,
    tier: "public" as const,
    industries: [p.industry || "General"].filter(Boolean),
    brandPalette: p.brand_palette ?? null,
    growthRatePct: p.growth_rate_pct ?? null,
    interestCount: p.interest_count ?? null,
    lastActivityAt: (p as any).last_activity_at ?? null,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
          <span className="text-slate-600/40 text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, <span className="text-brand">{firstName}</span>
              </motion.h1>
              <div className="flex items-center gap-3">
                <span className="text-slate-600/60">{orgName}</span>
                <span className="text-slate-600/30">•</span>
                {trustScoreAvailable ? <TrustBadge level={trustLevel} score={trustScore!} /> : null}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {/* Trust Score Card (moved into header so it doesn't overlap content) */}
              <motion.div
                className="w-56 glass-card p-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-trust-trusted/20 to-trust-trusted/5 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-trust-trusted" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Trust Score</div>
                    <div className="text-xs text-slate-600/40 truncate">{user?.org?.name || "Your org"}</div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-2xl font-bold">{trustScoreAvailable ? trustScore : "—"}</span>
                    {trustScoreAvailable && <span className="text-xs text-slate-600/40">/100</span>}
                  </div>

                  {trustScoreAvailable ? (
                    <div className="h-2 rounded-full bg-slate-900/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-trust-verified via-trust-trusted to-trust-elite"
                        initial={{ width: 0 }}
                        animate={{ width: `${trustScore!}%` }}
                        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  ) : (
                    <div className="h-2 rounded-full bg-slate-900/5 overflow-hidden">
                      <div className="h-full w-full bg-slate-900/5" />
                    </div>
                  )}

                  <div className="flex justify-between mt-2 text-[10px] text-slate-600/30">
                    <span>Newcomer</span>
                    <span>Verified</span>
                    <span>Trusted</span>
                    <span>Elite</span>
                  </div>
                </div>
              </motion.div>

              {/* OA Switcher */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="glass-card px-4 py-2 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-accent-cyan flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{orgName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-900/5 text-slate-700/60">
                    {user?.user_type}
                  </span>
                </motion.div>

                {/* Logout */}
                <motion.button
                  onClick={logout}
                  className="glass-card p-2.5 text-slate-600/40 hover:text-slate-900/80 hover:bg-slate-900/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Stats Row - 4 columns */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={FolderOpen}
              label="My Projects"
              value={projects.length}
              change={analytics?.projects_growth_pct}
              changeType={
                (analytics?.projects_growth_pct ?? 0) >= 0 ? "positive" : "negative"
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={Sparkles}
              label="Active Matches"
              value={analytics?.total_matches || 0}
              badge={analytics?.active_deals ? `${analytics.active_deals} active` : undefined}
              change={analytics?.matches_growth_pct}
              changeType={
                (analytics?.matches_growth_pct ?? 0) >= 0 ? "positive" : "negative"
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={Building2}
              label="Organizations"
              value={analytics?.total_organizations || 0}
              change={analytics?.organizations_growth_pct}
              changeType={
                (analytics?.organizations_growth_pct ?? 0) >= 0 ? "positive" : "negative"
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={Shield}
              label="Notifications"
              value={unreadCount}
              badge={unreadCount > 0 ? "Unread" : undefined}
              badgeType={unreadCount > 0 ? "warning" : undefined}
            />
          </motion.div>

          {/* Featured opportunity — glass hero + Invest Now */}
          <motion.div variants={itemVariants} className="bento-item bento-item--hero span-2 row-span-2 overflow-hidden">
            {spotlightProject ? (
              <FeaturedOpportunity
                project={{
                  id: spotlightProject.id,
                  title: spotlightProject.title,
                  summary: spotlightProject.summary,
                  description: spotlightProject.description,
                  industry: spotlightProject.industry,
                  stage: spotlightProject.stage,
                  hero_image_url: spotlightProject.hero_image_url,
                  brand_palette: spotlightProject.brand_palette,
                  growth_rate_pct: spotlightProject.growth_rate_pct,
                  interest_count: spotlightProject.interest_count,
                  status: spotlightProject.status,
                }}
              />
            ) : (
              <div className="h-full p-6 flex flex-col items-center justify-center text-center min-h-[360px]">
                <div className="w-16 h-16 rounded-2xl bg-white/70 border border-slate-200/80 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-slate-900/20" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-600/60">No projects yet</h3>
                <p className="text-sm text-slate-600/30 mb-4">Create your first project to start matching</p>
                <Link href="/projects" className="btn-primary text-sm">
                  <Plus className="w-4 h-4" /> Create Project
                </Link>
              </div>
            )}
          </motion.div>

          {/* Ecosystem Stats - 2 columns */}
          <motion.div variants={itemVariants} className="bento-item span-2 row-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ecosystem Overview</h3>
            </div>

            <div className="space-y-4">
              {(() => {
                // p3-19: barPct dựa trên dữ liệu thật — relative to max value
                const totalProjects = analytics?.total_projects ?? 0;
                const totalOrgs = analytics?.total_organizations ?? 0;
                const totalMatches = analytics?.total_matches ?? 0;
                const totalUsers = (analytics?.total_investors ?? 0) + (analytics?.total_startups ?? 0);
                const maxVal = Math.max(totalProjects, totalOrgs, totalMatches, totalUsers, 1);
                const rows = [
                  {
                    label: "Total Projects",
                    value: totalProjects,
                    growth: analytics?.projects_growth_pct,
                    barPct: Math.round((totalProjects / maxVal) * 100),
                    barClass: "bg-gradient-to-r from-violet-500 to-cyan-500",
                  },
                  {
                    label: "Active Organizations",
                    value: totalOrgs,
                    growth: analytics?.organizations_growth_pct,
                    barPct: Math.round((totalOrgs / maxVal) * 100),
                    barClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
                  },
                  {
                    label: "Total Matches",
                    value: totalMatches,
                    growth: analytics?.matches_growth_pct,
                    barPct: Math.round((totalMatches / maxVal) * 100),
                    barClass: "bg-gradient-to-r from-amber-500 to-rose-500",
                  },
                  {
                    label: "Platform users",
                    value: totalUsers,
                    growth: analytics?.platform_users_growth_pct,
                    barPct: Math.round((totalUsers / maxVal) * 100),
                    barClass: "bg-gradient-to-r from-sky-500 to-indigo-500",
                  },
                ];
                return rows;
              })().map((row, i) => (
                <div
                  key={row.label}
                  className="p-4 rounded-xl bg-slate-900/3 border border-slate-200/70 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm text-slate-600/70">{row.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.growth !== undefined && (
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            row.growth >= 0 ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {row.growth >= 0 ? "+" : ""}
                          {row.growth}%
                        </span>
                      )}
                      <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tabular-nums">
                        {row.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-900/5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${row.barClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.barPct}%` }}
                      transition={{ delay: 0.45 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Projects List - 3 columns */}
          <motion.div variants={itemVariants} className="bento-item span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Projects</h3>
              <div className="flex items-center gap-2">
                <Link href="/projects" className="btn-ghost text-xs">
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
                <Link href="/projects" className="btn-primary text-xs">
                  <Plus className="w-3 h-3" /> New Project
                </Link>
              </div>
            </div>

            {projectCards.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {projectCards.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600/30">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects yet. Create one to get started!</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions - 1 column */}
          <motion.div variants={itemVariants} className="bento-item">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <QuickAction
                icon={Shield}
                label="Data Vault"
                href="/vault"
              />
              <QuickAction
                icon={Sparkles}
                label="Explore Matches"
                href="/matches"
              />
              <QuickAction
                icon={Users}
                label="Manage Team"
                href="/settings"
              />
              <QuickAction
                icon={Eye}
                label="View Profile"
                href="/profile"
              />
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
