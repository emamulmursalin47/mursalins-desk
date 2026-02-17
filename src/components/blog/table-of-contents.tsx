"use client";

import { useEffect, useState, useRef } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  html: string;
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([23])\s[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  const items: TocItem[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1];
    const id = match[2];
    const text = match[3];
    if (level && id && text) {
      items.push({
        level: parseInt(level),
        id,
        text: text.replace(/<[^>]+>/g, ""),
      });
    }
  }

  return items;
}

export function TableOfContents({ html }: TableOfContentsProps) {
  const items = extractHeadings(html);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="glass-card rounded-2xl p-5">
      <h4 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        On this page
      </h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block rounded-lg py-1.5 text-[13px] leading-snug transition-all duration-200 ${
                item.level === 3 ? "pl-7" : "pl-3"
              } ${
                activeId === item.id
                  ? "bg-primary-500/10 font-medium text-primary-600"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
