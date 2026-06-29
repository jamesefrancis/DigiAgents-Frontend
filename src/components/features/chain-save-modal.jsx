// filepath: frontend/src/components/features/chain-save-modal.jsx
import { useEffect, useState } from 'react';
import { saveChain } from '../../services/workspace-api-service';
import Button from '../common/button';
import InputField from '../common/input-field';
import Modal from '../common/modal';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isValidStep(step) {
  return Boolean(step?.agentId);
}

/**
 * Chain creation/edit modal with step ordering controls.
 */
export default function ChainSaveModal({
  open = false,
  onClose,
  steps = [],
  initialChain = null,
  onSaved,
  onRemoveStep,
  onMoveStep
}) {
  const safeSteps = asArray(steps).filter(isValidStep);
  const [name, setName] = useState(initialChain?.name || '');
  const [description, setDescription] = useState(initialChain?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const title = initialChain?.chainId ? 'Save Chain' : 'Save Agent Draft';

  useEffect(() => {
    if (open && !safeSteps.length) {
      onClose?.();
    }
  }, [open, safeSteps.length, onClose]);

  useEffect(() => {
    if (open) {
      setName(initialChain?.name || '');
      setDescription(initialChain?.description || '');
      setError('');
    }
  }, [open, initialChain]);

  async function handleSave() {
    if (!name.trim()) {
      setError('Chain name is required.');
      return;
    }
    if (!safeSteps.length) {
      setError('Add at least one block to save chain.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...(initialChain?.chainId ? { chainId: initialChain.chainId } : {}),
        name: name.trim(),
        description: description.trim(),
        steps: safeSteps.map((step) => ({ agentId: step.agentId, overrides: step.overrides || null }))
      };
      const result = await saveChain(payload);
      onSaved?.(result);
      onClose?.();
    } catch (saveError) {
      setError(saveError.message || 'Failed to save chain');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open && safeSteps.length > 0} onClose={onClose} title={title} subtitle="Reorder and persist your multi-step workflow.">
      <div className="space-y-4">
        <InputField label="Chain Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <InputField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          textarea
          rows={3}
        />

        <div className="space-y-2">
          {safeSteps.map((step, index) => (
            <div key={`${step.agentId}-${index}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-yellow/15 font-mono text-[11px] text-yellow">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{step.name || step.agentName || step.agentId}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded border border-white/10 px-2 py-1 text-xs text-text-dim" onClick={() => onMoveStep?.(index, 'up')}>
                  Up
                </button>
                <button type="button" className="rounded border border-white/10 px-2 py-1 text-xs text-text-dim" onClick={() => onMoveStep?.(index, 'down')}>
                  Down
                </button>
                <button type="button" className="rounded border border-fuchsia/30 px-2 py-1 text-xs text-fuchsia" onClick={() => onRemoveStep?.(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-fuchsia">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!safeSteps.length} onClick={handleSave}>
            Save Chain
          </Button>
        </div>
      </div>
    </Modal>
  );
}
