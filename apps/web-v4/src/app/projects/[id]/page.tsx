"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Lock,
  Pencil,
  Archive,
  Rocket,
  Shield,
  Calendar,
  DollarSign,
  Building2,
  Save,
  X,
  ImageIcon,
} from "lucide-react";
import type { ApiError } from "@/lib/api-client";
import { ProjectCoverMedia } from "@/components/project/ProjectCoverMedia";

interface ProjectDetail {
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
  org_id: string | null;
  startup_id: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    industry: "",
    stage: "",
    funding_need_amount: "",
    hero_image_url: null as string | null,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<ProjectDetail>(`/projects/${params.id}`);
        setProject(data);
        setForm({
          title: data.title || "",
          summary: data.summary || "",
          description: data.description || "",
          industry: data.industry || "",
          stage: data.stage || "",
          funding_need_amount: data.funding_need_amount?.toString() || "",
          hero_image_url: data.hero_image_url ?? null,
        });
      } catch {
        toast.error("Project not found");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const isOwner = user?.user_type === "startup";

  const resetFormFromProject = () => {
    if (!project) return;
    setForm({
      title: project.title || "",
      summary: project.summary || "",
      description: project.description || "",
      industry: project.industry || "",
      stage: project.stage || "",
      funding_need_amount: project.funding_need_amount?.toString() || "",
      hero_image_url: project.hero_image_url ?? null,
    });
  };

  const onHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm((prev) => ({ ...prev, hero_image_url: reader.result as string }));
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await api.patch<ProjectDetail>(`/projects/${project.id}`, {
        title: form.title,
        summary: form.summary || undefined,
        description: form.description || undefined,
        industry: form.industry || undefined,
        stage: form.stage || undefined,
        funding_need_amount: form.funding_need_amount
          ? Number(form.funding_need_amount)
          : undefined,
        hero_image_url: form.hero_image_url,
      });
      setProject(updated);
      setIsEditing(false);
      toast.success("Project updated!");
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!project) return;
    try {
      const updated = await api.patch<ProjectDetail>(`/projects/${project.id}/status`, { status });
      setProject(updated);
      toast.success(`Project ${status}!`);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const heroDisplayUrl = isEditing ? form.hero_image_url : project.hero_image_url;

  const heroStatusClass =
    project.status === "published"
      ? "text-emerald-100 bg-emerald-500/25 border-emerald-400/35"
      : project.status === "draft"
        ? "text-amber-100 bg-amber-500/20 border-amber-400/30"
        : "text-slate-200 bg-white/10 border-white/20";

  const heroBtnSecondary =
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white/95 bg-white/10 border border-white/20 backdrop-blur-md transition hover:bg-white/18 hover:border-white/35";

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-10 py-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to Projects
        </Link>

        <motion.div
          className="glass-card overflow-hidden mb-6 shadow-lg shadow-slate-900/5"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ProjectCoverMedia
            imageUrl={heroDisplayUrl}
            industry={project.industry}
            className="min-h-[13rem] md:min-h-[15rem]"
            size="lg"
            tone="hero"
          >
            <div className="flex min-h-[13rem] md:min-h-[15rem] flex-col justify-end p-6 md:p-8 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${heroStatusClass}`}
                    >
                      {project.status === "published" ? (
                        <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      ) : (
                        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      )}
                      {project.status}
                    </span>
                    {project.iec_level && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cyan-400/15 text-cyan-100 border border-cyan-300/35">
                        IEC {project.iec_level}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full text-2xl md:text-3xl font-bold tracking-tight bg-white/10 border border-white/25 rounded-xl px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-400/30"
                      placeholder="Project title"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
                      {project.title}
                    </h1>
                  )}
                </div>

                {isOwner && !isEditing && (
                  <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <button type="button" onClick={() => setIsEditing(true)} className={heroBtnSecondary}>
                      <Pencil className="w-3.5 h-3.5" aria-hidden />
                      Edit
                    </button>
                    {project.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("published")}
                        className="btn-primary text-xs"
                      >
                        <Rocket className="w-3.5 h-3.5" aria-hidden />
                        Publish
                      </button>
                    )}
                    {project.status === "published" && (
                      <button type="button" onClick={() => handleStatusChange("archived")} className={heroBtnSecondary}>
                        <Archive className="w-3.5 h-3.5" aria-hidden />
                        Archive
                      </button>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="flex flex-shrink-0 flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        resetFormFromProject();
                        setIsEditing(false);
                      }}
                      className={heroBtnSecondary}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden />
                      Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-xs">
                      {saving ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" aria-hidden />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ProjectCoverMedia>

          <div className="p-6 md:p-8 border-t border-slate-200/60 bg-white/55">
            {isOwner && isEditing && (
              <div className="mb-8 rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Cover image</h2>
                <p className="text-xs text-slate-600/80 mb-4">
                  Upload a hero photo for this project, or remove it to show an icon for your industry.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="btn-ghost text-xs cursor-pointer inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" aria-hidden />
                    Choose image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onHeroFile}
                    />
                  </label>
                  {form.hero_image_url ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600/90 hover:text-red-700"
                      onClick={() => setForm((f) => ({ ...f, hero_image_url: null }))}
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
              {[
                {
                  icon: Building2,
                  label: "Industry",
                  node: isEditing ? (
                    <input
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="input-glass text-sm py-1.5 px-2 w-full mt-0.5"
                      placeholder="Industry"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{project.industry || "—"}</p>
                  ),
                },
                {
                  icon: Rocket,
                  label: "Stage",
                  node: isEditing ? (
                    <select
                      value={form.stage}
                      onChange={(e) => setForm({ ...form, stage: e.target.value })}
                      className="input-glass text-sm py-1.5 px-2 w-full mt-0.5"
                    >
                      <option value="idea">Idea</option>
                      <option value="seed">Seed</option>
                      <option value="pre_series_a">Pre-Series A</option>
                      <option value="series_a">Series A</option>
                      <option value="series_b">Series B</option>
                      <option value="growth">Growth</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{project.stage || "—"}</p>
                  ),
                },
                {
                  icon: DollarSign,
                  label: "Funding need",
                  node: isEditing ? (
                    <input
                      type="number"
                      value={form.funding_need_amount}
                      onChange={(e) => setForm({ ...form, funding_need_amount: e.target.value })}
                      className="input-glass text-sm py-1.5 px-2 w-full mt-0.5"
                      placeholder="Amount"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      {project.funding_need_amount
                        ? `$${(project.funding_need_amount / 1000).toFixed(0)}K`
                        : "—"}
                    </p>
                  ),
                },
                {
                  icon: Calendar,
                  label: "Created",
                  node: (
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  ),
                },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm shadow-slate-900/[0.03] backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <cell.icon className="w-4 h-4 text-brand/80 shrink-0" aria-hidden />
                    <span className="text-xs font-medium uppercase tracking-wide">{cell.label}</span>
                  </div>
                  {cell.node}
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 md:p-6 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Summary</h2>
                {isEditing ? (
                  <input
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    className="input-glass w-full"
                    placeholder="Brief summary..."
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{project.summary || "No summary yet."}</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 md:p-6 backdrop-blur-md lg:row-span-1">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Description</h2>
                {isEditing ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-glass min-h-[140px] resize-none w-full"
                    placeholder="Detailed description..."
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {project.description || "No description provided."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Link
            href={`/vault?project=${project.id}`}
            className="glow-card p-5 md:p-6 flex items-center gap-4 group cursor-pointer border-slate-200/80"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/25 to-cyan-500/15 flex items-center justify-center ring-1 ring-white/60 shadow-inner">
              <Shield className="w-6 h-6 text-brand" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 text-base">Data Vault</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Manage project documents with 3-tier access control
              </p>
            </div>
            <Rocket
              className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-brand transition-colors"
              aria-hidden
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
