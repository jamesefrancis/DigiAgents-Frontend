// filepath: frontend/src/components/common/modal.jsx
import { useEffect } from 'react';

export default function Modal({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl'
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />

      <div className={`relative z-10 w-full ${maxWidth} rounded-2xl border border-card-border bg-bg-navy shadow-2xl`}>
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            {title ? <h3 className="font-display text-xl font-semibold text-white">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-text-dim">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-md border border-white/15 px-2 py-1 text-sm text-text-dim hover:text-white"
            onClick={() => onClose?.()}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
