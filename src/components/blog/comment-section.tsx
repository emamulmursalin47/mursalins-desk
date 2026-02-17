"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface CommentSectionProps {
  postSlug: string;
}

function getStorageKey(slug: string) {
  return `blog-comments-${slug}`;
}

function loadComments(slug: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(slug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(slug: string, comments: Comment[]) {
  localStorage.setItem(getStorageKey(slug), JSON.stringify(comments));
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setComments(loadComments(postSlug));
    setMounted(true);
  }, [postSlug]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !content.trim()) return;

      const newComment: Comment = {
        id: crypto.randomUUID(),
        name: name.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      const updated = [newComment, ...comments];
      setComments(updated);
      saveComments(postSlug, updated);
      setName("");
      setContent("");
    },
    [name, content, comments, postSlug],
  );

  const handleLike = useCallback(
    (id: string) => {
      const updated = comments.map((c) =>
        c.id === id ? { ...c, likes: c.likes + 1 } : c,
      );
      setComments(updated);
      saveComments(postSlug, updated);
    },
    [comments, postSlug],
  );

  if (!mounted) return null;

  return (
    <div>
      <h3 className="mb-6 text-xl font-bold text-foreground">
        Comments{" "}
        {comments.length > 0 && (
          <span className="text-base font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6">
        <div className="mb-4">
          <label
            htmlFor="comment-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-shadow focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="comment-content"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Comment
          </label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            required
            rows={4}
            className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-shadow focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || !content.trim()}
          className="btn-glass-primary rounded-xl px-6 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Post Comment
        </button>
      </form>

      {/* Comments list */}
      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <div className="glass-subtle rounded-2xl py-12 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm font-medium text-muted-foreground">
              No comments yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="glass-card rounded-2xl p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {comment.name}
                    </p>
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
                  aria-label={`Like comment by ${comment.name}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {comment.likes > 0 && (
                    <span className="text-xs">{comment.likes}</span>
                  )}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
