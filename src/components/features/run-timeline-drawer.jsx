// filepath: frontend/src/components/features/run-timeline-drawer.jsx
import { useEffect, useMemo, useState } from 'react';
import { useRunPoller } from '../../hooks/use-run-poller';
import { formatDateTime, formatDurationSeconds } from '../../utils/date-time';
import StatusBadge from '../common/status-badge';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getRunTitle(run) {
  return (
    run?.chainName ||
    run?.agentName ||
    asArray(run?.stepResults)[0]?.agentName ||
    (run?.type === 'block_test' ? 'Block test run' : 'Run Timeline')
  );
}

function getRunDurationSeconds(run, nowMs) {
  const status = String(run?.status || '').toLowerCase();
  if (status === 'running' && run?.startedAt) {
    const startedAtMs = new Date(run.startedAt).getTime();
    if (!Number.isNaN(startedAtMs)) {
      return Math.max(0, Math.round((nowMs - startedAtMs) / 1000));
    }
  }

  return Number(run?.totalDuration || 0);
}

function getFilename(file) {
  const raw = file?.filename || file?.name || file?.url || 'output-file';
  try {
    return decodeURIComponent(String(raw).split('/').pop() || raw);
  } catch (error) {
    return String(raw).split('/').pop() || raw;
  }
}

function getExtension(filename) {
  const normalized = String(filename || '').toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');
  return dotIndex >= 0 ? normalized.slice(dotIndex) : '';
}

function isImageFile(file) {
  const extension = getExtension(getFilename(file));
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(extension);
}

function getFileLabel(file) {
  const extension = getExtension(getFilename(file)).replace('.', '').toUpperCase();
  if (!extension) return 'FILE';
  if (extension.length > 5) return extension.slice(0, 5);
  return extension;
}

function FilePreviewCard({ file }) {
  const filename = getFilename(file);
  const image = isImageFile(file);
  const href = file?.url || '#';

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={filename}
      className="group min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-2 hover:border-mint/50 hover:bg-mint/10"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-bg-deep/60">
        {image ? (
          <img src={href} alt={filename} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <div className="relative flex h-16 w-12 items-center justify-center rounded-sm border border-white/25 bg-white/10 text-[10px] font-semibold tracking-[0.08em] text-text-dim group-hover:text-mint">
            <span className="absolute right-0 top-0 h-3 w-3 border-b border-l border-white/25 bg-bg-navy" />
            {getFileLabel(file)}
          </div>
        )}
      </div>
      <p className="mt-2 min-h-[2.5rem] break-words text-center text-xs leading-snug text-text-dim group-hover:text-white">
        {filename}
      </p>
    </a>
  );
}

function OutputFilesGrid({ files = [], title = 'Output files' }) {
  const outputFiles = asArray(files);

  if (!outputFiles.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-mint/20 bg-mint/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-mint">{title}</p>
        <p className="text-xs text-text-muted">{outputFiles.length} files</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {outputFiles.map((file, index) => (
          <FilePreviewCard key={`${file.url || file.filename || 'file'}-${index}`} file={file} />
        ))}
      </div>
    </section>
  );
}

/**
 * Wide modal for detailed run timeline and output previews.
 */
export default function RunTimelineDrawer({ open = false, onClose, runId = '', runData = null }) {
  const { run, isLoading, error } = useRunPoller({ runId, enabled: open && Boolean(runId) });
  const [nowMs, setNowMs] = useState(Date.now());
  const targetRun = run || runData;
  const stepResults = asArray(targetRun?.stepResults);
  const finalOutputFiles = asArray(targetRun?.finalOutputFiles);
  const runTitle = targetRun ? getRunTitle(targetRun) : 'Run Timeline';
  const hasAnyStepFiles = useMemo(
    () => stepResults.some((step) => asArray(step.outputFiles).length),
    [stepResults]
  );

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

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
        aria-label="Close run details"
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[80vh] w-[min(94vw,1200px)] flex-col overflow-hidden rounded-2xl border border-card-border bg-bg-navy/95 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-semibold text-white">{runTitle}</h3>
            <p className="truncate text-xs text-text-dim">{targetRun?.runId || runId || 'No run selected'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-white/15 px-4 py-2 text-sm text-text-dim hover:text-white">
            Close
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {!targetRun ? <p className="text-sm text-text-dim">Select a run to inspect step details.</p> : null}
          {isLoading ? <p className="text-sm text-text-dim">Loading full run details...</p> : null}
          {error ? <p className="rounded bg-fuchsia/15 p-2 text-sm text-fuchsia">{error}</p> : null}

          {targetRun ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-medium text-white">{runTitle}</p>
                <StatusBadge value={targetRun.status} />
              </div>
              <p className="text-text-dim">Started: {formatDateTime(targetRun.startedAt)}</p>
              <p className="text-text-dim">Duration: {formatDurationSeconds(getRunDurationSeconds(targetRun, nowMs))}</p>
              {targetRun.failureSummary ? <p className="mt-2 text-fuchsia">{targetRun.failureSummary}</p> : null}
            </div>
          ) : null}

          <OutputFilesGrid files={finalOutputFiles} title="Final output files" />

          {stepResults.map((step) => {
            const outputFiles = asArray(step.outputFiles);

            return (
              <section key={step.stepNumber} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">Step {step.stepNumber}: {step.agentName}</p>
                  <StatusBadge value={step.status} />
                </div>
                {step.responseText ? <p className="mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-bg-deep/50 p-3 text-xs text-text-dim">{step.responseText}</p> : null}
                {step.failure?.message ? <p className="mb-3 text-xs text-fuchsia">{step.failure.message}</p> : null}
                <OutputFilesGrid files={outputFiles} title="Step output files" />
              </section>
            );
          })}

          {targetRun?.status === 'completed' && !finalOutputFiles.length && !hasAnyStepFiles ? (
            <p className="rounded bg-white/5 p-3 text-sm text-text-dim">
              This run completed, but no output files are attached to the run detail yet.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
