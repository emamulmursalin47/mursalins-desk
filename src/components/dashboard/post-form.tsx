"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminGet, adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { FormField } from "@/components/dashboard/form-field";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { TipTapEditor } from "@/components/dashboard/tiptap-editor";
import { useToast } from "@/components/dashboard/toast-context";
import { AiFieldButton } from "@/components/dashboard/ai-field-button";
import { AiGenerateModal } from "@/components/dashboard/ai-generate-modal";
import type { Editor } from "@tiptap/react";
import type { AdminPost } from "@/types/admin";
import type { Category, Tag } from "@/types/api";

interface PostFormProps {
  post?: AdminPost;
}

const DRAFT_STORAGE_KEY = "blog_draft_autosave";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " ");
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [status, setStatus] = useState<string>(post?.status ?? "DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured ?? false);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(
    post?.seoKeywords ? post.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    post?.categories?.map((c) => c.category.id) ?? [],
  );
  const [tagIds, setTagIds] = useState<string[]>(
    post?.tags?.map((t) => t.tag.id) ?? [],
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // AI
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  /* ── Word count & reading time ── */
  const { wordCount, readTimeMin } = useMemo(() => {
    const text = stripHtml(content);
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const count = words.length;
    return {
      wordCount: count,
      readTimeMin: Math.max(1, Math.ceil(count / 200)),
    };
  }, [content]);

  /* ── Load categories & tags ── */
  useEffect(() => {
    adminGet<Category[]>("/blog/categories").then(setCategories).catch(() => {});
    adminGet<Tag[]>("/blog/tags").then(setTags).catch(() => {});
  }, []);

  /* ── Auto slug ── */
  useEffect(() => {
    if (autoSlug && title) setSlug(toSlug(title));
  }, [title, autoSlug]);

  /* ── Load draft from localStorage (new post only) ── */
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.title) setTitle(draft.title);
      if (draft.slug) { setSlug(draft.slug); setAutoSlug(false); }
      if (draft.content) setContent(draft.content);
      if (draft.excerpt) setExcerpt(draft.excerpt);
      if (draft.coverImage) setCoverImage(draft.coverImage);
    } catch {
      // Ignore
    }
  }, [isEdit]);

  /* ── Auto-save logic ── */
  const getFormSnapshot = useCallback(() => {
    return JSON.stringify({ title, slug, content, excerpt, coverImage, status, isFeatured, metaTitle, metaDescription });
  }, [title, slug, content, excerpt, coverImage, status, isFeatured, metaTitle, metaDescription]);

  useEffect(() => {
    // Only auto-save drafts
    if (status !== "DRAFT") return;
    // Don't auto-save empty posts
    if (!title && !content) return;

    const snapshot = getFormSnapshot();
    if (snapshot === lastSavedRef.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      if (isEdit && post) {
        // Save to backend for existing posts
        try {
          setAutoSaveStatus("saving");
          await adminPatch(`/blog/posts/${post.id}`, {
            title, slug, content,
            excerpt: excerpt || undefined,
            coverImage: coverImage || undefined,
            isFeatured,
            readTimeMin,
          });
          lastSavedRef.current = snapshot;
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch {
          setAutoSaveStatus("idle");
        }
      } else {
        // Save to localStorage for new posts
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
            title, slug, content, excerpt, coverImage,
          }));
          lastSavedRef.current = snapshot;
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch {
          // Storage unavailable
        }
      }
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [getFormSnapshot, status, isEdit, post, title, slug, content, excerpt, coverImage, isFeatured, readTimeMin]);

  /* ── Focus keyword analysis ── */
  const focusKeyword = seoKeywords[0]?.toLowerCase() ?? "";
  const seoChecks = useMemo(() => {
    if (!focusKeyword) return null;
    const kw = focusKeyword;
    const titleText = (metaTitle || title).toLowerCase();
    const descText = metaDescription.toLowerCase();

    const tempDiv = typeof document !== "undefined" ? document.createElement("div") : null;
    let firstParagraph = "";
    let headingsText = "";
    if (tempDiv) {
      tempDiv.innerHTML = content;
      const p = tempDiv.querySelector("p");
      if (p) firstParagraph = p.textContent?.toLowerCase() ?? "";
      const headings = tempDiv.querySelectorAll("h1, h2, h3, h4");
      headingsText = Array.from(headings)
        .map((h) => h.textContent?.toLowerCase() ?? "")
        .join(" ");
    }

    return {
      inTitle: titleText.includes(kw),
      inDescription: descText.includes(kw),
      inFirstParagraph: firstParagraph.includes(kw),
      inHeadings: headingsText.includes(kw),
    };
  }, [focusKeyword, metaTitle, title, metaDescription, content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body: Record<string, unknown> = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      status: status === "SCHEDULED" ? "SCHEDULED" : status,
      isFeatured,
      readTimeMin,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      seoKeywords: seoKeywords.length ? seoKeywords.join(", ") : undefined,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      tagIds: tagIds.length ? tagIds : undefined,
    };

    // Include scheduledAt for scheduled posts
    if (status === "SCHEDULED" && scheduledAt) {
      body.scheduledAt = new Date(scheduledAt).toISOString();
    }

    try {
      if (isEdit) {
        await adminPatch(`/blog/posts/${post.id}`, body);
        toast("Post updated", "success");
      } else {
        await adminPost("/blog/posts", body);
        toast("Post created", "success");
        // Clear draft from localStorage
        try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* */ }
      }
      await revalidateCache("posts");
      router.push("/dashboard/blog");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !seoKeywords.includes(kw)) {
      setSeoKeywords((prev) => [...prev, kw]);
    }
    setKeywordInput("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main Content ── */}
        <div className="space-y-5 lg:col-span-2">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Post Content</h3>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-500/20 transition-colors"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /></svg>
                Generate with AI
              </button>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                  Title<span className="ml-0.5 text-destructive">*</span>
                </label>
                <AiFieldButton
                  label="Suggest titles"
                  disabled={!title && !content}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const res = await adminPost<{ titles: string[] }>("/blog/ai/generate-titles", {
                      topic: title || "blog post",
                      content: content ? content.slice(0, 1000) : undefined,
                      keywords: seoKeywords.length ? seoKeywords : undefined,
                    });
                    if (res.titles?.length) {
                      setTitle(res.titles[0] ?? "");
                      toast(`Generated ${res.titles.length} title suggestions — applied the first one`, "success");
                    }
                  }}
                />
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <FormField
              label="Slug"
              value={slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="post-slug"
              hint="Auto-generated from title"
            />

            {/* Editor with Edit/Preview toggle */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                  Content<span className="ml-0.5 text-destructive">*</span>
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-glass-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      !previewMode
                        ? "bg-primary-500/10 text-primary-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      previewMode
                        ? "bg-primary-500/10 text-primary-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="glass-subtle min-h-75 overflow-hidden rounded-xl px-4 py-3">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={title}
                      className="mb-4 w-full rounded-xl object-cover"
                      style={{ maxHeight: 300 }}
                    />
                  )}
                  {title && (
                    <h1 className="mb-4 text-2xl font-bold text-foreground">
                      {title}
                    </h1>
                  )}
                  <div
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                  {!content && (
                    <p className="text-sm text-muted-foreground">
                      Nothing to preview yet...
                    </p>
                  )}
                </div>
              ) : (
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  onEditorReady={(e) => { editorRef.current = e; }}
                />
              )}

              {/* Word count, reading time & AI actions */}
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{wordCount.toLocaleString()} words</span>
                <span className="h-3 w-px bg-glass-border" />
                <span>{readTimeMin} min read</span>
                {autoSaveStatus === "saving" && (
                  <>
                    <span className="h-3 w-px bg-glass-border" />
                    <span className="animate-pulse text-primary-500">Saving...</span>
                  </>
                )}
                {autoSaveStatus === "saved" && (
                  <>
                    <span className="h-3 w-px bg-glass-border" />
                    <span className="text-success">Auto-saved</span>
                  </>
                )}
                <span className="flex-1" />
                <AiFieldButton
                  label="AI continue writing"
                  disabled={!content || previewMode}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const res = await adminPost<{ continuation: string }>("/blog/ai/continue", {
                      content,
                      topic: title || undefined,
                      keywords: seoKeywords.length ? seoKeywords : undefined,
                    });
                    if (res.continuation && editorRef.current) {
                      editorRef.current.chain().focus().setTextSelection(editorRef.current.state.doc.content.size).insertContent(res.continuation).run();
                      toast("AI continued writing", "success");
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Excerpt</label>
                <AiFieldButton
                  label="Generate excerpt"
                  disabled={!content}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const res = await adminPost<{ excerpt: string }>("/blog/ai/generate-excerpt", {
                      content,
                      title: title || undefined,
                    });
                    if (res.excerpt) {
                      setExcerpt(res.excerpt);
                      toast("Excerpt generated", "success");
                    }
                  }}
                />
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Brief summary..."
                className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
          </div>

          {/* ── SEO Section ── */}
          <div className="glass rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">SEO</h3>

            {/* Meta Title with character count */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Meta Title
                  </label>
                  <AiFieldButton
                    label="Generate meta title"
                    disabled={!title}
                    onError={(msg) => toast(msg, "error")}
                    onGenerate={async () => {
                      const res = await adminPost<{ metaTitle: string }>("/blog/ai/generate-meta-title", {
                        title,
                        content: content ? content.slice(0, 5000) : undefined,
                        keywords: seoKeywords.length ? seoKeywords : undefined,
                      });
                      if (res.metaTitle) {
                        setMetaTitle(res.metaTitle);
                        toast("Meta title generated", "success");
                      }
                    }}
                  />
                </div>
                <CharCount value={metaTitle.length} max={60} />
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (defaults to post title)"
                className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            {/* Meta Description with character count */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Meta Description
                  </label>
                  <AiFieldButton
                    label="Generate meta description"
                    disabled={!title}
                    onError={(msg) => toast(msg, "error")}
                    onGenerate={async () => {
                      const res = await adminPost<{ metaDescription: string }>("/blog/ai/generate-meta-description", {
                        title,
                        content: content ? content.slice(0, 5000) : undefined,
                        keywords: seoKeywords.length ? seoKeywords : undefined,
                      });
                      if (res.metaDescription) {
                        setMetaDescription(res.metaDescription);
                        toast("Meta description generated", "success");
                      }
                    }}
                  />
                </div>
                <CharCount value={metaDescription.length} max={155} />
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder="SEO description (defaults to excerpt)"
                className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            {/* SEO Keywords */}
            <div>
              <div className="mb-1 flex items-center gap-1">
                <label className="block text-sm font-medium text-foreground">
                  SEO Keywords
                </label>
                <AiFieldButton
                  label="Suggest keywords"
                  disabled={!title && !content}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const res = await adminPost<{ keywords: string[] }>("/blog/ai/suggest-keywords", {
                      title: title || "blog post",
                      content: content ? content.slice(0, 10000) : undefined,
                    });
                    if (res.keywords?.length) {
                      setSeoKeywords(res.keywords);
                      toast(`${res.keywords.length} keywords suggested`, "success");
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Type keyword and press Enter"
                  className="glass-subtle flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="rounded-xl bg-primary-500/10 px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-500/20"
                >
                  Add
                </button>
              </div>
              {seoKeywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {seoKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        i === 0
                          ? "bg-primary-500/10 text-primary-600"
                          : "glass-subtle text-muted-foreground"
                      }`}
                    >
                      {i === 0 && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                          Focus
                        </span>
                      )}
                      {kw}
                      <button
                        type="button"
                        onClick={() =>
                          setSeoKeywords((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="ml-0.5 text-muted-foreground hover:text-destructive"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Focus Keyword Analysis */}
            {seoChecks && (
              <div className="rounded-xl border border-glass-border bg-glass p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Focus Keyword Analysis
                </p>
                <ul className="space-y-1.5 text-sm">
                  <SeoCheck
                    pass={seoChecks.inTitle}
                    label={`"${focusKeyword}" in title`}
                  />
                  <SeoCheck
                    pass={seoChecks.inDescription}
                    label={`"${focusKeyword}" in meta description`}
                  />
                  <SeoCheck
                    pass={seoChecks.inFirstParagraph}
                    label={`"${focusKeyword}" in first paragraph`}
                  />
                  <SeoCheck
                    pass={seoChecks.inHeadings}
                    label={`"${focusKeyword}" in a heading`}
                  />
                </ul>
              </div>
            )}

            {/* SERP Preview */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Google Preview
              </p>
              <div className="rounded-xl border border-glass-border bg-white p-4">
                <p className="truncate text-lg leading-snug text-[#1a0dab]">
                  {metaTitle || title || "Post Title"}
                </p>
                <p className="mt-0.5 truncate text-sm text-[#006621]">
                  mursalinsdesk.com/blog/{slug || "post-slug"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#545454]">
                  {metaDescription || excerpt || "Your meta description will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 space-y-4">
            <FormField
              as="select"
              label="Status"
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </FormField>

            {/* Scheduled date picker */}
            {status === "SCHEDULED" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                {scheduledAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Will publish on{" "}
                    {new Date(scheduledAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            )}

            <ImageUpload
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="blog"
              aspectClass="aspect-video"
              hint="Recommended: 1200×630px"
            />

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-glass-border text-primary-500 focus:ring-primary-500/30"
              />
              Featured post
            </label>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      categoryIds.includes(cat.id)
                        ? "glass text-primary-600"
                        : "glass-subtle text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={categoryIds.includes(cat.id)}
                      onChange={() =>
                        setCategoryIds((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      tagIds.includes(tag.id)
                        ? "glass text-primary-600"
                        : "glass-subtle text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={tagIds.includes(tag.id)}
                      onChange={() =>
                        setTagIds((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id],
                        )
                      }
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !title || !content || (status === "SCHEDULED" && !scheduledAt)}
            className="btn-glass-primary w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : status === "SCHEDULED"
                ? "Schedule Post"
                : isEdit
                  ? "Update Post"
                  : "Create Post"}
          </button>
        </div>
      </div>

      {/* AI Generate Full Post Modal */}
      <AiGenerateModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerated={(result) => {
          if (result.slug) {
            setSlug(result.slug);
            setAutoSlug(false);
          } else if (result.title) {
            setAutoSlug(true);
          }
          if (result.title) setTitle(result.title);
          if (result.content) setContent(result.content);
          if (result.excerpt) setExcerpt(result.excerpt);
          if (result.metaTitle) setMetaTitle(result.metaTitle);
          if (result.metaDescription) setMetaDescription(result.metaDescription);
          if (result.seoKeywords?.length) setSeoKeywords(result.seoKeywords);
          if (result.suggestedCategoryIds?.length) setCategoryIds(result.suggestedCategoryIds);
          if (result.suggestedTagIds?.length) setTagIds(result.suggestedTagIds);
          toast("Blog post generated with AI", "success");
        }}
      />
    </form>
  );
}

/* ────────────────────────────────────────── */
/* Helper Components                          */
/* ────────────────────────────────────────── */

function CharCount({ value, max }: { value: number; max: number }) {
  const color =
    value === 0
      ? "text-muted-foreground"
      : value <= max
        ? "text-success"
        : value <= max * 1.15
          ? "text-warning"
          : "text-destructive";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {value}/{max}
    </span>
  );
}

function SeoCheck({ pass, label }: { pass: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          pass
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {pass ? "\u2713" : "\u2717"}
      </span>
      <span className={pass ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}
