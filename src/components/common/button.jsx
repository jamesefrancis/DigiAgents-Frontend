// filepath: frontend/src/components/common/button.jsx
const variantClasses = {
  primary:
    'border-yellow/45 bg-yellow text-bg-deep hover:bg-[#ffe06f] hover:border-yellow/70 disabled:border-yellow/25 disabled:bg-yellow/45',
  secondary:
    'border-card-border bg-white/5 text-white hover:bg-white/10 hover:border-white/20 disabled:border-card-border disabled:bg-white/5',
  ghost:
    'border-white/10 bg-transparent text-text-dim hover:border-white/25 hover:bg-white/[0.04] hover:text-white disabled:border-white/10 disabled:text-text-muted',
  danger:
    'border-fuchsia/40 bg-fuchsia/15 text-fuchsia hover:border-fuchsia/55 hover:bg-fuchsia/25 disabled:border-fuchsia/20 disabled:bg-fuchsia/10'
};

const sizeClasses = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs'
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const tone = variantClasses[variant] || variantClasses.primary;
  const scale = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition disabled:cursor-not-allowed ${tone} ${scale} ${className}`}
      {...props}
    >
      {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      <span>{children}</span>
    </button>
  );
}
