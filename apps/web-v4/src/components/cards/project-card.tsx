"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Lock, Globe, ShieldCheck, Heart, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { MatchScore } from "@/components/ui/match-score";
import { ProjectCoverMedia } from "@/components/project/ProjectCoverMedia";
import { getBrandGradientSpec } from "@/lib/project-brand-gradient";

export interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  matchScore?: number;
  views: number;
  tier: "public" | "protected" | "confidential";
  industries: string[];
  brandPalette?: string | null;
  growthRatePct?: number | null;
  interestCount?: number | null;
  lastActivityAt?: string | null;
}

function formatActivityAge(iso: string): { label: string; isInactive: boolean } {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  const isInactive = days > 90;
  if (days === 0) return { label: "Updated today", isInactive };
  if (days === 1) return { label: "Updated yesterday", isInactive };
  if (days < 30) return { label: `Updated ${days}d ago`, isInactive };
  if (days < 60) return { label: "Updated ~1mo ago", isInactive };
  if (days < 90) return { label: "Updated ~2mo ago", isInactive };
  return { label: `${days}d no update`, isInactive };
}

interface ProjectCardProps {
  project: ProjectCardData;
}

const tierConfig = {
  public: {
    icon: Globe,
    label: "Public",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/35",
  },
  protected: {
    icon: ShieldCheck,
    label: "Protected",
    color: "text-blue-600",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/35",
  },
  confidential: {
    icon: Lock,
    label: "Confidential",
    color: "text-amber-700",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/35",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const tier = tierConfig[project.tier];
  const TierIcon = tier.icon;
  const industry = project.industries[0] ?? null;
  const g = getBrandGradientSpec(project.brandPalette);
  const growth = project.growthRatePct;
  const interest = project.interestCount;
  const activity = project.lastActivityAt ? formatActivityAge(project.lastActivityAt) : null;

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div
        className="rounded-2xl p-[1px] h-full transition-transform duration-300 hover:scale-[1.01]"
        style={{ background: g.css }}
      >
        <motion.div
          className="glow-card group cursor-pointer overflow-hidden h-full rounded-[0.925rem] bg-white/95 backdrop-blur-sm shadow-sm"
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <ProjectCoverMedia
            imageUrl={project.coverImage}
            industry={industry}
            className="h-32"
            size="sm"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/88 via-white/48 to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 z-[1] flex flex-wrap gap-1.5 max-w-[70%]">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${tier.bgColor} border ${tier.borderColor}`}>
                <TierIcon className={`w-3 h-3 ${tier.color}`} />
                <span className={`text-[10px] font-medium ${tier.color}`}>{tier.label}</span>
              </div>
              {growth != null && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                  <TrendingUp className="w-3 h-3 text-emerald-700" />
                  <span className="text-[10px] font-semibold text-emerald-800">+{growth}%</span>
                </div>
              )}
            </div>

            <div className="absolute top-3 right-3 z-[1] flex flex-col items-end gap-1.5">
              {project.matchScore ? <MatchScore score={project.matchScore} size="sm" /> : null}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/10 border border-slate-200/80 backdrop-blur-sm">
                <Eye className="w-3 h-3 text-slate-700/70" />
                <span className="text-[10px] font-semibold text-slate-700/80">
                  {project.views.toLocaleString()}
                </span>
              </div>
              {interest != null && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-200/80 backdrop-blur-sm">
                  <Heart className="w-3 h-3 text-rose-600/90" />
                  <span className="text-[10px] font-semibold text-rose-800/90">{interest}</span>
                </div>
              )}
            </div>

            {project.tier === "confidential" && (
              <motion.div
                className="absolute inset-0 z-[2] xray-locked opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-slate-900/20" />
                </div>
              </motion.div>
            )}
          </ProjectCoverMedia>

          <div className="p-4 relative">
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 ${g.softWash}`}
              aria-hidden
            />
            <h4 className="font-semibold mb-1 truncate group-hover:text-brand transition-colors pt-1">
              {project.title}
            </h4>
            <p className="text-xs text-slate-600/50 mb-3 line-clamp-2">{project.description}</p>

            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {project.industries.slice(0, 2).map((ind) => (
                <span key={ind} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/5 text-slate-700/60">
                  {ind}
                </span>
              ))}
              {project.industries.length > 2 && (
                <span className="text-[10px] text-slate-600/40">+{project.industries.length - 2}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
              {/* p2-14: last_activity_at signal */}
              {activity ? (
                <div className={`flex items-center gap-1 ${activity.isInactive ? "text-amber-600/70" : "text-slate-600/40"}`}>
                  {activity.isInactive
                    ? <AlertCircle className="w-3 h-3" />
                    : <Clock className="w-3 h-3" />}
                  <span className="text-[10px] font-medium">{activity.label}</span>
                </div>
              ) : (
                <div className="text-[10px] font-medium text-slate-600/40">Portfolio</div>
              )}
              <span className="btn-ghost text-xs pointer-events-none">View Details</span>
            </div>
          </div>

          <motion.div
            className="absolute inset-0 rounded-[0.925rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0), transparent 55%)`,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.25)`,
            }}
          />
        </motion.div>
      </div>
    </Link>
  );
}
