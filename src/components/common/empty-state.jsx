// filepath: frontend/src/components/common/empty-state.jsx
import Button from './button';

export default function EmptyState({ icon = '•', title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card-bg p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/5 text-xl">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1 text-sm text-text-dim">{description}</p> : null}
      {actionLabel ? (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
