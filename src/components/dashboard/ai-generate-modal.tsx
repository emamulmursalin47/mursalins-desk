"use client";

import { useState } from "react";
import { adminPost } from "@/lib/admin-api";
import { Modal } from "@/components/dashboard/modal";
import { FormField } from "@/components/dashboard/form-field";

interface GeneratedPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  suggestedCategoryIds: string[];
  suggestedTagIds: string[];
}

interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (result: GeneratedPost) => void;
}

export function AiGenerateModal({ open, onClose, onGenerated }: AiGenerateModalProps) {
  const [topic, setTopic] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const result = await adminPost<GeneratedPost>("/blog/ai/generate-post", {
        topic: topic.trim(),
        keywords: keywords.length ? keywords : undefined,
        tone,
        length,
      });

      onGenerated(result);
      setTopic("");
      setKeywordsInput("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Blog Post with AI"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Topic"
          required
          value={topic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
          placeholder="e.g. Building REST APIs with NestJS"
        />

        <FormField
          label="Target Keywords"
          value={keywordsInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeywordsInput(e.target.value)}
          placeholder="nestjs, rest api, typescript (comma-separated)"
          hint="Leave empty to let AI derive keywords from the topic"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            as="select"
            label="Tone"
            value={tone}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="technical">Technical</option>
            <option value="conversational">Conversational</option>
          </FormField>

          <FormField
            as="select"
            label="Length"
            value={length}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLength(e.target.value)}
          >
            <option value="short">Short (~800 words)</option>
            <option value="medium">Medium (~1500 words)</option>
            <option value="long">Long (~2500 words)</option>
          </FormField>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-xs text-muted-foreground">
            This may take 10-30 seconds depending on the length...
          </p>
        )}
      </div>
    </Modal>
  );
}
