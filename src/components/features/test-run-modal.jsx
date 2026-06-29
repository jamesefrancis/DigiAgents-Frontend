// filepath: frontend/src/components/features/test-run-modal.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { launchTestRun } from '../../services/workspace-api-service';
import Button from '../common/button';
import InputField from '../common/input-field';
import Modal from '../common/modal';
import StatusBadge from '../common/status-badge';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Test run launcher modal for a single agent, with handoff to Runs.
 */
export default function TestRunModal({ open = false, onClose, agent = null }) {
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);
  const [formValues, setFormValues] = useState({});
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [runId, setRunId] = useState('');

  const requiredInputs = useMemo(() => asArray(agent?.requiredInputs), [agent]);

  useEffect(() => {
    if (open) {
      setFormValues({});
      setLaunchError('');
      setRunId('');
    }

    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [open, agent?.agentId]);

  function updateInput(key, value) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLaunch() {
    if (!agent?.agentId) return;

    setLaunching(true);
    setLaunchError('');
    try {
      const result = await launchTestRun({ agentId: agent.agentId, userInputs: formValues });
      const nextRunId = result?.runId || '';
      setRunId(nextRunId);
      redirectTimerRef.current = window.setTimeout(() => {
        onClose?.();
        navigate(ROUTES.runs);
      }, 900);
    } catch (error) {
      setLaunchError(error.message || 'Failed to launch run');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={agent ? `Test Run · ${agent.name}` : 'Test Run'}
      subtitle="Launch a one-step execution to validate your block."
      maxWidth="max-w-3xl"
    >
      {!runId ? (
        <div className="space-y-4">
          {requiredInputs.length === 0 ? (
            <p className="rounded bg-white/5 p-3 text-sm text-text-dim">This block has no required inputs.</p>
          ) : null}

          {requiredInputs.map((input) => (
            <InputField
              key={input.variable}
              label={input.label || input.variable}
              placeholder={input.variable}
              value={formValues[input.variable] || ''}
              onChange={(event) => updateInput(input.variable, event.target.value)}
              required={input.required !== false}
            />
          ))}

          {launchError ? <p className="text-sm text-fuchsia">{launchError}</p> : null}

          <div className="flex justify-end">
            <Button loading={launching} onClick={handleLaunch}>
              Launch Test Run
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{agent?.name || 'Run'} started</p>
              <p className="text-xs text-text-dim">Opening Runs...</p>
            </div>
            <StatusBadge value="running" />
          </div>
        </div>
      )}
    </Modal>
  );
}
