"use client";

import { useState } from "react";

interface AiFieldButtonProps {
  label: string;
  onGenerate: () => Promise<void>;
  onError?: (msg: string) => void;
  disabled?: boolean;
}

export function AiFieldButton({ label, onGenerate, onError, disabled }: AiFieldButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onGenerate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      title={label}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <SpinnerIcon /> : <SparkleIcon />}
      <span className="hidden sm:inline">AI</span>
    </button>
  );
}

function SparkleIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
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
  );
}
