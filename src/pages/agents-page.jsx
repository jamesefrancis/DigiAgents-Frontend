// src/pages/agents-page.jsx
import { useEffect, useMemo, useState } from 'react';
import AgentEditorModal from '../components/features/agent-editor-modal';
import AgentsGrid from '../components/features/agents-grid';
import ChainBuilderPill from '../components/features/chain-builder-pill';
import ChainSaveModal from '../components/features/chain-save-modal';
import TestRunModal from '../components/features/test-run-modal';
import Button from '../components/common/button';
import Card from '../components/common/card';
import CatalogLoadingSkeleton from '../components/common/catalog-loading-skeleton';
import ErrorMessage from '../components/common/error-message';
import Modal from '../components/common/modal';
import { useChainDraft } from '../hooks/use-chain-draft';
import { cloneAgent, listAgents, listDfyAgents, saveAgent } from '../services/workspace-api-service';
import { mockAgents } from '../data/mock-data';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mergeAgentCatalog(userAgents, dfyAgents) {
  const uniqueById = new Map();
  [...asArray(userAgents), ...asArray(dfyAgents)].forEach((agent) => {
    if (agent?.agentId && !uniqueById.has(agent.agentId)) {
      uniqueById.set(agent.agentId, agent);
    }
  });
  return Array.from(uniqueById.values());
}

