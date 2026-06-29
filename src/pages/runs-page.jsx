// src/pages/runs-page.jsx
import { useEffect, useMemo, useState } from 'react';
import RunTimelineDrawer from '../components/features/run-timeline-drawer';
import RunsTable from '../components/features/runs-table';
import Button from '../components/common/button';
import Card from '../components/common/card';
import ErrorMessage from '../components/common/error-message';
import LoadingSpinner from '../components/common/loading-spinner';
import Modal from '../components/common/modal';
import { listRuns } from '../services/workspace-api-service';
import { mockRuns } from '../data/mock-data';

export default function RunsPage() {
  const [runs, setRuns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [nowMs, setNowMs] = useState(Date.now());

  const [selectedRun, setSelectedRun] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const stats = useMemo(() => {
    const summary = { running: 0, completed: 0, failed: 0 };
    runs.forEach((run) => {
      const key = String(run.status || '').toLowerCase();
      if (summary[key] !== undefined) {
        summary[key] += 1;
      }
    });
    return summary;
  }, [runs]);

  async function loadRuns(nextStatus = statusFilter, options = {}) {
    const showSpinner = options.showSpinner !== false;
    if (showSpinner) {
      setLoading(true);
    }
    setError('');

    try {
      const payload = nextStatus === 'all' ? {} : { status: nextStatus };
      const data = await listRuns(payload);
      setRuns(Array.isArray(data) ? data : []);
      setNowMs(Date.now());
    } catch (loadError) {
      console.error('[RunsPage] loadRuns failed:', loadError);
      const filtered = nextStatus === 'all' ? mockRuns : mockRuns.filter((run) => run.status === nextStatus);
      setRuns(filtered);
      setNowMs(Date.now());
      setError('Live API unavailable. Showing realistic mock run history.');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadRuns(statusFilter, { showSpinner: false });
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRuns(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadRuns(statusFilter, { showSpinner: false });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Runs</h1>
          <p className="mt-1 text-sm text-text-dim">Track execution progress, step outcomes, and output artifacts.</p>
        </div>
        <Button variant="secondary" onClick={() => setHelpOpen(true)}>
          Interpreting statuses
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="p-5">
          <p className="font-mono text-[11px] uppercase text-text-muted">Running</p>
          <p className="mt-1 font-display text-4xl text-yellow">{stats.running}</p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[11px] uppercase text-text-muted">Completed</p>
          <p className="mt-1 font-display text-4xl text-mint">{stats.completed}</p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[11px] uppercase text-text-muted">Failed</p>
          <p className="mt-1 font-display text-4xl text-fuchsia">{stats.failed}</p>
        </Card>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner label="Loading runs..." /> : null}

      {!loading ? (
        <RunsTable
          runs={runs}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onSelectRun={(run) => setSelectedRun(run)}
          selectedRunId={selectedRun?.runId}
          nowMs={nowMs}
        />
      ) : null}

      <RunTimelineDrawer
        open={Boolean(selectedRun)}
        runData={selectedRun}
        runId={selectedRun?.runId || ''}
        onClose={() => setSelectedRun(null)}
      />

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Run status legend"
        subtitle="Use this to quickly diagnose what needs attention"
      >
        <div className="space-y-2 text-sm text-text-dim">
          <p><strong className="text-yellow">Running:</strong> executor currently processing one or more steps.</p>
          <p><strong className="text-mint">Completed:</strong> all steps finished and outputs are available.</p>
          <p><strong className="text-fuchsia">Failed:</strong> a step exited with error; inspect timeline for failure summary.</p>
          <div className="pt-2 text-right">
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
