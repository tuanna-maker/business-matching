"use client";

import { getIndustryVisual } from "@/lib/project-industry-visual";

type Props = {
  imageUrl?: string | null;
  industry?: string | null;
  className?: string;
  /** Icon scale: sm (cards) | md | lg (featured) */
  size?: "sm" | "md" | "lg";
  /** hero: darker overlay when no image (detail page hero) */
  tone?: "default" | "hero";
  children?: React.ReactNode;
};

const iconSize = {
  sm: "w-14 h-14 md:w-16 md:h-16",
  md: "w-20 h-20 md:w-24 md:h-24",
  lg: "w-24 h-24 md:w-32 md:h-32",
};

/**
 * Cover area: optional image (URL or data URL), otherwise industry-themed gradient + icon.
 */
export function ProjectCoverMedia({
  imageUrl,
  industry,
  className = "",
  size = "sm",
  tone = "default",
  children,
}: Props) {
  const v = getIndustryVisual(industry);
  const Icon = v.Icon;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div
            className={
              tone === "hero"
                ? "absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40"
                : "absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
            }
          />
        </>
      ) : (
        <>
          <div className={`absolute inset-0 ${v.gradient}`} />
          {tone === "hero" ? (
            <>
              <div className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/92 via-slate-900/78 to-slate-950/88" />
              <div
                className="absolute inset-0 z-[1] opacity-[0.12] mix-blend-overlay pointer-events-none noise-bg"
                aria-hidden
              />
            </>
          ) : null}
          <div className="absolute inset-0 z-[1] flex items-center justify-center">
            <Icon
              className={`${iconSize[size]} ${tone === "hero" ? "text-white/35" : v.iconClass} ${tone === "hero" ? "" : "opacity-[0.92]"} drop-shadow-md`}
              aria-hidden
            />
          </div>
        </>
      )}
      {children != null ? <div className="relative z-[3]">{children}</div> : null}
    </div>
  );
}
