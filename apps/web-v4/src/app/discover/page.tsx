"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Globe,
  TrendingUp,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Eye,
  Heart,
  Clock,
  AlertCircle,
  ArrowRight,
  Zap,
  Building2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ProjectCard } from "@/components/cards/project-card";
import { ProjectCoverMedia } from "@/components/project/ProjectCoverMedia";
import { getBrandGradientSpec } from "@/lib/project-brand-gradient";

interface Project {
  id: string;
  title: string;
  summary?: string | null;
  description: string | null;
  status: string;
  iec_level: string | null;
  industry: string | null;
  stage?: string | null;
  funding_stage: string | null;
  funding_need_amount: number | null;
  funding_currency?: string | null;
  hero_image_url?: string | null;
  view_count?: number | null;
  interest_count?: number | null;
  brand_palette?: string | null;
  growth_rate_pct?: number | null;
  last_activity_at?: string | null;
  created_at: string;
}

type SortKey = "trending" | "newest" | "most_viewed" | "funding";
type ViewMode = "grid" | "list";

const STAGES = ["Seed", "Series A", "Series B", "Series C", "Pre-IPO"];

function formatCurrency(amount: number | null, currency?: string | null) {
  if (!amount) return null;
  const c = currency ?? "USD";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function formatActivityAge(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  const isInactive = days > 90;
  if (days === 0) return { label: "Today", isInactive };
  if (days === 1) return { label: "Yesterday", isInactive };
  if (days < 30) return { label: `${days}d ago`, isInactive };
  if (days < 60) return { label: "~1mo ago", isInactive };
  if (days < 90) return { label: "~2mo ago", isInactive };
  return { label: `${days}d inactive`, isInactive };
}

// ─── Featured hero card (horizontal, full-width) ─────────────────────────────
function FeaturedCard({ project }: { project: Project }) {
  const g = getBrandGradientSpec(project.brand_palette);
  const funding = formatCurrency(project.funding_need_amount, project.funding_currency);
  const activity = project.last_activity_at ? formatActivityAge(project.last_activity_at) : null;
  const stage = project.stage ?? project.funding_stage;

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <motion.div
        className="rounded-2xl p-[1.5px] overflow-hidden"
        style={{ background: g.css }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div className="rounded-[0.875rem] bg-white/95 backdrop-blur-sm overflow-hidden group">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Image */}
            <div className="md:col-span-2 relative h-48 md:h-full min-h-[180px]">
              <ProjectCoverMedia
                imageUrl={project.hero_image_url}
                industry={project.industry}
                size="lg"
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 hidden md:block pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent md:hidden pointer-events-none" />

                {/* Trending badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/90 text-white text-[11px] font-semibold backdrop-blur-sm shadow-lg">
                  <Zap className="w-3 h-3" />
                  Featured
                </div>
              </ProjectCoverMedia>
            </div>

            {/* Content */}
            <div className="md:col-span-3 p-5 md:p-7 flex flex-col justify-between relative">
              <div
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-60 ${g.softWash}`}
                aria-hidden
              />

              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.industry && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/6 text-slate-700 font-medium">
                      {project.industry}
                    </span>
                  )}
                  {stage && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-700 font-semibold">
                      {stage}
                    </span>
                  )}
                  {project.growth_rate_pct != null && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />+{project.growth_rate_pct}%
                    </span>
                  )}
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors leading-tight">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600/70 line-clamp-3 leading-relaxed">
                  {project.summary ?? project.description ?? ""}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  {funding && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <DollarSign className="w-4 h-4 text-brand/70" />
                      <span className="text-sm font-semibold">{funding}</span>
                      <span className="text-xs text-slate-500">raise</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-600/60">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-xs">{(project.view_count ?? 0).toLocaleString()}</span>
                  </div>
                  {(project.interest_count ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-rose-600/70">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{project.interest_count}</span>
                    </div>
                  )}
                  {activity && (
                    <div className={`flex items-center gap-1 ${activity.isInactive ? "text-amber-600/70" : "text-slate-500"}`}>
                      {activity.isInactive ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span className="text-xs">{activity.label}</span>
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:gap-2.5 transition-all">
                  View Project <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── List-view row ─────────────────────────────────────────────────────────
function ProjectListRow({ project, index }: { project: Project; index: number }) {
  const g = getBrandGradientSpec(project.brand_palette);
  const funding = formatCurrency(project.funding_need_amount, project.funding_currency);
  const stage = project.stage ?? project.funding_stage;
  const activity = project.last_activity_at ? formatActivityAge(project.last_activity_at) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/projects/${project.id}`} className="block">
        <div
          className="rounded-xl p-[1px] transition-transform duration-200 hover:scale-[1.005]"
          style={{ background: g.css }}
        >
          <div className="rounded-[0.6875rem] bg-white/95 backdrop-blur-sm group">
            <div className="flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                <ProjectCoverMedia
                  imageUrl={project.hero_image_url}
                  industry={project.industry}
                  size="sm"
                  className="w-full h-full"
                />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900 truncate group-hover:text-brand transition-colors">
                    {project.title}
                  </h4>
                  {stage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 font-semibold flex-shrink-0">
                      {stage}
                    </span>
                  )}
                  {project.industry && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/5 text-slate-600 flex-shrink-0">
                      {project.industry}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {project.summary ?? project.description ?? ""}
                </p>
              </div>

              {/* Metrics */}
              <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-slate-500">
                {funding && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-800">{funding}</div>
                    <div className="text-[10px]">raise</div>
                  </div>
                )}
                {project.growth_rate_pct != null && (
                  <div className="text-center">
                    <div className="text-sm font-semibold text-emerald-700">+{project.growth_rate_pct}%</div>
                    <div className="text-[10px]">growth</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-700">{(project.view_count ?? 0).toLocaleString()}</div>
                  <div className="text-[10px]">views</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-rose-600">{project.interest_count ?? 0}</div>
                  <div className="text-[10px]">interests</div>
                </div>
                {activity && (
                  <div className={`text-center ${activity.isInactive ? "text-amber-600" : "text-slate-500"}`}>
                    <div className="text-xs font-medium">{activity.label}</div>
                    <div className="text-[10px]">activity</div>
                  </div>
                )}
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors flex-shrink-0" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("trending");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const data = await api.get<Project[]>("/projects");
        setProjects(data);
      } catch (error) {
        console.error("Discover: failed to load projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const industries = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => { if (p.industry) set.add(p.industry); });
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const stage = p.stage ?? p.funding_stage ?? "";
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.summary?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchIndustry = industryFilter === "all" || p.industry === industryFilter;
      const matchStage = stageFilter === "all" || stage === stageFilter;
      return matchSearch && matchIndustry && matchStage;
    });

    switch (sortKey) {
      case "trending":
        list = [...list].sort((a, b) => (b.interest_count ?? 0) - (a.interest_count ?? 0));
        break;
      case "newest":
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "most_viewed":
        list = [...list].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
        break;
      case "funding":
        list = [...list].sort((a, b) => (b.funding_need_amount ?? 0) - (a.funding_need_amount ?? 0));
        break;
    }
    return list;
  }, [projects, search, industryFilter, stageFilter, sortKey]);

  // Featured = top by interest (only when no filter active)
  const featured = useMemo(() => {
    if (search || industryFilter !== "all" || stageFilter !== "all") return null;
    if (filtered.length === 0) return null;
    return [...filtered].sort((a, b) => (b.interest_count ?? 0) - (a.interest_count ?? 0))[0];
  }, [filtered, search, industryFilter, stageFilter]);

  const gridProjects = useMemo(() => {
    if (!featured) return filtered;
    return filtered.filter((p) => p.id !== featured.id);
  }, [filtered, featured]);

  // Stats
  const totalRaise = useMemo(() =>
    projects.reduce((s, p) => s + (p.funding_need_amount ?? 0), 0), [projects]);

  return (
    <div className="min-h-screen px-4 md:px-8 pr-4 md:pr-32 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Discover <span className="text-brand">Projects</span>
            </h1>
            <p className="text-sm text-slate-500">
              Explore startup opportunities and connect with the right founders.
            </p>
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-400 shrink-0">
            Hello, {user?.full_name?.split(" ")[0] ?? "Guest"}
          </p>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────── */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Building2, label: "Active Projects", value: projects.length.toString() },
              { icon: Globe, label: "Industries", value: industries.length.toString() },
              { icon: DollarSign, label: "Total Raise", value: formatCurrency(totalRaise, "USD") ?? "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-brand/70" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{value}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Controls ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, descriptions..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand/50 text-sm"
              />
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand/50 cursor-pointer"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="funding">Largest Raise</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl bg-white/80 border border-slate-200 overflow-hidden shrink-0">
              {(["grid", "list"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-2 transition-colors ${viewMode === v ? "bg-brand/10 text-brand" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap">
            {/* Industry chips */}
            <button
              onClick={() => setIndustryFilter("all")}
              className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                industryFilter === "all"
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white/70 text-slate-600 border-slate-200 hover:border-brand/40"
              }`}
            >
              All Industries
            </button>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustryFilter(industryFilter === ind ? "all" : ind)}
                className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                  industryFilter === ind
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-white/70 text-slate-600 border-slate-200 hover:border-brand/40"
                }`}
              >
                {ind}
              </button>
            ))}

            {/* Stage chips separator */}
            <div className="h-5 w-px bg-slate-200 self-center mx-1" />

            <button
              onClick={() => setStageFilter("all")}
              className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                stageFilter === "all"
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white/70 text-slate-600 border-slate-200 hover:border-violet-400"
              }`}
            >
              All Stages
            </button>
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(stageFilter === s ? "all" : s)}
                className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                  stageFilter === s
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white/70 text-slate-600 border-slate-200 hover:border-violet-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Result count ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
          {loading ? (
            <><Package className="w-3.5 h-3.5 animate-spin" /> Loading...</>
          ) : (
            <><Globe className="w-3.5 h-3.5" /> {filtered.length} project{filtered.length !== 1 ? "s" : ""} found</>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="min-h-[240px] flex items-center justify-center">
            <span className="text-slate-400 text-sm">Loading projects...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="min-h-[240px] flex flex-col items-center justify-center gap-3">
            <Package className="w-10 h-10 text-slate-300" />
            <span className="text-slate-500 text-sm">No projects match your filters.</span>
            <button
              onClick={() => { setSearch(""); setIndustryFilter("all"); setStageFilter("all"); }}
              className="text-xs text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Featured banner (grid mode only, no active filter) */}
              {viewMode === "grid" && featured && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold text-brand uppercase tracking-widest">Most Popular</span>
                  </div>
                  <FeaturedCard project={featured} />
                </div>
              )}

              {/* Grid view */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {gridProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        title: project.title,
                        description: project.summary ?? project.description ?? "No description",
                        coverImage: project.hero_image_url ?? null,
                        matchScore:
                          project.interest_count != null && project.interest_count > 0
                            ? Math.min(99, 50 + project.interest_count * 3)
                            : undefined,
                        views: typeof project.view_count === "number" ? project.view_count : 0,
                        tier: "public",
                        industries: project.industry ? [project.industry] : [],
                        brandPalette: project.brand_palette ?? null,
                        growthRatePct: project.growth_rate_pct ?? null,
                        interestCount: project.interest_count ?? null,
                        lastActivityAt: project.last_activity_at ?? null,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* List view */}
              {viewMode === "list" && (
                <div className="flex flex-col gap-2">
                  {filtered.map((project, i) => (
                    <ProjectListRow key={project.id} project={project} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
