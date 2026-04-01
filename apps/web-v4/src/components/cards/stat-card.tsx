"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  change?: number;
  changeType?: "positive" | "negative";
  badge?: string;
  badgeType?: "default" | "warning" | "success";
}

const badgeColors = {
  default: "bg-brand/20 text-brand-glow border-brand/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = "positive",
  badge,
  badgeType = "default",
}: StatCardProps) {
  return (
    <motion.div
      className="bento-item group cursor-default"
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900/10 to-slate-900/5 flex items-center justify-center group-hover:from-brand/20 group-hover:to-brand/5 transition-colors duration-300 shrink-0">
          <Icon className="w-5 h-5 text-slate-700/60 group-hover:text-brand transition-colors duration-300" />
        </div>

        <div className="flex flex-col items-end gap-1 min-w-0">
          {badge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColors[badgeType]}`}>
              {badge}
            </span>
          )}
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs ${
                changeType === "positive" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-3 h-3 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 shrink-0" />
              )}
              <span>
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-slate-900 to-slate-700/80 bg-clip-text text-transparent">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-sm text-slate-600/40">{label}</div>
      </div>

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.06), transparent 40%)",
        }}
      />
    </motion.div>
  );
}
