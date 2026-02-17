"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import type { Post } from "@/types/api";
import { Container } from "@/components/layout/container";
import { TableOfContents } from "./table-of-contents";
import { ShareButtons } from "./share-buttons";
import { CommentSection } from "./comment-section";
import { BlogPostCard } from "./blog-post-card";

interface BlogArticleProps {
  post: Post;
  relatedPosts: Post[];
  siteUrl: string;
}

/**
 * Inject id attributes into h2 and h3 tags so the TOC + scroll spy work.
 */
function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h([23])>/gi,
    (_match, level, attrs, text, _closeLevel) => {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      // Preserve existing attributes but add/replace id
      if (/id="/.test(attrs)) {
        return `<h${level}${attrs}>${text}</h${level}>`;
      }
      return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
    },
  );
}

export function BlogArticle({ post, relatedPosts, siteUrl }: BlogArticleProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (heroRef.current) createFadeUp(heroRef.current, { scrollTrigger: false, delay: 0.1 });
    if (headerRef.current) createFadeUp(headerRef.current, { scrollTrigger: false, delay: 0.2 });
    if (bodyRef.current) createFadeUp(bodyRef.current, { scrollTrigger: false, delay: 0.35 });
    if (relatedRef.current) {
      createStaggerFadeUp(relatedRef.current, "[data-animate]", { delay: 0.2 });
    }
  });

  const processedHtml = useMemo(
    () => injectHeadingIds(post.content),
    [post.content],
  );

  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : null;

  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <article className="pb-24">
      {/* Cover image hero */}
      {post.coverImage && (
        <Container>
          <div ref={heroRef} className="pt-28">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={514}
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="aspect-video w-full object-cover sm:aspect-21/9"
              />
            </div>
          </div>
        </Container>
      )}

      {/* Article header */}
      <Container>
        <div
          ref={headerRef}
          className={post.coverImage ? "pt-10" : "pt-32"}
        >
          {/* Category pills */}
          {post.categories && post.categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map(({ category }) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="glass-subtle rounded-full px-3 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-500/10"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* Author + meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-foreground/5 pb-6">
            {authorName && (
              <div className="flex items-center gap-3">
                {post.author?.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={authorName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{authorName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    )}
                    {post.readTimeMin && (
                      <>
                        <span>&middot;</span>
                        <span>{post.readTimeMin} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="ml-auto">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </div>
        </div>
      </Container>

      {/* Article body + TOC sidebar */}
      <Container>
        <div ref={bodyRef} className="pt-10 lg:flex lg:gap-10">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-foreground/5 pt-6">
                {post.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="glass-subtle rounded-full px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom share bar */}
            <div className="mt-8 flex items-center justify-between border-t border-foreground/5 pt-6">
              <Link
                href="/blog"
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                &larr; All Posts
              </Link>
              <ShareButtons url={postUrl} title={post.title} />
            </div>

            {/* Comment section */}
            <div className="mt-16">
              <CommentSection postSlug={post.slug} />
            </div>
          </div>

          {/* Sticky TOC sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents html={processedHtml} />
            </div>
          </aside>
        </div>
      </Container>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <Container>
          <div className="mt-20 border-t border-foreground/5 pt-12">
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Related Articles
            </h2>
            <div
              ref={relatedRef}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {relatedPosts.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </Container>
      )}
    </article>
  );
}
