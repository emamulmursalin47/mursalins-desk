import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getFilteredPosts } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdown";
import { siteConfig } from "@/config/seo";
import { BreadcrumbJsonLd, BlogArticleJsonLd } from "@/components/seo/json-ld";
import { BlogArticle } from "@/components/blog/blog-article";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await getFilteredPosts(1, 100).catch(() => null);
  return (result?.data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : siteConfig.creator.name;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [authorName],
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [post, postsResult] = await Promise.all([
    getPostBySlug(slug),
    getFilteredPosts(1, 4).catch(() => null),
  ]);

  if (!post) notFound();

  // Convert markdown to HTML if content isn't already HTML
  const isHtml = post.content.trimStart().startsWith("<");
  const htmlContent = isHtml ? post.content : markdownToHtml(post.content);

  // Pick up to 3 related posts (excluding the current one)
  const relatedPosts = (postsResult?.data ?? [])
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Blog", url: `${siteConfig.url}/blog` },
          { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` },
        ]}
      />
      <BlogArticleJsonLd post={post} />
      <BlogArticle
        post={{ ...post, content: htmlContent as string }}
        relatedPosts={relatedPosts}
        siteUrl={siteConfig.url}
      />
    </>
  );
}
