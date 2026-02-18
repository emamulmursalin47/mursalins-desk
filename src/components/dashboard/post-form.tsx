"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { adminGet, adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { FormField } from "@/components/dashboard/form-field";
import { TipTapEditor } from "@/components/dashboard/tiptap-editor";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminPost } from "@/types/admin";
import type { Category, Tag } from "@/types/api";

interface PostFormProps {
  post?: AdminPost;
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

  useEffect(() => {
    adminGet<Category[]>("/blog/categories").then(setCategories).catch(() => {});
    adminGet<Tag[]>("/blog/tags").then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (autoSlug && title) setSlug(toSlug(title));
  }, [title, autoSlug]);

  /* ── Focus keyword analysis ── */
  const focusKeyword = seoKeywords[0]?.toLowerCase() ?? "";
  const seoChecks = useMemo(() => {
    if (!focusKeyword) return null;
    const kw = focusKeyword;
    const titleText = (metaTitle || title).toLowerCase();
    const descText = metaDescription.toLowerCase();

    // Extract first paragraph text from HTML content
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

    const body = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      status,
      isFeatured,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      seoKeywords: seoKeywords.length ? seoKeywords.join(", ") : undefined,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      tagIds: tagIds.length ? tagIds : undefined,
    };

    try {
      if (isEdit) {
        await adminPatch(`/blog/posts/${post.id}`, body);
        toast("Post updated", "success");
      } else {
        await adminPost("/blog/posts", body);
        toast("Post created", "success");
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
            <FormField
              label="Title"
              required
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Post title"
            />
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
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Content<span className="ml-0.5 text-destructive">*</span>
              </label>
              <TipTapEditor content={content} onChange={setContent} />
            </div>
            <FormField
              as="textarea"
              label="Excerpt"
              value={excerpt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Brief summary..."
            />
          </div>

          {/* ── SEO Section ── */}
          <div className="glass rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">SEO</h3>

            {/* Meta Title with character count */}
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Meta Title
                </label>
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
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Meta Description
                </label>
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
              <label className="mb-1 block text-sm font-medium text-foreground">
                SEO Keywords
              </label>
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
              <option value="ARCHIVED">Archived</option>
            </FormField>

            <FormField
              label="Cover Image"
              value={coverImage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImage(e.target.value)}
              placeholder="https://..."
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
            disabled={saving || !title || !content}
            className="btn-glass-primary w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Post"
                : "Create Post"}
          </button>
        </div>
      </div>
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
