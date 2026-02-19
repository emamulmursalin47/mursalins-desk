"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
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
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import { common, createLowlight } from "lowlight";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, NodeSelection } from "@tiptap/pm/state";
import { adminUpload } from "@/lib/admin-api";

/* ────────────────────────────────────────── */
/* Constants                                   */
/* ────────────────────────────────────────── */

const lowlight = createLowlight(common);

/* ── Drag Handle Extension ── */

const dragHandleKey = new PluginKey("dragHandle");

const DragHandle = Extension.create({
  name: "dragHandle",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: dragHandleKey,
        view(view) {
          const handle = document.createElement("div");
          handle.className = "editor-drag-handle";
          handle.draggable = true;
          handle.contentEditable = "false";
          handle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>`;

          const wrapper = view.dom.parentElement;
          if (wrapper) {
            wrapper.style.position = "relative";
            wrapper.appendChild(handle);
          }

          let hoveredNodePos: number | null = null;
          let rafId: number | null = null;

          function updateHandle(event: MouseEvent) {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
              rafId = null;
              updateHandleCore(event);
            });
          }

          function updateHandleCore(event: MouseEvent) {
            const coords = { left: event.clientX, top: event.clientY };
            const posInfo = view.posAtCoords(coords);
            if (!posInfo) {
              hide();
              return;
            }
            const $pos = view.state.doc.resolve(posInfo.pos);
            let depth = $pos.depth;
            while (depth > 1) depth--;
            if (depth < 1) {
              hide();
              return;
            }
            const nodePos = $pos.before(depth);
            const dom = view.nodeDOM(nodePos);
            if (!(dom instanceof HTMLElement)) {
              hide();
              return;
            }
            const nodeRect = dom.getBoundingClientRect();
            const editorRect = view.dom.getBoundingClientRect();
            handle.style.opacity = "1";
            handle.style.top = `${nodeRect.top - editorRect.top + 2}px`;
            hoveredNodePos = nodePos;
          }

          function hide() {
            handle.style.opacity = "0";
            hoveredNodePos = null;
          }

          function onDragStart(e: DragEvent) {
            if (hoveredNodePos === null || !e.dataTransfer) return;
            try {
              const sel = NodeSelection.create(view.state.doc, hoveredNodePos);
              view.dispatch(view.state.tr.setSelection(sel));
              const slice = sel.content();
              view.dragging = { slice, move: true };
              e.dataTransfer.effectAllowed = "move";
            } catch {
              // Position became invalid after doc change — abort drag
              hide();
            }
          }

          view.dom.addEventListener("mousemove", updateHandle);
          view.dom.addEventListener("mouseleave", hide);
          handle.addEventListener("dragstart", onDragStart);

          return {
            destroy() {
              if (rafId !== null) cancelAnimationFrame(rafId);
              view.dom.removeEventListener("mousemove", updateHandle);
              view.dom.removeEventListener("mouseleave", hide);
              handle.removeEventListener("dragstart", onDragStart);
              handle.remove();
            },
          };
        },
      }),
    ];
  },
});

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

const CODE_LANGUAGES = [
  { label: "Auto", value: "" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "HTML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Bash", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Java", value: "java" },
  { label: "YAML", value: "yaml" },
];

interface SlashItem {
  label: string;
  description: string;
  searchTerms: string;
  command: (editor: Editor) => void;
}

/* ────────────────────────────────────────── */
/* Editor Component                            */
/* ────────────────────────────────────────── */

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Write your content... (type / for commands)",
}: TipTapEditorProps) {
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Slash menu state
  const [slashMenu, setSlashMenu] = useState<{
    query: string;
    from: number;
    top: number;
    left: number;
  } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  // Image edit state
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);

  // YouTube insert state
  const [youtubeOpen, setYoutubeOpen] = useState(false);

  const slashItems = useMemo<SlashItem[]>(
    () => [
      {
        label: "Text",
        description: "Plain paragraph",
        searchTerms: "text paragraph",
        command: (ed) => ed.chain().focus().setParagraph().run(),
      },
      {
        label: "Heading 1",
        description: "Large heading",
        searchTerms: "heading h1 title",
        command: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        label: "Heading 2",
        description: "Medium heading",
        searchTerms: "heading h2 subtitle",
        command: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        label: "Heading 3",
        description: "Small heading",
        searchTerms: "heading h3",
        command: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        label: "Bullet List",
        description: "Unordered list",
        searchTerms: "bullet list unordered ul",
        command: (ed) => ed.chain().focus().toggleBulletList().run(),
      },
      {
        label: "Numbered List",
        description: "Ordered list",
        searchTerms: "numbered list ordered ol",
        command: (ed) => ed.chain().focus().toggleOrderedList().run(),
      },
      {
        label: "Blockquote",
        description: "Quote block",
        searchTerms: "blockquote quote",
        command: (ed) => ed.chain().focus().toggleBlockquote().run(),
      },
      {
        label: "Code Block",
        description: "Syntax-highlighted code",
        searchTerms: "code block pre syntax",
        command: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      },
      {
        label: "Table",
        description: "Insert a 3×3 table",
        searchTerms: "table grid",
        command: (ed) =>
          ed
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      {
        label: "Image",
        description: "Upload or embed an image",
        searchTerms: "image picture photo",
        command: () => {
          /* handled via ref below */
        },
      },
      {
        label: "YouTube",
        description: "Embed a YouTube video",
        searchTerms: "youtube video embed",
        command: () => setYoutubeOpen(true),
      },
      {
        label: "Divider",
        description: "Horizontal rule",
        searchTerms: "divider hr horizontal rule separator",
        command: (ed) => ed.chain().focus().setHorizontalRule().run(),
      },
    ],
    [],
  );

  // File input ref for image slash command
  const slashImageFileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: { loading: "lazy" },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Typography,
      Table.configure({ resizable: false, HTMLAttributes: { class: "editor-table" } }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "youtube-embed" },
      }),
      DragHandle,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      isInternalUpdate.current = true;
      onChange(e.getHTML());
    },
  });

  // Sync external content — only for reset/initial load, skip when change came from editor itself
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    editor.commands.setContent(content);
  }, [content, editor]);

  // Slash menu detection
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      const { $anchor } = editor.state.selection;
      if ($anchor.parent.type.name !== "paragraph") {
        setSlashMenu(null);
        return;
      }
      const textBefore = $anchor.parent.textContent.slice(
        0,
        $anchor.parentOffset,
      );
      const match = textBefore.match(/^\/(\w*)$/);
      if (match) {
        const coords = editor.view.coordsAtPos(editor.state.selection.from);
        const rect = editorWrapRef.current?.getBoundingClientRect();
        if (rect) {
          setSlashMenu({
            query: match[1] ?? "",
            from: $anchor.pos - textBefore.length,
            top: coords.bottom - rect.top + 4,
            left: Math.max(0, coords.left - rect.left),
          });
          setSlashIndex(0);
        }
      } else {
        setSlashMenu(null);
      }
    };
    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  // Filter slash items
  const filteredSlashItems = useMemo(() => {
    if (!slashMenu) return slashItems;
    const q = slashMenu.query.toLowerCase();
    if (!q) return slashItems;
    return slashItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.searchTerms.includes(q),
    );
  }, [slashMenu, slashItems]);

  // Execute slash command
  const executeSlashCommand = useCallback(
    (item: SlashItem) => {
      if (!editor || !slashMenu) return;
      // Delete the /query text
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashMenu.from, to: editor.state.selection.from })
        .run();

      if (item.label === "Image") {
        slashImageFileRef.current?.click();
      } else {
        item.command(editor);
      }
      setSlashMenu(null);
    },
    [editor, slashMenu],
  );

  // Keyboard handler for slash menu (capture phase to intercept before ProseMirror)
  useEffect(() => {
    if (!editor || !slashMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSlashMenu(null);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSlashIndex((i) =>
          Math.min(i + 1, filteredSlashItems.length - 1),
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSlashIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const item = filteredSlashItems[slashIndex];
        if (item) executeSlashCommand(item);
        return;
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("keydown", handler, true);
    return () => dom.removeEventListener("keydown", handler, true);
  }, [editor, slashMenu, slashIndex, filteredSlashItems, executeSlashCommand]);

  // Handle image upload from slash command
  const handleSlashImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const result = await adminUpload<{ url: string }>(file, "blog");
        editor.chain().focus().setImage({ src: result.url }).run();
      } catch {
        /* upload failed */
      }
    },
    [editor],
  );

  if (!editor) return null;

  const isInTable = editor.isActive("table");
  const isInCodeBlock = editor.isActive("codeBlock");
  const isImageSelected = editor.isActive("image");

  return (
    <div className="glass-subtle overflow-hidden rounded-xl">
      {/* ── Main Toolbar ── */}
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

        {/* Link, Image, YouTube, Table */}
        <LinkButton editor={editor} />
        <ImageButton editor={editor} />
        <YouTubeButton editor={editor} open={youtubeOpen} setOpen={setYoutubeOpen} />
        <TableButton editor={editor} />

        {/* Image edit (when image selected) */}
        {isImageSelected && (
          <>
            <Divider />
            <ImageEditButton
              editor={editor}
              open={imagePopoverOpen}
              setOpen={setImagePopoverOpen}
            />
          </>
        )}
      </div>

      {/* ── Table operations bar ── */}
      {isInTable && <TableOpsBar editor={editor} />}

      {/* ── Code language selector ── */}
      {isInCodeBlock && <CodeLanguageBar editor={editor} />}

      {/* ── Editor content + overlays ── */}
      <div ref={editorWrapRef} className="relative">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-4 py-3 text-foreground focus:outline-none [&_.tiptap]:min-h-75 [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
        />

        {/* Slash commands menu */}
        {slashMenu && filteredSlashItems.length > 0 && (
          <div
            className="absolute z-30 w-64 overflow-hidden rounded-xl border border-glass-border bg-background shadow-lg"
            style={{ top: slashMenu.top, left: slashMenu.left }}
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredSlashItems.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeSlashCommand(item);
                  }}
                  onMouseEnter={() => setSlashIndex(i)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                    i === slashIndex
                      ? "bg-primary-500/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-xs font-medium">
                    {slashIcons[item.label] ?? "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for slash Image command */}
      <input
        ref={slashImageFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSlashImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Slash command icon map                      */
/* ────────────────────────────────────────── */

const slashIcons: Record<string, string> = {
  Text: "¶",
  "Heading 1": "H1",
  "Heading 2": "H2",
  "Heading 3": "H3",
  "Bullet List": "•",
  "Numbered List": "1.",
  Blockquote: "❝",
  "Code Block": "</>",
  Table: "⊞",
  Image: "🖼",
  YouTube: "▶",
  Divider: "—",
};

/* ────────────────────────────────────────── */
/* Color Picker                                */
/* ────────────────────────────────────────── */

function ColorPicker({ editor }: { editor: Editor }) {
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
              style={{ backgroundColor: c.value || "#374151" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Link Popover                                */
/* ────────────────────────────────────────── */

function LinkButton({ editor }: { editor: Editor }) {
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
    const existing = editor.getAttributes("link").href as string | undefined;
    setUrl(existing ?? "");
    setNewTab(true);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: newTab ? "_blank" : null })
        .run();
    }
    setOpen(false);
  }, [editor, url, newTab]);

  const removeLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }, [editor]);

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
/* Image Upload + URL                          */
/* ────────────────────────────────────────── */

function ImageButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
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

  const insertImage = useCallback(
    (src: string) => {
      editor.chain().focus().setImage({ src, alt: alt || undefined }).run();
      setUrl("");
      setAlt("");
      setOpen(false);
    },
    [editor, alt],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const result = await adminUpload<{ url: string }>(file, "blog");
        insertImage(result.url);
      } catch {
        /* upload failed */
      } finally {
        setUploading(false);
      }
    },
    [insertImage],
  );

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
              onKeyDown={(e) => e.key === "Enter" && url && insertImage(url)}
              placeholder="Paste image URL"
              className="flex-1 rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={() => url && insertImage(url)}
              className="rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-500/20"
            >
              Insert
            </button>
          </div>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (optional)"
            className="mt-2 w-full rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
          />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Image Edit Popover (alt + caption)          */
/* ────────────────────────────────────────── */

function ImageEditButton({
  editor,
  open,
  setOpen,
}: {
  editor: Editor;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [imgAlt, setImgAlt] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  const openEdit = useCallback(() => {
    const attrs = editor.getAttributes("image");
    setImgAlt((attrs.alt as string) ?? "");
    setImgTitle((attrs.title as string) ?? "");
    setOpen(true);
  }, [editor, setOpen]);

  const apply = useCallback(() => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        alt: imgAlt || null,
        title: imgTitle || null,
      })
      .run();
    setOpen(false);
  }, [editor, imgAlt, imgTitle, setOpen]);

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn active={open} onClick={openEdit} title="Edit Image">
        <span className="text-[10px]">Alt</span>
      </ToolbarBtn>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-glass-border bg-background p-3 shadow-lg">
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Alt Text
          </label>
          <input
            type="text"
            value={imgAlt}
            onChange={(e) => setImgAlt(e.target.value)}
            placeholder="Describe the image"
            className="mb-2 w-full rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
          />
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Caption
          </label>
          <input
            type="text"
            value={imgTitle}
            onChange={(e) => setImgTitle(e.target.value)}
            placeholder="Image caption (optional)"
            className="mb-2 w-full rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
          />
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-500/20"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* YouTube Embed                               */
/* ────────────────────────────────────────── */

function YouTubeButton({
  editor,
  open,
  setOpen,
}: {
  editor: Editor;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [url, setUrl] = useState("");
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
  }, [open, setOpen]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const embed = useCallback(() => {
    if (!url.trim()) return;
    editor.commands.setYoutubeVideo({ src: url.trim() });
    setUrl("");
    setOpen(false);
  }, [editor, url, setOpen]);

  return (
    <div ref={ref} className="relative">
      <ToolbarBtn
        active={open}
        onClick={() => setOpen(!open)}
        title="Embed YouTube Video"
      >
        <VideoIcon />
      </ToolbarBtn>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-xl border border-glass-border bg-background p-3 shadow-lg">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Paste a YouTube URL
          </p>
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && embed()}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-glass-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={embed}
              className="rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-500/20"
            >
              Embed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Table Insert Button                         */
/* ────────────────────────────────────────── */

function TableButton({ editor }: { editor: Editor }) {
  return (
    <ToolbarBtn
      active={editor.isActive("table")}
      onClick={() =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      }
      title="Insert Table"
    >
      <TableIcon />
    </ToolbarBtn>
  );
}

/* ────────────────────────────────────────── */
/* Table Operations Bar                        */
/* ────────────────────────────────────────── */

function TableOpsBar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-glass-border bg-primary-500/5 px-2 py-1">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-primary-600">
        Table
      </span>
      <SmallBtn onClick={() => editor.chain().focus().addRowBefore().run()}>
        + Row Above
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().addRowAfter().run()}>
        + Row Below
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().addColumnBefore().run()}>
        + Col Left
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>
        + Col Right
      </SmallBtn>
      <span className="mx-0.5 h-4 w-px bg-glass-border" />
      <SmallBtn onClick={() => editor.chain().focus().deleteRow().run()}>
        Del Row
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().deleteColumn().run()}>
        Del Col
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
        Toggle Header
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().mergeCells().run()}>
        Merge
      </SmallBtn>
      <SmallBtn onClick={() => editor.chain().focus().splitCell().run()}>
        Split
      </SmallBtn>
      <span className="mx-0.5 h-4 w-px bg-glass-border" />
      <SmallBtn
        onClick={() => editor.chain().focus().deleteTable().run()}
        danger
      >
        Delete Table
      </SmallBtn>
    </div>
  );
}

function SmallBtn({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────── */
/* Code Language Selector                      */
/* ────────────────────────────────────────── */

function CodeLanguageBar({ editor }: { editor: Editor }) {
  const currentLang =
    (editor.getAttributes("codeBlock").language as string) || "";

  return (
    <div className="flex items-center gap-2 border-b border-glass-border bg-primary-500/5 px-3 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
        Code
      </span>
      <select
        value={currentLang}
        onChange={(e) =>
          editor
            .chain()
            .focus()
            .updateAttributes("codeBlock", { language: e.target.value })
            .run()
        }
        className="rounded-md border border-glass-border bg-transparent px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
      >
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ────────────────────────────────────────── */
/* Toolbar Helpers                             */
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
/* SVG Icons (14×14, stroke-based)             */
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

function VideoIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}
