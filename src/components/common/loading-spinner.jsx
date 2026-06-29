// filepath: frontend/src/components/common/loading-spinner.jsx
export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-text-dim">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow/70 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
