"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldPlus, Crown, Info } from "lucide-react";

interface TrustBadgeProps {
  level: "newcomer" | "verified" | "trusted" | "elite";
  score?: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const levelConfig = {
  newcomer: {
    icon: Shield,
    label: "Newcomer",
    colors: "from-slate-500/30 to-slate-600/20 border-slate-500/30",
    textColor: "text-slate-400",
    glowColor: "shadow-slate-500/20",
    // p2-16: capabilities theo SRS 14.1
    capabilities: [
      "Khám phá Discover và xem dự án public",
      "Gửi tín hiệu quan tâm",
      "Tham gia cộng đồng",
    ],
    next: "Xác thực email công ty và điền đầy đủ hồ sơ để lên Verified",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    colors: "from-trust-verified/30 to-trust-verified/10 border-trust-verified/30",
    textColor: "text-trust-verified",
    glowColor: "shadow-trust-verified/20",
    capabilities: [
      "Gửi request truy cập tài liệu Protected",
      "Tham gia deal flow nghiêm túc",
      "Profile hiển thị badge Verified với đối tác",
    ],
    next: "Publish project, phản hồi request, nhận vouch để lên Trusted",
  },
  trusted: {
    icon: ShieldPlus,
    label: "Trusted",
    colors: "from-trust-trusted/30 to-trust-trusted/10 border-trust-trusted/30",
    textColor: "text-trust-trusted",
    glowColor: "shadow-trust-trusted/20",
    capabilities: [
      "Ưu tiên cao hơn trong kết quả Discover",
      "Tín hiệu matching được đối tác đánh giá cao hơn",
      "Tham gia nhiều pipeline deal cùng lúc",
    ],
    next: "Nhận vouch từ nhiều org, duy trì lịch sử vận hành sạch để lên Elite",
  },
  elite: {
    icon: Crown,
    label: "Elite",
    colors: "from-trust-elite/30 to-trust-elite/10 border-trust-elite/30",
    textColor: "text-trust-elite",
    glowColor: "shadow-trust-elite/20",
    capabilities: [
      "Đủ điều kiện truy cập tài liệu Confidential",
      "Tín hiệu mạnh nhất trong pipeline — đối tác tin tưởng hơn",
      "Lợi thế rõ ràng trong các deal có tài liệu nhạy cảm",
    ],
    next: null,
  },
};

const sizeConfig = {
  sm: { container: "px-2 py-0.5", icon: "w-3 h-3", text: "text-[10px]", score: "text-[10px]" },
  md: { container: "px-3 py-1", icon: "w-4 h-4", text: "text-xs", score: "text-xs" },
  lg: { container: "px-4 py-1.5", icon: "w-5 h-5", text: "text-sm", score: "text-sm" },
};

export function TrustBadge({ level, score, size = "md", showTooltip = true }: TrustBadgeProps) {
  const config = levelConfig[level];
  const sizing = sizeConfig[size];
  const Icon = config.icon;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <motion.div
        className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${config.colors} border shadow-lg ${config.glowColor} ${sizing.container} cursor-default`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onMouseEnter={() => showTooltip && setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
      >
        <Icon className={`${sizing.icon} ${config.textColor}`} />
        <span className={`font-medium ${config.textColor} ${sizing.text}`}>
          {config.label}
        </span>
        {score !== undefined && (
          <>
            <span className="text-slate-600/30">•</span>
            <span className={`font-semibold text-slate-800/80 ${sizing.score}`}>{score}</span>
          </>
        )}
        {showTooltip && size !== "sm" && (
          <Info className={`${sizing.icon} ${config.textColor} opacity-50`} />
        )}
      </motion.div>

      {/* p2-16: Tooltip với capabilities */}
      <AnimatePresence>
        {tooltipOpen && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="glass-card p-3 shadow-xl border border-slate-200/60 rounded-xl text-left">
              <p className={`text-xs font-semibold mb-2 ${config.textColor}`}>
                {config.label} — Năng lực
              </p>
              <ul className="space-y-1 mb-2">
                {config.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-1.5">
                    <span className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${config.textColor} bg-current opacity-60`} />
                    <span className="text-[10px] text-slate-700/70 leading-relaxed">{cap}</span>
                  </li>
                ))}
              </ul>
              {config.next && (
                <p className="text-[10px] text-slate-500/60 border-t border-slate-200/50 pt-2">
                  Tiếp theo: {config.next}
                </p>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white/90 border-r border-b border-slate-200/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
