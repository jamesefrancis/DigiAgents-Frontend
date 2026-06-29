// filepath: frontend/src/components/features/runs-table.jsx
import Button from '../common/button';
import StatusBadge from '../common/status-badge';
import { formatDateTime, formatDurationSeconds } from '../../utils/date-time';

const statusTabs = ['all', 'running', 'completed', 'failed'];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getRunTitle(run) {
  return (
    run.chainName ||
    run.agentName ||
    asArray(run.stepResults)[0]?.agentName ||
    (run.type === 'block_test' ? 'Block test run' : 'Run')
  );
}

function getRunDurationSeconds(run, nowMs) {
  const status = String(run.status || '').toLowerCase();
  if (status === 'running' && run.startedAt) {
    const startedAtMs = new Date(run.startedAt).getTime();
    if (!Number.isNaN(startedAtMs)) {
      return Math.max(0, Math.round((nowMs - startedAtMs) / 1000));
    }
  }

  return Number(run.totalDuration || 0);
}

/**
 * Runs table with status filter and selectable rows.
 */
export default function RunsTable({
  runs = [],
  statusFilter = 'all',
  onStatusFilterChange,
  onSelectRun,
  onRefresh,
  refreshing = false,
  selectedRunId,
  nowMs = Date.now()
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange?.(status)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                statusFilter === status ? 'bg-yellow/20 text-yellow' : 'bg-white/5 text-text-dim'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onRefresh} loading={refreshing}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card-bg">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.05em] text-text-muted">
            <tr>
              <th className="px-4 py-3">Run</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.runId}
                className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.03] ${selectedRunId === run.runId ? 'bg-white/[0.04]' : ''}`}
                onClick={() => onSelectRun?.(run)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{getRunTitle(run)}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-text-muted">{run.runId}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge value={run.type} /></td>
                <td className="px-4 py-3"><StatusBadge value={run.status} /></td>
                <td className="px-4 py-3 text-text-dim">{formatDurationSeconds(getRunDurationSeconds(run, nowMs))}</td>
                <td className="px-4 py-3 text-text-dim">{formatDateTime(run.startedAt)}</td>
              </tr>
            ))}
            {!runs.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-dim">
                  No runs found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
