// filepath: frontend/src/components/common/card.jsx
export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  bodyClassName = ''
}) {
  return (
    <section className={`rounded-2xl border border-card-border bg-card-bg ${className}`}>
      {(title || subtitle) && (
        <header className="border-b border-white/10 px-4 py-3">
          {title ? <h2 className="font-display text-lg font-semibold text-white">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-text-dim">{subtitle}</p> : null}
        </header>
      )}

      <div className={`p-4 ${bodyClassName}`}>{children}</div>

      {footer ? <footer className="border-t border-white/10 px-4 py-3">{footer}</footer> : null}
    </section>
  );
}
