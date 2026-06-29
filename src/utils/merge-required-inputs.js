// filepath: frontend/src/utils/merge-required-inputs.js
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function mergeRequiredInputs(steps = [], explicitInputs = []) {
  const map = new Map();

  const addInput = (input, sourceId = '') => {
    if (!input?.variable) return;

    if (!map.has(input.variable)) {
      map.set(input.variable, {
        variable: input.variable,
        label: input.label || input.variable,
        type: input.type || 'text',
        required: input.required !== false,
        fromAgents: sourceId ? [sourceId] : []
      });
      return;
    }

    const existing = map.get(input.variable);
    existing.required = existing.required || input.required !== false;
    if (sourceId && !existing.fromAgents.includes(sourceId)) {
      existing.fromAgents.push(sourceId);
    }
  };

  asArray(explicitInputs).forEach((input) => addInput(input));

  asArray(steps).forEach((step) => {
    const sourceId = step?.agentId || step?.agentName || '';
    const requiredInputs = step?.requiredInputs || step?.block?.requiredInputs || [];
    asArray(requiredInputs).forEach((input) => addInput(input, sourceId));
  });

  return Array.from(map.values());
}
