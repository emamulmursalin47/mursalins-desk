"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { PostForm } from "@/components/dashboard/post-form";

export default function NewPostPage() {
  return (
    <div>
      <PageHeader title="New Post" description="Create a new blog post." />
      <PostForm />
    </div>
  );
}
