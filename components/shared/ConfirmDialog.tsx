"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative card max-w-md w-full p-5 sm:p-6 rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg sm:text-xl mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="text-xs sm:text-sm mb-5 sm:mb-6" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-outline px-4 py-2.5 text-xs text-center w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary px-4 py-2.5 text-xs text-center w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={
              destructive
                ? { background: "var(--error)", color: "#fff" }
                : undefined
            }
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{loading ? "Deleting..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
