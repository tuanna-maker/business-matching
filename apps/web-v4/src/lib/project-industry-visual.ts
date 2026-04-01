import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cpu,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

export interface IndustryVisual {
  Icon: LucideIcon;
  /** Full-area gradient when no cover image */
  gradient: string;
  iconClass: string;
}

const DEFAULT: IndustryVisual = {
  Icon: Sparkles,
  gradient: "bg-gradient-to-br from-violet-500/35 via-indigo-500/25 to-cyan-500/30",
  iconClass: "text-white/90",
};

const PRESETS: { keys: string[]; visual: IndustryVisual }[] = [
  {
    keys: ["technology", "tech", "software", "saas", "it", "ai", "machine learning", "data"],
    visual: {
      Icon: Cpu,
      gradient: "bg-gradient-to-br from-sky-500/40 via-indigo-600/35 to-violet-600/40",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["healthcare", "health", "medical", "biotech", "pharma", "wellness"],
    visual: {
      Icon: HeartPulse,
      gradient: "bg-gradient-to-br from-rose-500/35 via-fuchsia-500/25 to-emerald-500/30",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["finance", "fintech", "banking", "insurtech", "payments"],
    visual: {
      Icon: Landmark,
      gradient: "bg-gradient-to-br from-emerald-600/40 via-teal-500/30 to-cyan-500/35",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["agriculture", "agtech", "food", "farming"],
    visual: {
      Icon: Leaf,
      gradient: "bg-gradient-to-br from-lime-500/35 via-green-600/35 to-emerald-700/30",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["education", "edtech", "learning"],
    visual: {
      Icon: GraduationCap,
      gradient: "bg-gradient-to-br from-indigo-500/40 via-blue-600/30 to-violet-500/35",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["energy", "cleantech", "climate", "solar", "utilities"],
    visual: {
      Icon: Zap,
      gradient: "bg-gradient-to-br from-amber-500/40 via-orange-500/35 to-yellow-400/25",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["logistics", "mobility", "transport", "supply chain"],
    visual: {
      Icon: Truck,
      gradient: "bg-gradient-to-br from-slate-600/45 via-blue-700/35 to-sky-500/30",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["retail", "ecommerce", "e-commerce", "consumer", "marketplace"],
    visual: {
      Icon: ShoppingBag,
      gradient: "bg-gradient-to-br from-pink-500/35 via-rose-500/30 to-orange-400/25",
      iconClass: "text-white/95",
    },
  },
  {
    keys: ["real estate", "proptech", "construction"],
    visual: {
      Icon: Building2,
      gradient: "bg-gradient-to-br from-stone-500/40 via-amber-800/30 to-slate-700/35",
      iconClass: "text-white/95",
    },
  },
];

export function getIndustryVisual(industry: string | null | undefined): IndustryVisual {
  const q = (industry || "").toLowerCase().trim();
  if (!q) return DEFAULT;
  for (const { keys, visual } of PRESETS) {
    if (keys.some((k) => q === k || q.includes(k))) return visual;
  }
  return DEFAULT;
}
