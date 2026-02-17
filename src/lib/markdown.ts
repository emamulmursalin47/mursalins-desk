/**
 * Lightweight markdown-to-HTML converter.
 * Handles the subset used in blog content: headings, paragraphs, bold, italic,
 * inline code, code blocks, links, lists, blockquotes, images, and hr.
 */
export function markdownToHtml(md: string): string {
  let html = md;

  // Fenced code blocks (```lang ... ```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_m, lang, code) =>
      `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code.trim())}</code></pre>`,
  );

  // Blockquotes (> lines)
  html = html.replace(
    /^((?:>.*\n?)+)/gm,
    (_m, block: string) => {
      const inner = block.replace(/^>\s?/gm, "").trim();
      return `<blockquote><p>${inner}</p></blockquote>\n`;
    },
  );

  // Headings (# to ######)
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, "<hr>");

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(
    /^((?:[-*+]\s+.+\n?)+)/gm,
    (_m, block: string) => {
      const items = block
        .split(/\n/)
        .filter((l) => l.trim())
        .map((l) => `<li>${l.replace(/^[-*+]\s+/, "")}</li>`)
        .join("\n");
      return `<ul>\n${items}\n</ul>\n`;
    },
  );

  // Ordered lists
  html = html.replace(
    /^((?:\d+\.\s+.+\n?)+)/gm,
    (_m, block: string) => {
      const items = block
        .split(/\n/)
        .filter((l) => l.trim())
        .map((l) => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`)
        .join("\n");
      return `<ol>\n${items}\n</ol>\n`;
    },
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Wrap remaining bare lines in <p> tags
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap blocks that are already HTML elements
      if (/^<(?:h[1-6]|p|ul|ol|li|pre|blockquote|hr|div|table|img)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n\n");

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
