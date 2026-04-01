"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Eye,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Archive,
  ArrowUpRight,
  X,
  Save,
  Rocket,
  ImageIcon,
} from "lucide-react";
import type { ApiError } from "@/lib/api-client";
import { ProjectCoverMedia } from "@/components/project/ProjectCoverMedia";

interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  industry: string | null;
  stage: string | null;
  funding_need_amount: number | null;
  funding_currency: string | null;
  status: "draft" | "published" | "archived";
  iec_level: string | null;
  hero_image_url: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  draft: { label: "Draft", icon: Pencil, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  published: { label: "Published", icon: Globe, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  archived: { label: "Archived", icon: Archive, color: "bg-slate-900/5 text-slate-700/40 border-slate-200/70" },
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    summary: "",
    description: "",
    industry: "",
    stage: "seed",
    funding_need_amount: "",
    hero_image_url: null as string | null,
  });

  const isStartup = user?.user_type === "startup";

  const onCreateHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (f.size > 1.5 * 1024 * 1024) {
      toast.error("Image must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setNewProject((p) => ({ ...p, hero_image_url: reader.result as string }));
    reader.readAsDataURL(f);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const data = await api.get<Project[]>("/projects?owner=me");
      setProjects(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setCreating(true);
    try {
      await api.post("/projects", {
        title: newProject.title,
        summary: newProject.summary || undefined,
        description: newProject.description || undefined,
        industry: newProject.industry || undefined,
        stage: newProject.stage || undefined,
        funding_need_amount: newProject.funding_need_amount
          ? Number(newProject.funding_need_amount)
          : undefined,
        hero_image_url: newProject.hero_image_url || undefined,
      });
      toast.success("Project created!");
      setShowCreate(false);
      setNewProject({
        title: "",
        summary: "",
        description: "",
        industry: "",
        stage: "seed",
        funding_need_amount: "",
        hero_image_url: null,
      });
      fetchProjects();
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (projectId: string, status: string) => {
    try {
      await api.patch(`/projects/${projectId}/status`, { status });
      toast.success(`Project ${status}`);
      fetchProjects();
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to update status");
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to delete project");
    }
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
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 w-fit max-w-full">
              {isStartup ? (
                <>
                  Your <span className="text-brand">Projects</span>
                </>
              ) : (
                <>
                  Explore <span className="text-brand">Projects</span>
                </>
              )}
            </h1>
            <p className="text-slate-600/50 text-sm">
              {isStartup ? "Manage and showcase your projects" : "Browse available projects"}
            </p>
          </div>
          {isStartup && (
            <motion.button
              onClick={() => setShowCreate(true)}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" /> New Project
            </motion.button>
          )}   
        </div>

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
              <motion.div
                className="glass-card p-8 w-full max-w-lg relative z-10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Create Project</h2>
                  <button onClick={() => setShowCreate(false)} className="text-slate-600/40 hover:text-slate-900/80">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Project Title *</label>
                    <input
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="input-glass"
                      placeholder="My Awesome Project"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Summary</label>
                    <input
                      value={newProject.summary}
                      onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                      className="input-glass"
                      placeholder="Brief one-liner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="input-glass min-h-[80px] resize-none"
                      placeholder="Detailed description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600/60 mb-2">Industry</label>
                      <input
                        value={newProject.industry}
                        onChange={(e) => setNewProject({ ...newProject, industry: e.target.value })}
                        className="input-glass"
                        placeholder="e.g. FinTech"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600/60 mb-2">Stage</label>
                      <select
                        value={newProject.stage}
                        onChange={(e) => setNewProject({ ...newProject, stage: e.target.value })}
                        className="input-glass"
                      >
                        <option value="idea">Idea</option>
                        <option value="seed">Seed</option>
                        <option value="pre_series_a">Pre-Series A</option>
                        <option value="series_a">Series A</option>
                        <option value="series_b">Series B</option>
                        <option value="growth">Growth</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">Funding Need (USD)</label>
                    <input
                      type="number"
                      value={newProject.funding_need_amount}
                      onChange={(e) => setNewProject({ ...newProject, funding_need_amount: e.target.value })}
                      className="input-glass"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600/60 mb-2">
                      Cover image <span className="text-slate-600/40 font-normal">(optional)</span>
                    </label>
                    <p className="text-xs text-slate-600/50 mb-2">
                      If you skip this, the listing uses an icon for your industry.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="btn-ghost text-xs cursor-pointer inline-flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" aria-hidden />
                        Choose image
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={onCreateHeroFile}
                        />
                      </label>
                      {newProject.hero_image_url ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-red-600/90"
                          onClick={() => setNewProject((p) => ({ ...p, hero_image_url: null }))}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={creating}
                    className="btn-primary w-full py-3 disabled:opacity-50"
                    whileHover={{ scale: creating ? 1 : 1.01 }}
                    whileTap={{ scale: creating ? 1 : 0.98 }}
                  >
                    {creating ? (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
                    ) : (
                      <><Save className="w-4 h-4" /> Create Project</>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <motion.div
            className="glass-card p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-900/10" />
            <h3 className="text-xl font-semibold mb-2 text-slate-600/60">No projects yet</h3>
            <p className="text-sm text-slate-600/30 mb-6">Create your first project to start attracting investors</p>
            {isStartup && (
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Create First Project
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => {
              const sc = statusConfig[project.status];
              const StatusIcon = sc.icon;

              return (
                <motion.div
                  key={project.id}
                  className="glow-card group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProjectCoverMedia
                    imageUrl={project.hero_image_url}
                    industry={project.industry}
                    className="h-32"
                    size="sm"
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 z-[1] flex items-center gap-2 pointer-events-auto">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                        {project.iec_level && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/25 text-slate-900 border border-white/40 backdrop-blur-sm">
                            IEC {project.iec_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </ProjectCoverMedia>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-1 truncate">{project.title}</h3>
                    <p className="text-sm text-slate-600/40 mb-3 line-clamp-2">
                      {project.summary || project.description || "No description"}
                    </p>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {project.industry && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-900/5 text-slate-700/60">
                          {project.industry}
                        </span>
                      )}
                      {project.stage && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-900/5 text-slate-700/60">
                          {project.stage}
                        </span>
                      )}
                      {project.funding_need_amount && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          ${(project.funding_need_amount / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-slate-200/70 pt-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="btn-ghost text-xs flex-1 justify-center"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                      {project.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(project.id, "published")}
                          className="btn-primary text-xs flex-1 justify-center"
                        >
                          <Rocket className="w-3 h-3" /> Publish
                        </button>
                      )}
                      {project.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(project.id, "archived")}
                          className="btn-ghost text-xs"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-slate-900/20 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
