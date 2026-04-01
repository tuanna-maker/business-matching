export type BrandPaletteKey =
  | "aurora"
  | "ocean"
  | "ember"
  | "forest"
  | "sunset"
  | "glacier"
  | "orchid"
  | "gold"
  | "nebula"
  | "rose";

export type BrandGradientSpec = {
  /** Full CSS linear-gradient for borders / CTAs */
  css: string;
  /** Soft wash for cards (Tailwind utility combo on a div) */
  softWash: string;
  /** Subtle inner highlight */
  glow: string;
};

const PALETTES: Record<BrandPaletteKey, BrandGradientSpec> = {
  aurora: {
    css: "linear-gradient(135deg, #7c3aed 0%, #db2777 52%, #22d3ee 100%)",
    softWash: "from-violet-500/20 via-fuchsia-500/12 to-cyan-400/18",
    glow: "shadow-[0_0_40px_-8px_rgba(124,58,237,0.45)]",
  },
  ocean: {
    css: "linear-gradient(135deg, #0369a1 0%, #06b6d4 48%, #34d399 100%)",
    softWash: "from-sky-600/20 via-cyan-500/15 to-emerald-400/18",
    glow: "shadow-[0_0_36px_-10px_rgba(6,182,212,0.5)]",
  },
  ember: {
    css: "linear-gradient(135deg, #ea580c 0%, #f97316 45%, #fbbf24 100%)",
    softWash: "from-orange-600/22 via-amber-500/15 to-yellow-400/14",
    glow: "shadow-[0_0_36px_-8px_rgba(249,115,22,0.45)]",
  },
  forest: {
    css: "linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%)",
    softWash: "from-green-800/20 via-emerald-500/16 to-lime-400/14",
    glow: "shadow-[0_0_32px_-8px_rgba(34,197,94,0.4)]",
  },
  sunset: {
    css: "linear-gradient(135deg, #be185d 0%, #f43f5e 48%, #fb923c 100%)",
    softWash: "from-rose-700/18 via-rose-500/14 to-orange-400/16",
    glow: "shadow-[0_0_38px_-8px_rgba(244,63,94,0.42)]",
  },
  glacier: {
    css: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 45%, #e0f2fe 100%)",
    softWash: "from-blue-900/25 via-blue-500/14 to-sky-200/20",
    glow: "shadow-[0_0_36px_-10px_rgba(59,130,246,0.45)]",
  },
  orchid: {
    css: "linear-gradient(135deg, #6b21a8 0%, #a855f7 50%, #f0abfc 100%)",
    softWash: "from-purple-800/22 via-purple-500/15 to-fuchsia-300/18",
    glow: "shadow-[0_0_40px_-8px_rgba(168,85,247,0.45)]",
  },
  gold: {
    css: "linear-gradient(135deg, #854d0e 0%, #eab308 48%, #fef08a 100%)",
    softWash: "from-amber-800/20 via-yellow-500/16 to-amber-200/18",
    glow: "shadow-[0_0_34px_-8px_rgba(234,179,8,0.4)]",
  },
  nebula: {
    css: "linear-gradient(135deg, #312e81 0%, #6366f1 42%, #c084fc 100%)",
    softWash: "from-indigo-900/24 via-indigo-500/15 to-violet-400/18",
    glow: "shadow-[0_0_38px_-8px_rgba(99,102,241,0.45)]",
  },
  rose: {
    css: "linear-gradient(135deg, #9f1239 0%, #fb7185 50%, #fda4af 100%)",
    softWash: "from-rose-900/20 via-rose-500/15 to-pink-300/16",
    glow: "shadow-[0_0_34px_-8px_rgba(251,113,133,0.42)]",
  },
};

export function getBrandGradientSpec(key: string | null | undefined): BrandGradientSpec {
  const k = (key || "").toLowerCase() as BrandPaletteKey;
  if (k && k in PALETTES) return PALETTES[k];
  return PALETTES.aurora;
}
