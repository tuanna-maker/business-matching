"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Rocket,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api-client";

type UserType = "startup" | "investor";

export default function RegisterPage() {
  const { register: registerAccount, user: sessionUser, logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        user_type: userType,
      });
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Decorative orbs */}
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-cyan-500 mb-6 shadow-lg shadow-brand/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Join IEC <span className="text-brand">Hub</span>
          </h1>
          <p className="text-slate-600/50 text-sm">
            The exclusive digital lounge for business leaders
          </p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {sessionUser ? (
            <div
              className="mb-6 rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm"
              role="status"
            >
              <p className="leading-relaxed">
                Bạn đang đăng nhập là <strong className="font-semibold">{sessionUser.email}</strong>.
                Trang này dùng để <strong>tạo tài khoản mới</strong> (email khác). Sau khi tạo xong, bạn sẽ được
                đăng xuất để đăng nhập bằng tài khoản vừa tạo. Chỉ cần xem lại bước chọn vai trò thì không cần
                gửi form.
              </p>
            </div>
          ) : null}

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                step >= 1 ? "text-brand" : "text-slate-600/30"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step > 1
                    ? "bg-brand text-white"
                    : step === 1
                    ? "border border-brand text-brand"
                    : "border border-slate-200/70 text-slate-600/30"
                }`}
              >
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              Role
            </div>
            <div className="flex-1 h-px bg-white/10" />
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                step >= 2 ? "text-brand" : "text-slate-600/30"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 2
                    ? "border border-brand text-brand"
                    : "border border-slate-200/70 text-slate-600/30"
                }`}
              >
                2
              </div>
              Details
            </div>
          </div>

          {/* Step 1: Choose role */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                I am a...
              </h2>
              <p className="text-slate-600/40 text-sm mb-6">
                Choose your role to get started
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Startup */}
                <motion.button
                  type="button"
                  onClick={() => setUserType("startup")}
                  className={`glass-card p-6 text-left transition-all duration-300 ${
                    userType === "startup"
                      ? "border-brand/50 bg-brand/10 shadow-lg shadow-brand/10"
                      : "hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      userType === "startup"
                        ? "bg-brand/20"
                        : "bg-white/5"
                    }`}
                  >
                    <Rocket
                      className={`w-6 h-6 ${
                        userType === "startup"
                          ? "text-brand"
                          : "text-slate-600/40"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Startup</h3>
                  <p className="text-xs text-slate-600/40">
                    Showcase projects & find investors
                  </p>
                </motion.button>

                {/* Investor */}
                <motion.button
                  type="button"
                  onClick={() => setUserType("investor")}
                  className={`glass-card p-6 text-left transition-all duration-300 ${
                    userType === "investor"
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      userType === "investor"
                        ? "bg-emerald-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    <TrendingUp
                      className={`w-6 h-6 ${
                        userType === "investor"
                          ? "text-emerald-400"
                          : "text-slate-600/40"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Investor</h3>
                  <p className="text-xs text-slate-600/40">
                    Discover deals & due diligence
                  </p>
                </motion.button>
              </div>

              <motion.button
                type="button"
                disabled={!userType}
                onClick={() => setStep(2)}
                className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: userType ? 1.01 : 1 }}
                whileTap={{ scale: userType ? 0.98 : 1 }}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1 inline" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-slate-600/40 hover:text-slate-900/70 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Create your account
              </h2>
              <p className="text-slate-600/40 text-sm mb-6">
                Fill in your details to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600/60 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    placeholder="Nguyen Minh Tuan"
                    className="input-glass"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600/60 mb-2">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@company.com"
                    className="input-glass"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600/60 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Min. 8 characters"
                      className="input-glass pr-12"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600/30 hover:text-slate-600/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600/60 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="input-glass"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/70" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900/5 px-3 text-xs text-slate-600/30">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
