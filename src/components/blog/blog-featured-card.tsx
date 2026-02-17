import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/api";

interface BlogFeaturedCardProps {
  post: Post;
}

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="group/lift" data-animate>
    <article
      className="glass-card glass-shine group overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/10"
    >
      <Link href={`/blog/${post.slug}`} className="grid gap-0 lg:grid-cols-2">
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[320px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
              <div className="glass h-12 w-12 rounded-xl" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 lg:p-10">
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary-600">
            <svg
              className="h-3 w-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-foreground line-clamp-2 lg:text-3xl">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
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

          {/* Author + Meta */}
          <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
            {authorName && (
              <div className="flex items-center gap-2">
                {post.author?.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={authorName}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
                    {authorName.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-foreground">{authorName}</span>
              </div>
            )}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            )}
            {post.readTimeMin && <span>{post.readTimeMin} min read</span>}
          </div>
        </div>
      </Link>
    </article>
    </div>
  );
}
