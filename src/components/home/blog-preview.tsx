"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp, createFadeIn } from "@/lib/gsap";
import type { Post } from "@/types/api";
import { Container } from "@/components/layout/container";

interface BlogPreviewProps {
  posts: Post[];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
    if (ctaRef.current) {
      createFadeIn(ctaRef.current, { delay: 0.4 });
    }
  });

  return (
    <section className="relative py-16">
      <Container>
      <div ref={headingRef} data-gsap className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Latest Posts
        </h2>
        <p className="mt-3 text-muted-foreground">
          Thoughts on development, design, and building products
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={ctaRef} data-gsap className="mt-10 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
        >
          Read all posts &rarr;
        </Link>
      </div>
      </Container>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="group/lift" data-animate>
    <article
      className="glass-card glass-shine group flex flex-col rounded-2xl p-1 transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/10"
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
            <div className="glass h-8 w-8 rounded-lg" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Meta */}
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
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

        <h3 className="text-base font-semibold text-foreground line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.categories.map(({ category }) => (
              <span
                key={category.id}
                className="glass-subtle rounded-md px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            Read more &rarr;
          </Link>
        </div>
      </div>
    </article>
    </div>
  );
}
