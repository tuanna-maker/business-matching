"use client";

import { motion } from "framer-motion";
import { Eye, Download, Lock, LucideIcon } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  tier: "public" | "protected" | "confidential";
  type: string;
  icon: LucideIcon;
  views: number;
  downloads: number;
  lastUpdated: string;
  fileSize: string;
  accessRequirement?: string;
}

interface TierConfig {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

interface DocumentCardProps {
  document: Document;
  tierConfig: TierConfig;
  onRequestAccess?: () => void;
}

export function DocumentCard({ document, tierConfig, onRequestAccess }: DocumentCardProps) {
  const Icon = document.icon;
  const TierIcon = tierConfig.icon;
  const isLocked = document.tier !== "public";

  return (
    <motion.div
      className="glow-card group relative overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* X-Ray Locked Content Effect */}
      {isLocked && (
        <div className="absolute inset-0 xray-locked z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Lock className="w-8 h-8 text-slate-900/25 mx-auto mb-2" />
              <span className="text-xs text-slate-600/40">{document.accessRequirement}</span>
            </motion.div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900/10 to-slate-900/5 flex items-center justify-center">
          <Icon className="w-6 h-6 text-slate-700/60" />
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${tierConfig.bgColor} border ${tierConfig.borderColor}`}
        >
          <TierIcon className={`w-3 h-3 ${tierConfig.color}`} />
          <span className={`text-[10px] font-medium ${tierConfig.color}`}>
            {tierConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={isLocked ? "relative" : ""}>
        <h4 className={`font-semibold mb-1 ${isLocked ? "blur-effect" : ""}`}>
          {document.title}
        </h4>
        <p className={`text-xs text-slate-600/50 mb-3 line-clamp-2 ${isLocked ? "blur-effect" : ""}`}>
          {document.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-600/40 mb-4">
          <span>{document.type}</span>
          <span>•</span>
          <span>{document.fileSize}</span>
          <span>•</span>
          <span>{document.lastUpdated}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-600/40 mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{document.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{document.downloads}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-200/70">
        {isLocked ? (
          <motion.button
            onClick={onRequestAccess}
            className="w-full btn-primary text-xs justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock className="w-3 h-3 mr-1" />
            Request Access
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              className="flex-1 btn-ghost text-xs justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </motion.button>
            <motion.button
              className="flex-1 btn-primary text-xs justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </motion.button>
          </div>
        )}
      </div>

      {/* Hover glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${
            document.tier === "public"
              ? "rgba(16, 185, 129, 0.1)"
              : document.tier === "protected"
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(245, 158, 11, 0.1)"
          }, transparent 50%)`,
        }}
      />
    </motion.div>
  );
}
