// filepath: frontend/src/components/features/agent-editor-modal.jsx
import { useEffect, useMemo, useState } from 'react';
import Button from '../common/button';
import InputField from '../common/input-field';
import Modal from '../common/modal';
import { generateAgentSkillDraft } from '../../services/workspace-api-service';

const emptyInput = { variable: '', label: '', type: 'text', required: true };

function getInitialState(agent) {
  return {
    name: agent?.name || '',
    description: agent?.description || '',
    category: agent?.category || 'general',
    goal: agent?.instruction?.goal || '',
    outputRequirements: agent?.instruction?.outputRequirements || '',
    additionalContext: agent?.instruction?.additionalContext || '',
    maxTokens: agent?.maxTokens || 32000,
    basicMcpSkills: agent?.basicMcpSkills || [],
    externalMcps: agent?.externalMcps || [],
    requiredInputs: agent?.requiredInputs?.length ? agent.requiredInputs : [emptyInput]
  };
}

function mergeGeneratedDraft(previousForm, draft) {
  const instruction = draft?.instruction || {};
  const requiredInputs = Array.isArray(draft?.requiredInputs) && draft.requiredInputs.length ? draft.requiredInputs : previousForm.requiredInputs;

  return {
    ...previousForm,
    category: draft?.category || previousForm.category,
    goal: instruction.goal || previousForm.goal,
    outputRequirements: instruction.outputRequirements || previousForm.outputRequirements,
    additionalContext: instruction.additionalContext || previousForm.additionalContext,
    maxTokens: draft?.maxTokens || previousForm.maxTokens,
    basicMcpSkills: Array.isArray(draft?.basicMcpSkills) ? draft.basicMcpSkills : previousForm.basicMcpSkills,
    externalMcps: Array.isArray(draft?.externalMcps) ? draft.externalMcps : previousForm.externalMcps,
    requiredInputs
  };
}

/**
 * Modal editor for creating/updating a custom agent block.
 */
export default function AgentEditorModal({ open = false, agent = null, onClose, onSave, isSaving = false }) {
  const [form, setForm] = useState(getInitialState(agent));
  const [error, setError] = useState('');
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(getInitialState(agent));
      setError('');
      setIsGeneratingSkill(false);
    }
  }, [open, agent]);

  const title = useMemo(() => (agent ? 'Edit Agent' : 'Create Agent'), [agent]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateInput(index, key, value) {
    setForm((prev) => ({
      ...prev,
      requiredInputs: prev.requiredInputs.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    }));
  }

  async function handleGenerateSkill() {
    if (!form.name.trim() || !form.description.trim()) {
      setError('Enter a name and description before making a skill.');
      return;
    }

    setError('');
    setIsGeneratingSkill(true);

    try {
      const draft = await generateAgentSkillDraft({
        name: form.name.trim(),
        description: form.description.trim()
      });
      setForm((prev) => mergeGeneratedDraft(prev, draft));
    } catch (generateError) {
      setError(generateError.message || 'Could not generate skill fields.');
    } finally {
      setIsGeneratingSkill(false);
    }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.description.trim() || !form.goal.trim()) {
      setError('Name, description, and goal are required.');
      return;
    }

    const payload = {
      ...(agent ? { agentId: agent.agentId } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      source: agent?.source || 'custom',
      instruction: {
        goal: form.goal.trim(),
        outputRequirements: form.outputRequirements.trim(),
        additionalContext: form.additionalContext.trim()
      },
      basicMcpSkills: form.basicMcpSkills,
      externalMcps: form.externalMcps,
      maxTokens: Number(form.maxTokens) || 32000,
      requiredInputs: form.requiredInputs.filter((item) => item.variable.trim())
    };

    setError('');
    await onSave?.(payload);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle="Define prompt package, tools, and inputs.">
      <div className="space-y-4">
        {error ? <p className="rounded bg-fuchsia/15 p-2 text-sm text-fuchsia">{error}</p> : null}

        <InputField label="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        <InputField
          label="Description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          textarea
          rows={3}
          required
        />
        <div className="flex flex-col gap-3 rounded-lg border border-yellow/30 bg-yellow/10 p-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-text-dim">
            Optional: Enter a quick title and description and hit MAKE SKILL to have GPT-5.5 create your skill.
          </p>
          <Button
            size="sm"
            loading={isGeneratingSkill}
            disabled={isSaving}
            className="min-w-[150px] shrink-0 whitespace-nowrap px-5"
            onClick={handleGenerateSkill}
          >
            MAKE SKILL
          </Button>
        </div>
        <InputField label="Goal" value={form.goal} onChange={(e) => updateField('goal', e.target.value)} textarea required />
        <InputField
          label="Output Requirements"
          value={form.outputRequirements}
          onChange={(e) => updateField('outputRequirements', e.target.value)}
          textarea
          rows={3}
        />
        <InputField
          label="Additional Context"
          value={form.additionalContext}
          onChange={(e) => updateField('additionalContext', e.target.value)}
          textarea
          rows={3}
        />
        <InputField
          label="Max Tokens"
          type="number"
          value={form.maxTokens}
          onChange={(e) => updateField('maxTokens', e.target.value)}
        />

        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">Required Inputs</p>
          <div className="space-y-2">
            {form.requiredInputs.map((input, index) => (
              <div key={`${index}-${input.variable}`} className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-3">
                <InputField
                  label="Variable"
                  value={input.variable}
                  onChange={(e) => updateInput(index, 'variable', e.target.value)}
                />
                <InputField label="Label" value={input.label} onChange={(e) => updateInput(index, 'label', e.target.value)} />
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-text-dim">
                    <input
                      type="checkbox"
                      checked={input.required !== false}
                      onChange={(e) => updateInput(index, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    className="ml-auto rounded border border-white/15 px-2 py-1 text-xs text-text-dim hover:text-white"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        requiredInputs: prev.requiredInputs.filter((_, idx) => idx !== index)
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 rounded border border-white/15 px-3 py-1 text-xs text-text-dim hover:text-white"
            onClick={() => setForm((prev) => ({ ...prev, requiredInputs: [...prev.requiredInputs, emptyInput] }))}
          >
            + Add Input
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isSaving} onClick={handleSubmit}>
            {agent ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
