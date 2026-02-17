"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { PostForm } from "@/components/dashboard/post-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { AdminPost } from "@/types/admin";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<AdminPost>(`/blog/posts/${id}`)
      .then(setPost)
      .catch(() => router.push("/dashboard/blog"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingState />;
  if (!post) return null;

  return (
    <div>
      <PageHeader
        title="Edit Post"
        description={`Editing: ${post.title}`}
        action={
          <button
            onClick={() => router.push("/dashboard/blog")}
            className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
          >
            &larr; Back
          </button>
        }
      />
      <PostForm post={post} />
    </div>
  );
}
