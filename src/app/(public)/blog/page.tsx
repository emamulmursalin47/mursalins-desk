import type { Metadata } from "next";
import { getFilteredPosts, getCategories } from "@/lib/api";
import { constructMetadata } from "@/lib/metadata";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/seo";

export const metadata: Metadata = constructMetadata({
  title: "Blog — Web Development Tips & Insights",
  description:
    "Read articles on web development, React, Next.js, Node.js, SaaS building, and full-stack engineering by freelance developer Md. Emamul Mursalin from Bangladesh.",
  path: "/blog",
  keywords: [
    "web development blog",
    "React tutorials",
    "Next.js tips",
    "full stack development blog",
    "freelance developer blog",
  ],
});

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const [postsResult, categories] = await Promise.all([
    getFilteredPosts(currentPage, 9, params.category).catch(() => null),
    getCategories().catch(() => []),
  ]);

  const posts = postsResult?.data ?? [];
  const meta = postsResult?.meta ?? null;

  const featuredPost =
    currentPage === 1 && !params.category
      ? posts.find((p) => p.isFeatured) ?? null
      : null;
  const regularPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Blog", url: `${siteConfig.url}/blog` },
        ]}
      />
      <BlogHero />
      <BlogGrid
        posts={regularPosts}
        featuredPost={featuredPost}
        categories={categories}
        meta={meta}
        activeCategory={params.category ?? null}
      />
    </>
  );
}
