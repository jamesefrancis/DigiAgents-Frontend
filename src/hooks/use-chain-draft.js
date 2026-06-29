// filepath: frontend/src/hooks/use-chain-draft.js
import { useEffect, useState } from 'react';

let draftState = [];
const listeners = new Set();

function isValidBlock(block) {
  return Boolean(block?.agentId);
}

function normalizeDraft(value) {
  return Array.isArray(value) ? value.filter(isValidBlock) : [];
}

function emit() {
  draftState = normalizeDraft(draftState);
  listeners.forEach((listener) => listener(draftState));
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setDraft(next) {
  draftState = normalizeDraft(next);
  emit();
}

export function useChainDraft() {
  const [draft, setLocalDraft] = useState(normalizeDraft(draftState));

  useEffect(() => subscribe(setLocalDraft), []);

  function addBlock(block) {
    if (!isValidBlock(block)) return;
    if (draftState.some((item) => item.agentId === block.agentId)) return;
    setDraft([...draftState, block]);
  }

  function removeBlock(index) {
    setDraft(draftState.filter((_, idx) => idx !== index));
  }

  function moveBlock(index, direction) {
    const next = [...draftState];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setDraft(next);
  }

  function updateOverrides(index, overrides) {
    setDraft(draftState.map((item, idx) => (idx === index ? { ...item, overrides } : item)));
  }

  function clearDraft() {
    setDraft([]);
  }

  const safeDraft = normalizeDraft(draft);

  return {
    draft: safeDraft,
    addBlock,
    removeBlock,
    moveBlock,
    updateOverrides,
    clearDraft,
    count: safeDraft.length
  };
}
