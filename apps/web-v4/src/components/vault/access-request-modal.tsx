"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Send, FileText, Shield, Info, AlertTriangle } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description?: string;
  tier: "public" | "protected" | "confidential";
  type: string;
  accessRequirement?: string;
}

export interface AccessRequestPayload {
  tier: "protected" | "confidential";
  purpose: string;
  message: string;
  nda_accepted: boolean;
}

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSubmit: (payload: AccessRequestPayload) => Promise<void>;
}

export function AccessRequestModal({ isOpen, onClose, document, onSubmit }: AccessRequestModalProps) {
  const [message, setMessage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agreeToNDA, setAgreeToNDA] = useState(false);

  if (!document) return null;

  const tier = document.tier as "protected" | "confidential";
  const requiresNDA = tier === "protected" || tier === "confidential";
  const isConfidential = tier === "confidential";

  const canSubmit = purpose && message && (requiresNDA ? agreeToNDA : true);

  const handleSubmit = async () => {
    await onSubmit({ tier, purpose, message, nda_accepted: agreeToNDA });
    setPurpose("");
    setMessage("");
    setAgreeToNDA(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card max-w-lg w-full p-6 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600/60" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Request Access</h3>
                  <p className="text-sm text-slate-600/60">
                    {isConfidential ? "NDA + owner approval required" : "NDA signing required"}
                  </p>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-4 rounded-xl bg-white/80 border border-slate-200/70 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-700/60" />
                  <div>
                    <div className="font-medium">{document.title}</div>
                    <div className="text-xs text-slate-600/40">{document.type}</div>
                  </div>
                </div>
              </div>

              {/* Confidential extra notice */}
              {isConfidential && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500/70 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700/70">
                    Tài liệu <span className="font-semibold text-red-600/70">Confidential</span> yêu cầu{" "}
                    <span className="font-medium">Trust Score đủ điều kiện</span> và phê duyệt trực tiếp từ
                    chủ dự án. Hồ sơ tổ chức của bạn sẽ được hiển thị để họ ra quyết định.
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4 mb-6">
                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600/80">
                    Purpose of access
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:border-brand/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-white text-slate-900">Select purpose...</option>
                    <option value="investment" className="bg-white text-slate-900">Investment evaluation</option>
                    <option value="partnership" className="bg-white text-slate-900">Partnership discussion</option>
                    <option value="due-diligence" className="bg-white text-slate-900">Due diligence</option>
                    <option value="collaboration" className="bg-white text-slate-900">Technical collaboration</option>
                    <option value="other" className="bg-white text-slate-900">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600/80">
                    Message to owner
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly explain why you need access to this document..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand/50 transition-colors resize-none"
                  />
                </div>

                {/* NDA Agreement — required for both protected AND confidential */}
                {requiresNDA && (
                  <div className={`p-4 rounded-xl border ${isConfidential ? "bg-red-500/8 border-red-500/20" : "bg-tier-protected/10 border-tier-protected/20"}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="nda"
                        checked={agreeToNDA}
                        onChange={(e) => setAgreeToNDA(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300/70 bg-white/70 checked:bg-brand checked:border-brand focus:ring-brand/50"
                      />
                      <label htmlFor="nda" className="text-sm">
                        <span className={`font-medium ${isConfidential ? "text-red-600/80" : "text-tier-protected"}`}>
                          NDA Agreement
                        </span>
                        <p className="text-slate-600/50 mt-1">
                          {isConfidential
                            ? "Tôi đồng ý ký Thỏa thuận Bảo mật (NDA) trước khi truy cập tài liệu này và cam kết không tiết lộ thông tin cho bên thứ ba."
                            : "I agree to sign the mutual Non-Disclosure Agreement before accessing this document. The NDA will be sent to my registered email for e-signature."}
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Info notice for non-NDA tiers (should not happen but kept as fallback) */}
                {!requiresNDA && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/5 border border-slate-200/70">
                    <Info className="w-5 h-5 text-slate-600/40 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600/50">
                      This request will be sent directly to the document owner. Your{" "}
                      <span className="text-slate-700/70">Trust Score</span> and{" "}
                      <span className="text-slate-700/70">OA profile</span> will be visible to help them make a decision.
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 btn-ghost justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 btn-primary justify-center"
                  disabled={!canSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
