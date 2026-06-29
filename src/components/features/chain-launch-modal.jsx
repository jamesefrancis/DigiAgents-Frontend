// filepath: frontend/src/components/features/chain-launch-modal.jsx
import { useMemo, useState } from 'react';
import { launchChainRun } from '../../services/workspace-api-service';
import { useRunPoller } from '../../hooks/use-run-poller';
import { mergeRequiredInputs } from '../../utils/merge-required-inputs';
import Button from '../common/button';
import InputField from '../common/input-field';
import Modal from '../common/modal';
import StatusBadge from '../common/status-badge';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Chain launch modal that merges required inputs and shows live run status.
 */
export default function ChainLaunchModal({ open = false, onClose, chain = null }) {
  const mergedInputs = useMemo(() => mergeRequiredInputs(chain?.steps, chain?.requiredInputs), [chain]);
  const [values, setValues] = useState({});
  const [runId, setRunId] = useState('');
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');

  const { run } = useRunPoller({ runId, enabled: Boolean(runId) && open });

  async function handleLaunch() {
    if (!chain?.chainId) return;

    setLaunching(true);
    setError('');
    try {
      const response = await launchChainRun({ chainId: chain.chainId, userInputs: values });
      setRunId(response?.runId || '');
    } catch (launchError) {
      setError(launchError.message || 'Failed to launch chain');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={chain ? `Launch · ${chain.name}` : 'Launch Chain'}>
      {!runId ? (
        <div className="space-y-4">
          {mergedInputs.map((input) => (
            <InputField
              key={input.variable}
              label={input.label || input.variable}
              value={values[input.variable] || ''}
              onChange={(event) => setValues((prev) => ({ ...prev, [input.variable]: event.target.value }))}
              required={input.required !== false}
            />
          ))}
          {error ? <p className="text-sm text-fuchsia">{error}</p> : null}
          <div className="flex justify-end">
            <Button loading={launching} onClick={handleLaunch}>
              Launch Chain
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-text-dim">Run ID: {runId}</p>
            <StatusBadge value={run?.status || 'running'} />
          </div>
          {asArray(run?.stepResults).map((step) => (
            <div key={step.stepNumber} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">{step.stepNumber}. {step.agentName || step.agentId || 'Step'}</p>
                <StatusBadge value={step.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