function buildCustomClonePayload(agent) {
  const sourceName = agent.name || 'Untitled Agent';
  const instruction = agent.instruction || {};

  return {
    name: `${sourceName} Copy`,
    description: agent.description || 'Cloned custom agent.',
    category: agent.category || 'general',
    source: 'cloned',
    clonedFrom: agent.agentId,
    instruction: {
      goal: instruction.goal || agent.description || sourceName,
      outputRequirements: instruction.outputRequirements || '',
      additionalContext: instruction.additionalContext || ''
    },
    basicMcpSkills: asArray(agent.basicMcpSkills),
    externalMcps: asArray(agent.externalMcps),
    mcpPromptHints: agent.mcpPromptHints || '',
    maxTokens: Number(agent.maxTokens) > 0 ? Number(agent.maxTokens) : 32000,
    requiredInputs: asArray(agent.requiredInputs),
    estimatedCost: Number(agent.estimatedCost) || 0,
    estimatedTimeMinutes: Number(agent.estimatedTimeMinutes) || 0,
    tags: asArray(agent.tags),
    tier: 'base'
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);
  const [cloningAgentId, setCloningAgentId] = useState('');
  const [error, setError] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [testingAgent, setTestingAgent] = useState(null);
  const [chainSaveOpen, setChainSaveOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { draft, addBlock, removeBlock, moveBlock, clearDraft } = useChainDraft();
  const draftSteps = asArray(draft);
  const initialLoading = loading && agents.length === 0;

  const sourceCounts = useMemo(() => {
    return agents.reduce(
      (acc, agent) => {
        const src = String(agent.source || 'custom').toLowerCase();
        acc.total += 1;
        if (acc[src] !== undefined) {
          acc[src] += 1;
        }
        return acc;
      },
      { total: 0, dfy: 0, custom: 0, cloned: 0 }
    );
  }, [agents]);

  async function loadAgents() {
    setLoading(true);
    setError('');

    try {
      const [userAgents, dfyAgents] = await Promise.all([listAgents(), listDfyAgents()]);
      setAgents(mergeAgentCatalog(userAgents, dfyAgents));
    } catch (loadError) {
      console.error('[AgentsPage] loadAgents failed:', loadError);
      setAgents(mockAgents);
      setError('Live API unavailable. Showing realistic mock agents.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function handleSaveAgent(payload) {
    setSavingAgent(true);
    setError('');

    try {
      const saved = await saveAgent(payload);
      setAgents((prev) => [saved, ...prev.filter((item) => item.agentId !== saved.agentId)]);
      setEditorOpen(false);
    } catch (saveError) {
      console.error('[AgentsPage] handleSaveAgent failed:', saveError);
      setError(saveError.message || 'Failed to save agent.');
    } finally {
      setSavingAgent(false);
    }
  }

  async function handleCloneAgent(agent) {
    if (!agent?.agentId) return;

    setCloningAgentId(agent.agentId);
    setError('');

    try {
      const cloned = String(agent.source || '').toLowerCase() === 'dfy'
        ? await cloneAgent(agent.agentId)
        : await saveAgent(buildCustomClonePayload(agent));

      setAgents((prev) => [cloned, ...prev.filter((item) => item.agentId !== cloned.agentId)]);
      setActiveFilter('all');
    } catch (cloneError) {
      console.error('[AgentsPage] handleCloneAgent failed:', cloneError);
      setError(cloneError.message || 'Failed to clone agent.');
    } finally {
      setCloningAgentId('');
    }
  }

  function handleAddToChain(agent) {
    addBlock({
      agentId: agent.agentId,
      agentName: agent.name,
      name: agent.name,
      overrides: null,
      requiredInputs: agent.requiredInputs || []
    });
  }

  function handleOpenChainSave() {
    if (!draftSteps.length) return;
    setChainSaveOpen(true);
  }

  function handleChainSaved() {
    clearDraft();
    setChainSaveOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Agents Workbench</h1>
          <p className="mt-1 text-sm text-text-dim">Build deterministic blocks, test quickly, and assemble chains in-place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowHelp(true)}>
            How it works
          </Button>
          <Button onClick={() => setEditorOpen(true)}>+ Create Agent</Button>
        </div>
      </div>

      {initialLoading ? (
        <CatalogLoadingSkeleton
          title="Loading agent catalog"
          subtitle="Fetching your saved agents and the DFY block library."
          statCount={4}
          cardCount={9}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">Total</p>
              <p className="font-display text-2xl text-white">{sourceCounts.total}</p>
            </Card>
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">DFY</p>
              <p className="font-display text-2xl text-mint">{sourceCounts.dfy}</p>
            </Card>
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">Custom</p>
              <p className="font-display text-2xl text-yellow">{sourceCounts.custom}</p>
            </Card>
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">Cloned</p>
              <p className="font-display text-2xl text-fuchsia">{sourceCounts.cloned}</p>
            </Card>
          </div>

          {error ? <ErrorMessage message={error} /> : null}

          <AgentsGrid
            agents={agents}
            search={search}
            activeFilter={activeFilter}
            cloningAgentId={cloningAgentId}
            onSearchChange={setSearch}
            onFilterChange={setActiveFilter}
            onCreateAgent={() => setEditorOpen(true)}
            onTestRun={setTestingAgent}
            onCloneAgent={handleCloneAgent}
            onAddToChain={handleAddToChain}
          />
        </>
      )}

      <AgentEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveAgent}
        isSaving={savingAgent}
      />

      <TestRunModal
        open={Boolean(testingAgent)}
        agent={testingAgent}
        onClose={() => setTestingAgent(null)}
      />

      <ChainSaveModal
        open={chainSaveOpen && draftSteps.length > 0}
        onClose={() => setChainSaveOpen(false)}
        steps={draftSteps}
        onSaved={handleChainSaved}
        onRemoveStep={removeBlock}
        onMoveStep={moveBlock}
      />

      <ChainBuilderPill blocks={draftSteps} maxBlocks={6} onOpen={handleOpenChainSave} />

      <Modal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Agents workflow"
        subtitle="How to move fast in Agentix"
      >
        <div className="space-y-3 text-sm text-text-dim">
          <p>1) Use DFY blocks for reliable foundations, then clone and customize.</p>
          <p>2) Test each block before adding it to a chain.</p>
          <p>3) Keep steps focused so downstream files stay predictable.</p>
          <div className="flex justify-end">
            <Button onClick={() => setShowHelp(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
