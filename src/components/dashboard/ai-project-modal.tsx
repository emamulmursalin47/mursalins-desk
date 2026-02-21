"use client";

import { useState } from "react";
import { adminPost } from "@/lib/admin-api";
import { Modal } from "@/components/dashboard/modal";
import { FormField } from "@/components/dashboard/form-field";

interface GeneratedProject {
  description: string;
  tagline: string;
  challenge: string;
  approach: string;
  features: string[];
  technologies: string[];
  metrics: { label: string; value: string }[];
  challenges: { challenge: string; solution: string }[];
}

interface AiProjectModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (result: GeneratedProject) => void;
  projectTitle: string;
  currentTechnologies?: string[];
  clientName?: string;
  clientIndustry?: string;
}

export function AiProjectModal({
  open,
  onClose,
  onGenerated,
  projectTitle,
  currentTechnologies,
  clientName,
  clientIndustry,
}: AiProjectModalProps) {
  const [title, setTitle] = useState(projectTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await adminPost<GeneratedProject>(
        "/projects/ai/generate-project",
        {
          title: title.trim(),
          technologies: currentTechnologies?.length
            ? currentTechnologies
            : undefined,
          clientName: clientName || undefined,
          clientIndustry: clientIndustry || undefined,
        },
      );

      onGenerated(result);
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
      title="Generate Project Case Study with AI"
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
            disabled={loading || !title.trim()}
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
          label="Project Title"
          required
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="e.g. E-Commerce Platform Rebuild"
          hint="AI will generate description, challenge, approach, features, technologies, metrics, and challenges"
        />

        {clientName && (
          <p className="text-xs text-muted-foreground">
            Client:{" "}
            <span className="font-medium text-foreground">{clientName}</span>
          </p>
        )}

        {currentTechnologies && currentTechnologies.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Using existing technologies:{" "}
            <span className="font-medium text-foreground">
              {currentTechnologies.join(", ")}
            </span>
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-xs text-muted-foreground">
            This may take 10-20 seconds...
          </p>
        )}
      </div>
    </Modal>
  );
}
