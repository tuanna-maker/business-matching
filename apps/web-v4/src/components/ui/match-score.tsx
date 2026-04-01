"use client";

import { motion } from "framer-motion";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeConfig = {
  sm: {
    container: "w-9 h-9",
    text: "text-xs",
    label: "text-[8px]",
  },
  md: {
    container: "w-12 h-12",
    text: "text-sm",
    label: "text-[9px]",
  },
  lg: {
    container: "w-16 h-16",
    text: "text-lg",
    label: "text-xs",
  },
};

function getScoreColor(score: number) {
  if (score >= 90) return "from-match-perfect via-match-perfect/80 to-match-high";
  if (score >= 75) return "from-match-high via-match-high/80 to-match-medium";
  if (score >= 60) return "from-match-medium via-match-medium/80 to-yellow-600";
  return "from-match-low via-match-low/80 to-red-600";
}

function getGlowColor(score: number) {
  if (score >= 90) return "shadow-match-perfect/40";
  if (score >= 75) return "shadow-match-high/40";
  if (score >= 60) return "shadow-match-medium/40";
  return "shadow-match-low/40";
}

export function MatchScore({ score, size = "md", showLabel = false }: MatchScoreProps) {
  const sizing = sizeConfig[size];
  const gradientColor = getScoreColor(score);
  const glowColor = getGlowColor(score);

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className={`relative ${sizing.container}`}>
        {/* Background ring */}
        <div className="absolute inset-0 rounded-full bg-slate-900/3" />
        
        {/* Score ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="rgba(15,23,42,0.07)"
            strokeWidth="2"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${score} 100`}
            initial={{ strokeDasharray: "0 100" }}
            animate={{ strokeDasharray: `${score} 100` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={score >= 90 ? "#22c55e" : score >= 75 ? "#10b981" : score >= 60 ? "#eab308" : "#ef4444"} />
              <stop offset="100%" stopColor={score >= 90 ? "#10b981" : score >= 75 ? "#059669" : score >= 60 ? "#ca8a04" : "#dc2626"} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score number */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center font-bold ${sizing.text} bg-gradient-to-br ${gradientColor} bg-clip-text text-transparent`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 rounded-full blur-md bg-gradient-to-br ${gradientColor} opacity-20`}
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {showLabel && (
        <span className={`${sizing.label} text-slate-600/40 font-medium uppercase tracking-wider`}>
          Match
        </span>
      )}
    </motion.div>
  );
}
