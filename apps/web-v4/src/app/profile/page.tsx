"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Rocket,
  TrendingUp,
  Edit3,
  Save,
  X,
  CheckCircle,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";
import type { ApiError } from "@/lib/api-client";

function getTrustLevel(score: number): "newcomer" | "verified" | "trusted" | "elite" {
  if (score >= 80) return "elite";
  if (score >= 60) return "trusted";
  if (score >= 30) return "verified";
  return "newcomer";
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: typeof user?.phone === "string" ? user.phone : "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/auth/me", {
        full_name: form.full_name,
        phone: form.phone || undefined,
      });
      await refreshUser();
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: user?.full_name || "",
      phone: typeof user?.phone === "string" ? user.phone : "",
    });
    setIsEditing(false);
  };

  if (!user) return null;

  const isStartup = user.user_type === "startup";
  const isInvestor = user.user_type === "investor";

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 w-fit max-w-full">
            My <span className="text-brand">profile</span>
          </h1>
          <p className="text-slate-600/50 text-sm">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <motion.div
          className="glass-card p-8 mb-6"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between mb-8">
            {/* Avatar & name */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-cyan-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-brand/20">
                {user.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-600/50">{user.email}</span>
                  {user.email_verified && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    isStartup
                      ? "bg-brand/20 text-brand"
                      : isInvestor
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {isStartup ? <Rocket className="w-3 h-3" /> : isInvestor ? <TrendingUp className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {user.user_type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.approval_status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : user.approval_status === "pending"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {user.approval_status === "approved" ? (
                      <><BadgeCheck className="w-3 h-3 inline mr-1" />Approved</>
                    ) : user.approval_status === "pending" ? (
                      <><Clock className="w-3 h-3 inline mr-1" />Pending</>
                    ) : "Rejected"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3 max-w-md leading-relaxed">
                  Startup và Investor được chọn ở bước 1 trên trang{" "}
                  <Link href="/register" className="text-brand font-medium hover:underline">
                    Đăng ký
                  </Link>
                  . Đã đăng nhập vẫn mở được trang đó (để xem lại hoặc tạo tài khoản phụ); sau khi tạo tài khoản mới hệ thống sẽ đăng xuất để bạn đăng nhập lại. Trang profile chỉ hiển thị vai trò, chưa có đổi loại tài khoản sau khi tạo.{" "}
                  <span className="font-medium text-slate-600">Enterprise</span> chưa có trên form đăng ký công khai.
                </p>
              </div>
            </div>

            {/* Edit button */}
            {!isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="btn-ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit3 className="w-4 h-4" /> Edit
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleCancel}
                  className="btn-ghost"
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </motion.button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600/60 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              {isEditing ? (
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-glass"
                />
              ) : (
                <p className="text-slate-900 py-3">{user.full_name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600/60 mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <p className="text-slate-900 py-3">{user.email}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600/60 mb-2">
                <Phone className="w-4 h-4" /> Phone
              </label>
              {isEditing ? (
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="input-glass"
                />
              ) : (
                <p className="text-slate-700/70 py-3">
                  {user?.phone || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600/60 mb-2">
                <Building2 className="w-4 h-4" /> Organization
              </label>
              <p className="text-slate-900 py-3">{user.org?.name || "No organization"}</p>
            </div>
          </div>
        </motion.div>

        {/* Organization Card */}
        {user.org && (
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-6">Organization</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600/60 mb-1 block">Name</label>
                <p className="text-slate-900">{user.org.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600/60 mb-1 block">Type</label>
                <p className="text-slate-900">
                  {user.org.org_type?.trim()
                    ? user.org.org_type
                    : "— (chưa gán — khác với vai trò cá nhân startup/investor ở trên)"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600/60 mb-1 block">Verification</label>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  user.org.verification_status === "approved"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {user.org.verification_status === "approved" ? <BadgeCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {user.org.verification_status}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
