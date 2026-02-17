"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminPost, adminPatch, adminDelete, revalidateCache } from "@/lib/admin-api";
import { FormField } from "@/components/dashboard/form-field";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminProject } from "@/types/admin";

interface ProjectFormProps {
  project?: AdminProject;
}

const QUALITY_BADGE_OPTIONS = [
  "typescript",
  "tested",
  "accessible",
  "responsive",
  "secure",
  "ci-cd",
  "docker",
  "seo",
  "performance",
];

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!project;

  // Basic
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<string>(project?.status ?? "INQUIRY");
  const [budget, setBudget] = useState(project?.budget ?? "");
  const [startDate, setStartDate] = useState(
    project?.startDate?.split("T")[0] ?? "",
  );
  const [endDate, setEndDate] = useState(
    project?.endDate?.split("T")[0] ?? "",
  );
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [repositoryUrl, setRepositoryUrl] = useState(
    project?.repositoryUrl ?? "",
  );
  const [featuredImage, setFeaturedImage] = useState(
    project?.featuredImage ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [isPublic, setIsPublic] = useState(project?.isPublic ?? true);
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(
    project?.technologies ?? [],
  );

  // Case-study fields
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [role, setRole] = useState(project?.role ?? "");
  const [clientName, setClientName] = useState(project?.clientName ?? "");
  const [clientIndustry, setClientIndustry] = useState(
    project?.clientIndustry ?? "",
  );
  const [teamSize, setTeamSize] = useState(project?.teamSize ?? "");
  const [scope, setScope] = useState(project?.scope ?? "");
  const [challenge, setChallenge] = useState(project?.challenge ?? "");
  const [approach, setApproach] = useState(project?.approach ?? "");

  // Features (tag input)
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(
    project?.features ?? [],
  );

  // Metrics (dynamic rows)
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>(
    (project?.metrics as { label: string; value: string }[]) ?? [],
  );

  // Challenges (dynamic rows)
  const [challengesList, setChallengesList] = useState<
    { challenge: string; solution: string }[]
  >((project?.challenges as { challenge: string; solution: string }[]) ?? []);

  // Quality badges (checkboxes)
  const [qualityBadges, setQualityBadges] = useState<string[]>(
    project?.qualityBadges ?? [],
  );

  // Milestones
  const [milestones, setMilestones] = useState(project?.milestones ?? []);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Images
  const [images, setImages] = useState(project?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (autoSlug && title) setSlug(toSlug(title));
  }, [title, autoSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title,
      slug,
      description: description || undefined,
      status,
      budget: budget || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      liveUrl: liveUrl || undefined,
      repositoryUrl: repositoryUrl || undefined,
      featuredImage: featuredImage || undefined,
      videoUrl: videoUrl || undefined,
      technologies,
      isPublic,
      tagline: tagline || undefined,
      role: role || undefined,
      clientName: clientName || undefined,
      clientIndustry: clientIndustry || undefined,
      teamSize: teamSize || undefined,
      scope: scope || undefined,
      challenge: challenge || undefined,
      approach: approach || undefined,
      features,
      metrics: metrics.length > 0 ? metrics : undefined,
      challenges:
        challengesList.length > 0 ? challengesList : undefined,
      qualityBadges,
    };

    try {
      if (isEdit) {
        await adminPatch(`/projects/${project.id}`, body);
        toast("Project updated", "success");
      } else {
        await adminPost("/projects", body);
        toast("Project created", "success");
      }
      await revalidateCache("projects");
      router.push("/dashboard/projects");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function addMilestone() {
    if (!isEdit || !newMilestone.title) return;
    try {
      const result = await adminPost(`/projects/${project!.id}/milestones`, {
        title: newMilestone.title,
        description: newMilestone.description || undefined,
        dueDate: newMilestone.dueDate || undefined,
      });
      setMilestones([...milestones, result as (typeof milestones)[0]]);
      setNewMilestone({ title: "", description: "", dueDate: "" });
      toast("Milestone added", "success");
    } catch {
      toast("Failed to add milestone", "error");
    }
  }

  async function removeMilestone(mid: string) {
    if (!isEdit) return;
    try {
      await adminDelete(`/projects/${project!.id}/milestones/${mid}`);
      setMilestones(milestones.filter((m) => m.id !== mid));
      toast("Milestone removed", "success");
    } catch {
      toast("Failed to remove", "error");
    }
  }

  async function addImage() {
    if (!isEdit || !newImageUrl) return;
    try {
      const result = await adminPost(`/projects/${project!.id}/images`, {
        url: newImageUrl,
      });
      setImages([...images, result as (typeof images)[0]]);
      setNewImageUrl("");
      toast("Image added", "success");
    } catch {
      toast("Failed to add image", "error");
    }
  }

  async function removeImage(imgId: string) {
    if (!isEdit) return;
    try {
      await adminDelete(`/projects/${project!.id}/images/${imgId}`);
      setImages(images.filter((i) => i.id !== imgId));
      toast("Image removed", "success");
    } catch {
      toast("Failed to remove", "error");
    }
  }

  const inputCls =
    "glass-subtle rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Basic Info */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <FormField
              label="Title"
              required
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="Project title"
            />
            <FormField
              label="Slug"
              value={slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="project-slug"
            />
            <FormField
              as="textarea"
              label="Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              rows={4}
              placeholder="Project description"
            />
          </div>

          {/* Case Study Info */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Case Study Info
            </h3>
            <FormField
              label="Tagline"
              value={tagline}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTagline(e.target.value)
              }
              placeholder="e.g. Reduced checkout abandonment by 35%"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Role"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRole(e.target.value)
                }
                placeholder="e.g. Lead Full-Stack Developer"
              />
              <FormField
                label="Team Size"
                value={teamSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTeamSize(e.target.value)
                }
                placeholder="e.g. Solo or 3-person team"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Client Name"
                value={clientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClientName(e.target.value)
                }
                placeholder="e.g. RetailFlow"
              />
              <FormField
                label="Client Industry"
                value={clientIndustry}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClientIndustry(e.target.value)
                }
                placeholder="e.g. Fintech"
              />
            </div>
            <FormField
              label="Scope"
              value={scope}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setScope(e.target.value)
              }
              placeholder="e.g. 14 pages, 42 API endpoints, CI/CD pipeline"
            />
          </div>

          {/* Challenge & Approach */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Challenge & Approach
            </h3>
            <FormField
              as="textarea"
              label="Challenge"
              value={challenge}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setChallenge(e.target.value)
              }
              rows={4}
              placeholder="What problem did the client face?"
            />
            <FormField
              as="textarea"
              label="Approach"
              value={approach}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setApproach(e.target.value)
              }
              rows={4}
              placeholder="How did you design the solution?"
            />
          </div>

          {/* Key Features */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Key Features
            </h3>
            <div className="flex gap-2">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      featureInput.trim() &&
                      !features.includes(featureInput.trim())
                    ) {
                      setFeatures([...features, featureInput.trim()]);
                      setFeatureInput("");
                    }
                  }
                }}
                className={`flex-1 ${inputCls}`}
                placeholder="Add feature..."
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    featureInput.trim() &&
                    !features.includes(featureInput.trim())
                  ) {
                    setFeatures([...features, featureInput.trim()]);
                    setFeatureInput("");
                  }
                }}
                className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span
                  key={f}
                  className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((x) => x !== f))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Impact Metrics
            </h3>
            {metrics.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={m.label}
                  onChange={(e) => {
                    const next = [...metrics];
                    next[i] = { label: e.target.value, value: m.value };
                    setMetrics(next);
                  }}
                  className={`flex-1 ${inputCls}`}
                  placeholder="Label (e.g. Load Time)"
                />
                <input
                  value={m.value}
                  onChange={(e) => {
                    const next = [...metrics];
                    next[i] = { label: m.label, value: e.target.value };
                    setMetrics(next);
                  }}
                  className={`w-32 ${inputCls}`}
                  placeholder="Value (e.g. 1.2s)"
                />
                <button
                  type="button"
                  onClick={() => setMetrics(metrics.filter((_, j) => j !== i))}
                  className="text-sm text-destructive hover:text-destructive/80"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMetrics([...metrics, { label: "", value: "" }])}
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              + Add Metric
            </button>
          </div>

          {/* Challenges & Solutions */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Challenges & Solutions
            </h3>
            {challengesList.map((c, i) => (
              <div key={i} className="glass-subtle rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <textarea
                    value={c.challenge}
                    onChange={(e) => {
                      const next = [...challengesList];
                      next[i] = { challenge: e.target.value, solution: c.solution };
                      setChallengesList(next);
                    }}
                    rows={2}
                    className={`flex-1 ${inputCls}`}
                    placeholder="Challenge..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setChallengesList(
                        challengesList.filter((_, j) => j !== i),
                      )
                    }
                    className="mt-1 text-sm text-destructive hover:text-destructive/80"
                  >
                    &times;
                  </button>
                </div>
                <textarea
                  value={c.solution}
                  onChange={(e) => {
                    const next = [...challengesList];
                    next[i] = { challenge: c.challenge, solution: e.target.value };
                    setChallengesList(next);
                  }}
                  rows={2}
                  className={`w-full ${inputCls}`}
                  placeholder="Solution..."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setChallengesList([
                  ...challengesList,
                  { challenge: "", solution: "" },
                ])
              }
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              + Add Challenge
            </button>
          </div>

          {/* URLs */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">URLs</h3>
            <FormField
              label="Featured Image"
              value={featuredImage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFeaturedImage(e.target.value)
              }
              placeholder="https://..."
            />
            <FormField
              label="Live URL"
              value={liveUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLiveUrl(e.target.value)
              }
              placeholder="https://..."
            />
            <FormField
              label="Repository URL"
              value={repositoryUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRepositoryUrl(e.target.value)
              }
              placeholder="https://..."
            />
            <FormField
              label="Video URL"
              value={videoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setVideoUrl(e.target.value)
              }
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Technologies */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Technologies
            </h3>
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      techInput.trim() &&
                      !technologies.includes(techInput.trim())
                    ) {
                      setTechnologies([...technologies, techInput.trim()]);
                      setTechInput("");
                    }
                  }
                }}
                className={`flex-1 ${inputCls}`}
                placeholder="Add technology..."
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    techInput.trim() &&
                    !technologies.includes(techInput.trim())
                  ) {
                    setTechnologies([...technologies, techInput.trim()]);
                    setTechInput("");
                  }
                }}
                className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((t) => (
                <span
                  key={t}
                  className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setTechnologies(technologies.filter((x) => x !== t))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Milestones (only in edit mode) */}
          {isEdit && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Milestones
              </h3>
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className="glass-subtle flex items-center justify-between rounded-xl px-4 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {m.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.status}
                          {m.dueDate
                            ? ` \u2022 Due ${new Date(m.dueDate).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(m.id)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  value={newMilestone.title}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, title: e.target.value })
                  }
                  className={inputCls}
                  placeholder="Title"
                />
                <input
                  value={newMilestone.description}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      description: e.target.value,
                    })
                  }
                  className={inputCls}
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        dueDate: e.target.value,
                      })
                    }
                    className={`flex-1 ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Images (only in edit mode) */}
          {isEdit && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Gallery Images
              </h3>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-video overflow-hidden rounded-xl bg-muted"
                    >
                      <img
                        src={img.url}
                        alt={img.altText ?? ""}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className={`flex-1 ${inputCls}`}
                  placeholder="Image URL..."
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 space-y-4">
            <FormField
              as="select"
              label="Status"
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatus(e.target.value)
              }
            >
              <option value="INQUIRY">Inquiry</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </FormField>
            <FormField
              label="Budget"
              value={budget}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBudget(e.target.value)
              }
              placeholder="e.g. $5,000"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
              />
              <FormField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-glass-border text-primary-500 focus:ring-primary-500/30"
              />
              Public project
            </label>
          </div>

          {/* Quality Badges */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Quality Badges
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_BADGE_OPTIONS.map((badge) => (
                <label
                  key={badge}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={qualityBadges.includes(badge)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setQualityBadges([...qualityBadges, badge]);
                      } else {
                        setQualityBadges(
                          qualityBadges.filter((b) => b !== badge),
                        );
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-glass-border text-primary-500 focus:ring-primary-500/30"
                  />
                  {badge}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !title}
            className="btn-glass-primary w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </button>
        </div>
      </div>
    </form>
  );
}
