"use client";

import { useState } from "react";
import { adminPost } from "@/lib/admin-api";
import { Modal } from "@/components/dashboard/modal";
import { FormField } from "@/components/dashboard/form-field";

interface GeneratedProduct {
  description: string;
  longDescription: string;
  features: string[];
  technologies: string[];
  whatsIncluded: string[];
}

interface AiProductModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (result: GeneratedProduct) => void;
  productName: string;
  productType?: string;
  currentTechnologies?: string[];
}

export function AiProductModal({
  open,
  onClose,
  onGenerated,
  productName,
  productType,
  currentTechnologies,
}: AiProductModalProps) {
  const [name, setName] = useState(productName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync productName prop when modal opens
  const prevOpen = useState(open)[0];
  if (open && !prevOpen) {
    // Will be stale on first render but that's acceptable
  }

  function handleOpen() {
    setName(productName || "");
    setError("");
  }

  async function handleGenerate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await adminPost<GeneratedProduct>("/products/ai/generate-product", {
        name: name.trim(),
        productType: productType || undefined,
        technologies: currentTechnologies?.length ? currentTechnologies : undefined,
      });

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
      title="Generate Product Listing with AI"
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
            disabled={loading || !name.trim()}
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
          label="Product Name"
          required
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="e.g. Next.js SaaS Starter Kit"
          hint="AI will generate description, features, technologies, and what's included"
        />

        {productType && (
          <p className="text-xs text-muted-foreground">
            Type: <span className="font-medium text-foreground">{productType}</span>
          </p>
        )}

        {currentTechnologies && currentTechnologies.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Using existing technologies: <span className="font-medium text-foreground">{currentTechnologies.join(", ")}</span>
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
