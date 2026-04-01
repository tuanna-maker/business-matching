"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  ShieldCheck,
  Lock,
  Eye,
  Download,
  Send,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  ChevronDown,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { AccessRequestModal, type AccessRequestPayload } from "@/components/vault/access-request-modal";

// Types
interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface DataRoom {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  documents?: DataRoomDocument[];
}

interface DataRoomDocument {
  id: string;
  data_room_id: string;
  title: string;
  type: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  tier: "public" | "protected" | "confidential";
  created_at: string;
}

interface DataRoomRequest {
  id: string;
  data_room_id: string | null;
  investor_id: string;
  status: "pending" | "accepted" | "rejected";
  requested_tier: string | null;
  purpose: string | null;
  reason: string | null;
  created_at: string;
  user?: { full_name: string; email: string };
  org?: { organization_name?: string; company_name?: string };
}

interface DataRoomResponse {
  dataRoom: (DataRoom & { documents?: DataRoomDocument[] }) | null;
  requestsForStartup?: DataRoomRequest[];
  myRequest?: DataRoomRequest | null;
}

interface MyRequestsResponse {
  asStartup: Array<{
    request: DataRoomRequest;
    project: { id: string; title: string; slug: string; iec_level: string | null };
    investor: { id: string; organization_name: string; user: { full_name: string; email: string } };
  }>;
  asInvestor: Array<{
    request: DataRoomRequest;
    project: { id: string; title: string; slug: string; iec_level: string | null };
    startup: { id: string; company_name: string; user: { full_name: string; email: string } };
  }>;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Data Tier Configuration
const tierConfig: Record<string, { icon: typeof Globe; label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  public: {
    icon: Globe,
    label: "Public",
    description: "Visible to all members",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
  },
  protected: {
    icon: ShieldCheck,
    label: "Protected",
    description: "Requires approval",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  confidential: {
    icon: Lock,
    label: "Confidential",
    description: "NDA required",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
};

const requestStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-400" },
  accepted: { label: "Accepted", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400" },
};

function DataVaultPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isStartup = user?.user_type === "startup";

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dataRoomData, setDataRoomData] = useState<DataRoomResponse | null>(null);
  const [vaultDocuments, setVaultDocuments] = useState<DataRoomDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DataRoomDocument | null>(null);
  const [myRequests, setMyRequests] = useState<MyRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"documents" | "requests">("documents");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });

  // p2-13: đọc ?project= query param để deeplink
  const projectFromQuery = searchParams.get("project");

  // Fetch projects or requests on mount
  useEffect(() => {
    async function load() {
      try {
        if (isStartup) {
          const data = await api.get<Project[]>("/projects?owner=me");
          setProjects(data);
          // p2-13: ưu tiên param từ URL, fallback sang project đầu tiên
          const preselect = projectFromQuery && data.find((p) => p.id === projectFromQuery);
          setSelectedProjectId(preselect ? preselect.id : (data[0]?.id ?? null));
        }
        const reqs = await api.get<MyRequestsResponse>("/data-room/requests/mine");
        setMyRequests(reqs);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStartup, projectFromQuery]);

  // Fetch data room when project changes
  const fetchDataRoom = useCallback(async (projectId: string) => {
    setLoadingRoom(true);
    try {
      const [roomData, docs] = await Promise.all([
        api.get<DataRoomResponse>(`/projects/${projectId}/data-room`),
        api.get<DataRoomDocument[]>(`/projects/${projectId}/documents`),
      ]);
      setDataRoomData(roomData);
      setVaultDocuments(docs);
    } catch {
      setDataRoomData(null);
      setVaultDocuments([]);
    } finally {
      setLoadingRoom(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchDataRoom(selectedProjectId);
    }
  }, [selectedProjectId, fetchDataRoom]);

  // Create data room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newRoom.name.trim()) return;
    setCreating(true);
    try {
      await api.post(`/projects/${selectedProjectId}/data-room`, {
        name: newRoom.name,
        description: newRoom.description || undefined,
      });
      toast.success("Data room created!");
      setShowCreateRoom(false);
      setNewRoom({ name: "", description: "" });
      fetchDataRoom(selectedProjectId);
    } catch {
      toast.error("Failed to create data room");
    } finally {
      setCreating(false);
    }
  };

  // Respond to access request (startup)
  const handleRespond = async (requestId: string, status: "accepted" | "rejected") => {
    setRespondingId(requestId);
    try {
      await api.patch(`/data-room/requests/${requestId}`, { status });
      toast.success(`Request ${status}`);
      if (selectedProjectId) fetchDataRoom(selectedProjectId);
      // Also refresh my requests
      const reqs = await api.get<MyRequestsResponse>("/data-room/requests/mine");
      setMyRequests(reqs);
    } catch {
      toast.error("Failed to update request");
    } finally {
      setRespondingId(null);
    }
  };

  // Request access (investor) — dùng cho nút "Request Access" tổng (protected tier mặc định)
  const handleRequestAccess = async (dataRoomId: string) => {
    try {
      await api.post(`/data-room/${dataRoomId}/requests`, {
        tier: "protected",
        purpose: "investment",
        nda_accepted: true,
      });
      toast.success("Access request sent!");
      if (selectedProjectId) fetchDataRoom(selectedProjectId);
      const reqs = await api.get<MyRequestsResponse>("/data-room/requests/mine");
      setMyRequests(reqs);
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("Trust Score")) {
        toast.error("Trust Score chưa đủ để yêu cầu tài liệu này. Hãy nâng Trust Level trước.");
      } else {
        toast.error("Failed to send request");
      }
    }
  };

  // Computed
  const documents = vaultDocuments;

  const currentInvestorAccessRequest = myRequests?.asInvestor?.find(
    (item) => item.project.id === selectedProjectId
  );

  const hasApprovedAccess = currentInvestorAccessRequest?.request.status === "accepted";
  const requestedTier = currentInvestorAccessRequest?.request.requested_tier;

  const accessibleTiers = isStartup
    ? ["public", "protected", "confidential"]
    : ["public"].concat(
        hasApprovedAccess
          ? requestedTier === "confidential"
            ? ["protected", "confidential"]
            : ["protected"]
          : []
      );

  const filteredDocuments = documents.filter((doc) => {
    const matchesTier = !selectedTier || doc.tier === selectedTier;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const startupRequests = dataRoomData?.requestsForStartup || [];
  const pendingCount = startupRequests.filter((r) => r.status === "pending").length;

  const stats = {
    totalDocuments: documents.length,
    publicDocs: documents.filter((d) => d.tier === "public").length,
    protectedDocs: documents.filter((d) => d.tier === "protected").length,
    confidentialDocs: documents.filter((d) => d.tier === "confidential").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 w-fit max-w-full">
            Data <span className="text-brand">Vault</span>
          </h1>
          <p className="text-slate-600/60">
            {isStartup
              ? "Manage your confidential documents with 3-tier access control"
              : "Browse and request access to project data rooms"}
          </p>
        </motion.header>

        {/* Startup: Project Selector */}
        {isStartup && projects.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-600/60">Project:</label>
              <div className="relative">
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:border-brand/50 transition-colors cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-slate-900">
                      {p.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600/40 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Investor: Show my requests summary */}
        {!isStartup && myRequests && (
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">My Access Requests</h2>
            {myRequests.asInvestor.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <FolderOpen className="w-12 h-12 text-slate-900/20 mx-auto mb-4" />
                <p className="text-slate-600/40 mb-2">No access requests yet</p>
                <p className="text-sm text-slate-600/30">
                  Browse projects in <Link href="/discover" className="text-brand hover:underline">Discover</Link> to find data rooms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.asInvestor.map(({ request, project, startup }) => (
                  <div key={request.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-700/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-slate-600/40">
                        by {startup.company_name || startup.user.full_name}
                        {request.requested_tier && ` · ${request.requested_tier} tier`}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${requestStatusConfig[request.status]?.color || "bg-slate-900/5 text-slate-700/40"}`}>
                      {requestStatusConfig[request.status]?.label || request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Loading data room */}
        {loadingRoom && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600/40" />
          </div>
        )}

        {/* No data room yet (startup) */}
        {isStartup && !loadingRoom && selectedProjectId && !dataRoomData?.dataRoom && (
          <motion.div variants={itemVariants}>
            {!showCreateRoom ? (
              <div className="glass-card p-12 text-center">
                <Lock className="w-16 h-16 text-slate-900/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Room</h3>
                <p className="text-slate-600/40 mb-6 max-w-md mx-auto">
                  Create a data room for this project to securely share documents with investors using 3-tier access control
                </p>
                <motion.button
                  onClick={() => setShowCreateRoom(true)}
                  className="btn-primary mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" /> Create Data Room
                </motion.button>
              </div>
            ) : (
              <div className="glass-card p-6 max-w-lg mx-auto">
                <h3 className="text-lg font-semibold mb-4">Create Data Room</h3>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Name *</label>
                    <input
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand/50"
                      placeholder="e.g. Series A Data Room"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Description</label>
                    <textarea
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand/50 resize-none"
                      placeholder="What documents will this room contain?"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreateRoom(false)} className="flex-1 px-4 py-2 rounded-xl bg-slate-900/5 text-slate-700/60 hover:bg-slate-900/10 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={creating} className="flex-1 btn-primary justify-center">
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* Data Room Content */}
        {dataRoomData?.dataRoom && !loadingRoom && (
          <>
            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/5 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-700/60" />
                  </div>
                  <span className="text-2xl font-bold">{stats.totalDocuments}</span>
                </div>
                <div className="text-xs text-slate-600/40">Total Documents</div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">{stats.publicDocs}</span>
                </div>
                <div className="text-xs text-slate-600/40">Public</div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-2xl font-bold text-amber-400">{stats.protectedDocs}</span>
                </div>
                <div className="text-xs text-slate-600/40">Protected</div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-2xl font-bold text-red-400">{stats.confidentialDocs}</span>
                </div>
                <div className="text-xs text-slate-600/40">Confidential</div>
              </div>
            </motion.div>

            {/* Tier Filter & Search */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Tier Filter */}
              <div className="flex gap-2">
                <motion.button
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    !selectedTier
                      ? "bg-slate-900/5 text-slate-900"
                      : "bg-slate-900/5 text-slate-700/50 hover:bg-slate-900/10"
                  }`}
                  onClick={() => setSelectedTier(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  All
                </motion.button>
                {Object.entries(tierConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={key}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedTier === key
                          ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                          : "bg-slate-900/5 text-slate-700/50 hover:bg-slate-900/10"
                      }`}
                      onClick={() => setSelectedTier(selectedTier === key ? null : key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600/40" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              {/* View Toggle (startup only — show requests tab) */}
              {isStartup && (
                <div className="flex bg-slate-900/5 rounded-xl p-1">
                  <button
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === "documents" ? "bg-slate-900/10 text-slate-900" : "text-slate-700/50"
                    }`}
                    onClick={() => setViewMode("documents")}
                  >
                    Documents
                  </button>
                  <button
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                      viewMode === "requests" ? "bg-slate-900/10 text-slate-900" : "text-slate-700/50"
                    }`}
                    onClick={() => setViewMode("requests")}
                  >
                    Requests
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand rounded-full text-xs flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Investor: Request Access button */}
              {!isStartup && dataRoomData.dataRoom && !dataRoomData.myRequest && (
                <motion.button
                  onClick={() => handleRequestAccess(dataRoomData.dataRoom!.id)}
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4" /> Request Access
                </motion.button>
              )}
              {!isStartup && dataRoomData.myRequest && (
                <span className={`px-4 py-2 rounded-xl text-sm font-medium ${requestStatusConfig[dataRoomData.myRequest.status]?.color || "bg-slate-900/5"}`}>
                  {requestStatusConfig[dataRoomData.myRequest.status]?.label || dataRoomData.myRequest.status}
                </span>
              )}
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {viewMode === "documents" ? (
                <motion.div
                  key="documents"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredDocuments.map((doc) => {
                    const tier = tierConfig[doc.tier] || tierConfig.public;
                    const TierIcon = tier.icon;
                    const isLocked = !isStartup && !accessibleTiers.includes(doc.tier);

                    return (
                      <motion.div
                        key={doc.id}
                        variants={itemVariants}
                        className="glass-card group relative overflow-hidden p-4"
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900/10 to-slate-900/5 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-700/60" />
                          </div>
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${tier.bgColor} border ${tier.borderColor}`}>
                            <TierIcon className={`w-3 h-3 ${tier.color}`} />
                            <span className={`text-[10px] font-medium ${tier.color}`}>{tier.label}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className={isLocked ? "relative" : ""}>
                          <h4 className={`font-semibold mb-1 ${isLocked ? "blur-[2px]" : ""}`}>{doc.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-600/40 mb-4">
                            <span>{doc.type}</span>
                            {doc.file_size && (
                              <>
                                <span>·</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-200/70">
                          {isLocked ? (
                            <motion.button
                              onClick={() => setSelectedDocument(doc)}
                              className="flex items-center justify-center gap-1 text-xs text-slate-700/60 hover:text-slate-900 py-1.5 rounded-lg hover:bg-slate-900/5 transition-colors w-full"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Lock className="w-3 h-3" /> Request Access
                            </motion.button>
                          ) : (
                            <div className="flex gap-2">
                              <button className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-700/60 hover:text-slate-900 py-1.5 rounded-lg hover:bg-slate-900/5 transition-colors">
                                <Eye className="w-3 h-3" /> Preview
                              </button>
                              <button className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-700/60 hover:text-slate-900 py-1.5 rounded-lg hover:bg-slate-900/5 transition-colors">
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredDocuments.length === 0 && (
                    <motion.div
                      className="col-span-full text-center py-12"
                      variants={itemVariants}
                    >
                      <FileText className="w-12 h-12 text-slate-900/20 mx-auto mb-4" />
                      <p className="text-slate-600/40">
                        {documents.length === 0
                          ? "No documents in this data room yet"
                          : "No documents match your filter"}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="requests"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {startupRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-slate-900/20 mx-auto mb-4" />
                      <p className="text-slate-600/40">No access requests</p>
                    </div>
                  ) : (
                    startupRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        variants={itemVariants}
                        className="glass-card p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900/10 to-slate-900/5 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-700/60" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {request.user?.full_name || request.org?.organization_name || "Unknown"}
                              </span>
                              {request.requested_tier && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${tierConfig[request.requested_tier]?.bgColor || "bg-slate-900/5"} ${tierConfig[request.requested_tier]?.color || "text-slate-700/60"}`}>
                                  {request.requested_tier}
                                </span>
                              )}
                            </div>
                            {request.purpose && (
                              <p className="text-sm text-slate-600/40 italic mb-2">&quot;{request.purpose}&quot;</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-600/40">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${requestStatusConfig[request.status]?.color || "bg-slate-900/5"}`}>
                                {requestStatusConfig[request.status]?.label || request.status}
                              </span>
                            </div>
                          </div>

                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleRespond(request.id, "accepted")}
                                disabled={respondingId === request.id}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleRespond(request.id, "rejected")}
                                disabled={respondingId === request.id}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <XCircle className="w-5 h-5" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <AccessRequestModal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          onSubmit={async (payload: AccessRequestPayload) => {
            if (!dataRoomData?.dataRoom) {
              toast.error("No data room selected.");
              return;
            }
            try {
              // p0-3: gửi đủ payload gồm tier, purpose, message, nda_accepted
              await api.post(`/data-room/${dataRoomData.dataRoom.id}/requests`, {
                tier: payload.tier,
                purpose: payload.purpose,
                message: payload.message,
                nda_accepted: payload.nda_accepted,
              });
              toast.success("Access request sent.");
              setSelectedDocument(null);
              if (selectedProjectId) await fetchDataRoom(selectedProjectId);
              const reqs = await api.get<MyRequestsResponse>("/data-room/requests/mine");
              setMyRequests(reqs);
            } catch (err: any) {
              // p2-11: Trust gating feedback
              const msg: string = err?.message ?? "";
              if (msg.includes("Trust Score")) {
                toast.error(
                  "Trust Score của tổ chức bạn chưa đủ để yêu cầu tài liệu Confidential. Hãy hoàn thiện hồ sơ và nâng Trust Level.",
                  { duration: 5000 }
                );
              } else {
                toast.error("Failed to send access request.");
              }
            }
          }}
        />

        {/* No projects (startup) */}
        {isStartup && !loading && projects.length === 0 && (
          <motion.div variants={itemVariants} className="glass-card p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-900/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-slate-600/40 mb-6">Create a project first to set up a data room</p>
            <Link href="/projects" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function DataVaultPage() {
  return (
    <Suspense>
      <DataVaultPageInner />
    </Suspense>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
