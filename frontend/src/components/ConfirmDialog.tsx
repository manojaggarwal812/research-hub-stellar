"use client";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <div className="rh-panel w-full max-w-md p-6">
        <h2 className="font-display text-xl">{title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="rh-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="rh-btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
