"use client";

import { useState, useEffect } from "react";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
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

          {/* SEO */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">SEO</h3>
            <FormField
              label="Meta Title"
              value={metaTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)}
              placeholder="SEO title"
            />
            <FormField
              as="textarea"
              label="Meta Description"
              value={metaDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
              rows={2}
              placeholder="SEO description"
            />
          </div>
        </div>

        {/* Sidebar */}
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
