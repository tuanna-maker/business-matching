"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile Information",
          description: "Name, email, phone",
          href: "/profile",
          badge: null,
        },
        {
          icon: Mail,
          label: "Email Verification",
          description: user.email_verified ? "Verified" : "Not verified",
          href: null,
          badge: user.email_verified ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-400" />
          ),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage notification preferences",
          href: "/notifications",
          badge: null,
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          description: "Data visibility, access controls",
          href: null,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 w-fit max-w-full">
            Account <span className="text-brand">settings</span>
          </h1>
          <p className="text-slate-600/50 text-sm">Manage your account and preferences</p>
        </div>

        {settingsGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <h3 className="text-sm font-medium text-slate-600/40 uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h3>
            <div className="glass-card overflow-hidden divide-y divide-slate-200/70">
              {group.items.map((item) => {
                const Icon = item.icon;
                const commonClass = `flex items-center gap-4 p-4 transition-colors ${
                  item.href ? "hover:bg-slate-900/5 cursor-pointer" : ""
                }`;

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={commonClass}>
                      <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-700/60" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-600/40">{item.description}</p>
                      </div>
                      {item.badge || <ChevronRight className="w-4 h-4 text-slate-600/30" />}
                    </Link>
                  );
                }

                return (
                  <div key={item.label} className={commonClass}>
                    <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-700/60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-slate-600/40">{item.description}</p>
                    </div>
                    {item.badge}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Danger Zone */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-red-400/60 uppercase tracking-wider mb-3 px-1">
            Session
          </h3>
          <div className="glass-card overflow-hidden">
            <button
              onClick={logout}
              className="flex items-center gap-4 p-4 w-full hover:bg-red-500/5 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Sign Out</p>
                <p className="text-xs text-slate-600/40">
                  {user.email}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400/30 group-hover:text-red-400/60 transition-colors" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
