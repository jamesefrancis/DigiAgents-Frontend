// filepath: frontend/src/components/common/input-field.jsx
export default function InputField({
  label,
  helper,
  error,
  textarea = false,
  rows = 4,
  className = '',
  required = false,
  ...props
}) {
  const baseClass =
    'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow/45';

  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {textarea ? (
        <textarea rows={rows} className={`${baseClass} resize-y`} {...props} />
      ) : (
        <input className={baseClass} {...props} />
      )}

      {helper ? <p className="text-xs text-text-muted">{helper}</p> : null}
      {error ? <p className="text-xs text-fuchsia">{error}</p> : null}
    </div>
  );
}
