"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Calendar,
  Shield,
  Bell,
  Settings,
  User,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

// p2-15: fetch unread count từ API thật
function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchCount() {
      try {
        const raw = await api.get<Array<{ read_at: string | null }>>("/notifications");
        if (!cancelled) {
          setCount((raw ?? []).filter((n) => n.read_at === null).length);
        }
      } catch {
        // silent — badge sẽ không hiển thị nếu fetch thất bại
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return count;
}

const dockItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Compass, label: "Discover", href: "/discover" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Shield, label: "Data Vault", href: "/vault" },
  { icon: Sparkles, label: "Matches", href: "/matches" },
  { icon: Bell, label: "Notifications", href: "/notifications", isNotification: true },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function FloatingDock() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const unreadCount = useUnreadCount();

  return (
    <motion.nav
      className="floating-dock"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3,
      }}
    >
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        const isHovered = hoveredItem === item.href;
        const badge = item.isNotification && unreadCount > 0 ? unreadCount : null;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative"
            onMouseEnter={() => setHoveredItem(item.href)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div
              className={`dock-item ${isActive ? "active" : ""}`}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className="w-5 h-5" />

              {/* p2-15: Notification badge từ API */}
              {badge !== null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}

              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
                    filter: "blur(8px)",
                  }}
                />
              )}
            </motion.div>

            {/* Tooltip */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2.5 py-1 rounded-lg bg-slate-900/5 backdrop-blur-lg border border-slate-900/10 text-xs font-medium text-slate-700 whitespace-nowrap pointer-events-none"
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 5,
                scale: isHovered ? 1 : 0.9,
              }}
              transition={{ duration: 0.15 }}
            >
              {item.label}
            </motion.div>
          </Link>
        );
      })}

      {/* Divider */}
      <div className="h-px w-6 bg-slate-900/10 my-2" />

      {/* User Avatar */}
      <Link
        href="/profile"
        className="relative"
        onMouseEnter={() => setHoveredItem("/profile")}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <motion.div
          className={`dock-item overflow-hidden ${pathname === "/profile" ? "active" : ""}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent-cyan flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2.5 py-1 rounded-lg bg-slate-900/5 backdrop-blur-lg border border-slate-900/10 text-xs font-medium text-slate-700 whitespace-nowrap pointer-events-none"
          initial={{ opacity: 0, y: 5, scale: 0.9 }}
          animate={{
            opacity: hoveredItem === "/profile" ? 1 : 0,
            y: hoveredItem === "/profile" ? 0 : 5,
            scale: hoveredItem === "/profile" ? 1 : 0.9,
          }}
          transition={{ duration: 0.15 }}
        >
          Profile
        </motion.div>
      </Link>
    </motion.nav>
  );
}
