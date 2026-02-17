import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/api";

interface BlogPostCardProps {
  post: Post;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="group/lift" data-animate>
    <article
      className="glass-card glass-shine group flex flex-col rounded-2xl p-1 transition-[transform,box-shadow] duration-300 ease-out will-change-transform group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/10"
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

        <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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

        {/* Author + Read more */}
        <div className="mt-auto flex items-center justify-between pt-4">
          {authorName && (
            <div className="flex items-center gap-2">
              {post.author?.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={authorName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
                  {authorName.charAt(0)}
                </div>
              )}
              <span className="text-xs text-muted-foreground">{authorName}</span>
            </div>
          )}
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            Read &rarr;
          </Link>
        </div>
      </div>
    </article>
    </div>
  );
}
