"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { adminUpload } from "@/lib/admin-api";

/* ────────────────────────────────────────── */
/* Types                                      */
/* ────────────────────────────────────────── */

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#9333ea" },
  { label: "Pink", value: "#db2777" },
  { label: "Teal", value: "#0d9488" },
];

/* ────────────────────────────────────────── */
/* Editor Component                           */
/* ────────────────────────────────────────── */

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Write your content...",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ImageExtension,
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Typography,
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="glass-subtle overflow-hidden rounded-xl">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-glass-border px-2 py-1.5">
        {/* History */}
        <ToolbarBtn
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <UndoIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <RedoIcon />
        </ToolbarBtn>

        <Divider />

        {/* Text format */}
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <span className="italic">I</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <span className="rounded bg-yellow-200 px-0.5 text-foreground">
            H
          </span>
        </ToolbarBtn>
        <ColorPicker editor={editor} />

        <Divider />

        {/* Headings */}
        {([1, 2, 3, 4] as const).map((level) => (
          <ToolbarBtn
            key={level}
            active={editor.isActive("heading", { level })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarBtn>
        ))}

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
        >
          <AlignLeftIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
        >
          <AlignCenterIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
        >
          <AlignRightIcon />
        </ToolbarBtn>

        <Divider />

        {/* Lists & blocks */}
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <BulletListIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <OrderedListIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <QuoteIcon />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          {"</>"}
        </ToolbarBtn>
        <ToolbarBtn
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </ToolbarBtn>

        <Divider />

        {/* Link & Image */}
        <LinkButton editor={editor} />
        <ImageButton editor={editor} />
      </div>

      {/* ── Editor content ── */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 text-foreground focus:outline-none [&_.tiptap]:min-h-75 [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Color Picker                               */
/* ────────────────────────────────────────── */

function ColorPicker({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!editor) return null;

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn
        active={open}
        onClick={() => setOpen(!open)}
        title="Text Color"
      >
        <span className="flex flex-col items-center leading-none">
          A
          <span
            className="mt-0.5 block h-0.5 w-3 rounded-full"
            style={{
              backgroundColor:
                (editor.getAttributes("textStyle").color as string) ||
                "currentColor",
            }}
          />
        </span>
      </ToolbarBtn>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-glass-border bg-background p-2 shadow-lg">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => {
                if (c.value) {
                  editor.chain().focus().setColor(c.value).run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
                setOpen(false);
              }}
              className="h-5 w-5 rounded-full border border-glass-border transition-transform hover:scale-125"
              style={{
                backgroundColor: c.value || "#374151",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Link Popover                               */
/* ────────────────────────────────────────── */

function LinkButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [newTab, setNewTab] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const openPopover = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    setUrl(existing ?? "");
    setNewTab(true);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: url,
          target: newTab ? "_blank" : null,
        })
        .run();
    }
    setOpen(false);
  }, [editor, url, newTab]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn
        active={editor.isActive("link")}
        onClick={openPopover}
        title="Insert Link"
      >
        <LinkIcon />
      </ToolbarBtn>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-glass-border bg-background p-3 shadow-lg">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-glass-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={newTab}
              onChange={(e) => setNewTab(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-glass-border"
            />
            Open in new tab
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={applyLink}
              className="rounded-lg bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-500/20"
            >
              Apply
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={removeLink}
                className="rounded-lg px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Image Upload + URL                         */
/* ────────────────────────────────────────── */

function ImageButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const insertFromUrl = useCallback(() => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
    setUrl("");
    setOpen(false);
  }, [editor, url]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const result = await adminUpload<{ url: string }>(file, "blog");
        editor.chain().focus().setImage({ src: result.url }).run();
        setOpen(false);
      } catch {
        /* upload failed — user will see no image inserted */
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn
        active={open}
        onClick={() => setOpen(!open)}
        title="Insert Image"
      >
        <ImageIcon />
      </ToolbarBtn>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-xl border border-glass-border bg-background p-3 shadow-lg">
          {/* File upload */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-lg border border-dashed border-glass-border px-3 py-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary-500/50 hover:text-foreground disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Click to upload image"}
          </button>

          {/* URL fallback */}
          <div className="my-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-glass-border" />
            or
            <div className="h-px flex-1 bg-glass-border" />
          </div>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
              placeholder="Paste image URL"
              className="flex-1 rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={insertFromUrl}
              className="rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-500/20"
            >
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Toolbar Helpers                            */
/* ────────────────────────────────────────── */

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-30 ${
        active
          ? "bg-primary-500/10 text-primary-600"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-glass-border" />;
}

/* ────────────────────────────────────────── */
/* SVG Icons (14×14, stroke-based)            */
/* ────────────────────────────────────────── */

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function UndoIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg {...iconProps}>
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg {...iconProps}>
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg {...iconProps}>
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg {...iconProps}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg {...iconProps}>
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">
        1
      </text>
      <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">
        2
      </text>
      <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">
        3
      </text>
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
