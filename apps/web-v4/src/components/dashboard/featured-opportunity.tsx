"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles, TrendingUp } from "lucide-react";
import { getBrandGradientSpec } from "@/lib/project-brand-gradient";

export type FeaturedOpportunityProject = {
  id: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  industry?: string | null;
  stage?: string | null;
  hero_image_url?: string | null;
  brand_palette?: string | null;
  growth_rate_pct?: number | null;
  interest_count?: number | null;
  status?: string;
};

type Props = {
  project: FeaturedOpportunityProject;
};

/**
 * Single-surface hero: no “card inside card”. Image fills the bento cell; copy sits on a
 * full-width bottom scrim so the block reads as one editorial unit (streaming / fintech apps pattern).
 */
export function FeaturedOpportunity({ project }: Props) {
  const g = getBrandGradientSpec(project.brand_palette);
  const pitch = project.summary || project.description || "";
  const growth = typeof project.growth_rate_pct === "number" ? project.growth_rate_pct : null;
  const interest = typeof project.interest_count === "number" ? project.interest_count : null;

  return (
    <motion.div
      className="relative min-h-[400px] md:min-h-[420px] rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
    >
      {/* Photo / fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-[1.02]"
        style={{
          backgroundImage: project.hero_image_url ? `url(${project.hero_image_url})` : undefined,
          backgroundColor: project.hero_image_url ? undefined : "#0f172a",
        }}
      />

      {/* Readability: top vignette + full-width bottom scrim (one continuous layer) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/88 to-slate-950/20 pointer-events-none" />

      {/* Content: full width, aligned to bottom — no nested rounded “inner card” */}
      <div className="relative z-[2] flex min-h-[400px] md:min-h-[420px] flex-col justify-end">
        <div className="w-full px-5 pb-6 pt-10 md:px-8 md:pb-8 md:pt-14 border-t border-white/[0.08] backdrop-blur-[2px]">
          <div className="flex gap-4 md:gap-5">
            <div
              className="w-1 shrink-0 rounded-full self-stretch min-h-[4.5rem]"
              style={{ background: g.css }}
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/95">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" aria-hidden />
                  Featured opportunity
                </span>
                {project.status === "published" && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 border border-white/15">
                    Live on marketplace
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-[1.75rem] font-bold text-white tracking-tight leading-[1.15] mb-2 [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
                {project.title}
              </h2>
              <p className="text-sm md:text-[0.9375rem] text-white/80 leading-relaxed line-clamp-2 md:line-clamp-3 mb-5 max-w-3xl">
                {pitch}
              </p>

              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
                {project.industry ? (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-white/90 border border-white/10">
                    {project.industry}
                  </span>
                ) : null}
                {project.stage ? (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-white/90 border border-white/10">
                    {project.stage}
                  </span>
                ) : null}
                {interest != null ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/95 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                    <Heart className="w-3.5 h-3.5 text-rose-300" aria-hidden />
                    {interest.toLocaleString()} interested
                  </span>
                ) : null}
                {growth != null ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/20">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden />
                    +{growth}% momentum
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: g.css }}
                >
                  Invest Now
                  <ArrowUpRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/15 transition backdrop-blur-md"
                >
                  View deal profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
