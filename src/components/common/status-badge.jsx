// filepath: frontend/src/components/common/status-badge.jsx
const map = {
  running: 'bg-yellow/15 text-yellow border-yellow/35',
  completed: 'bg-mint/15 text-mint border-mint/35',
  failed: 'bg-fuchsia/15 text-fuchsia border-fuchsia/35',
  pending: 'bg-white/10 text-text-dim border-white/15',
  dfy: 'bg-mint/15 text-mint border-mint/35',
  custom: 'bg-violet/20 text-[#c6b6ff] border-violet/35',
  cloned: 'bg-fuchsia/15 text-fuchsia border-fuchsia/35',
  chain: 'bg-amber/15 text-amber border-amber/35',
  block_test: 'bg-yellow/15 text-yellow border-yellow/35'
};

export default function StatusBadge({ value = 'pending', className = '' }) {
  const key = String(value).toLowerCase();
  const tone = map[key] || map.pending;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${tone} ${className}`}
    >
      {String(value).replace(/_/g, ' ')}
    </span>
  );
}
