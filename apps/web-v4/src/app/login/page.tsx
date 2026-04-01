"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo & Branding */}
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
            IEC <span className="text-brand">Hub</span>
          </h1>
          <p className="text-slate-700 text-sm font-medium">
            Where Trust Meets Opportunity
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-700/85 text-sm">
              Sign in to your private business lounge
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600/60 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@company.com"
                className="input-glass"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600/60 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pr-12"
                  autoComplete="current-password"
                  required
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

            {/* Submit */}
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
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/70" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900/5 px-3 text-xs text-slate-600/50">
                New to IEC Hub?
              </span>
            </div>
          </div>

          {/* Register link */}
          <Link
            href="/register"
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            Create an Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-slate-600/45 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Exclusive access for verified business leaders
        </motion.p>
      </motion.div>
    </div>
  );
}
