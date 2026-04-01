"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

export function QuickAction({ icon: Icon, label, href, badge }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/5 border border-slate-200/70 hover:bg-slate-900/10 hover:border-slate-200/90 transition-all cursor-pointer group"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center group-hover:from-brand/30 group-hover:to-brand/10 transition-colors">
          <Icon className="w-4 h-4 text-brand group-hover:text-brand-glow transition-colors" />
        </div>
        
        <span className="flex-1 text-sm font-medium text-slate-900/80 group-hover:text-slate-900 transition-colors">
          {label}
        </span>

        {badge !== undefined && (
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand/20 text-brand text-xs font-semibold flex items-center justify-center">
            {badge}
          </span>
        )}

        <ChevronRight className="w-4 h-4 text-slate-600/30 group-hover:text-slate-600/50 transition-colors" />
      </motion.div>
    </Link>
  );
}
