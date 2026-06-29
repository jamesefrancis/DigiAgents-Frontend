// src/pages/chains-page.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/common/button';
import Card from '../components/common/card';
import CatalogLoadingSkeleton from '../components/common/catalog-loading-skeleton';
import ErrorMessage from '../components/common/error-message';
import ChainLaunchModal from '../components/features/chain-launch-modal';
import ChainSaveModal from '../components/features/chain-save-modal';
import ChainsList from '../components/features/chains-list';
import DfyChainsList from '../components/features/dfy-chains-list';
import { useChainDraft } from '../hooks/use-chain-draft';
import { cloneDfyChain, deleteChain, listChains, listDfyChains } from '../services/workspace-api-service';
import { mockChains, mockDfyChains } from '../data/mock-data';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function validSteps(value) {
  return asArray(value).filter((step) => Boolean(step?.agentId));
}

export default function ChainsPage() {
  const [chains, setChains] = useState([]);
  const [dfyChains, setDfyChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dfyLoading, setDfyLoading] = useState(false);
  const [error, setError] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [savingDraft, setSavingDraft] = useState(null);
  const [launchingChain, setLaunchingChain] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [activeAction, setActiveAction] = useState('');
  const { draft, clearDraft } = useChainDraft();
  const draftSteps = validSteps(draft);
  const initialLoading = loading && dfyLoading && !chains.length && !dfyChains.length;

  const loadChains = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listChains();
      setChains(asArray(data?.chains || data));
    } catch (loadError) {
      console.error('[ChainsPage] loadChains failed:', loadError);
      setChains(mockChains);
      setError('Live API unavailable. Showing realistic mock chains.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDfyChains = useCallback(async () => {
    setDfyLoading(true);
    setCloneError('');

    try {
      const data = await listDfyChains();
      setDfyChains(asArray(data?.chains || data));
    } catch (loadError) {
      console.error('[ChainsPage] loadDfyChains failed:', loadError);
      setDfyChains(mockDfyChains);
      setCloneError('Live DFY chain catalog unavailable. Showing mock templates.');
    } finally {
      setDfyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChains();
    loadDfyChains();
  }, [loadChains, loadDfyChains]);

  const stats = useMemo(() => {
    const safeChains = asArray(chains);
    return {
      total: safeChains.length,
      dfy: asArray(dfyChains).length,
      maxSteps: safeChains.reduce((max, chain) => Math.max(max, validSteps(chain?.steps).length), 0)
    };
  }, [chains, dfyChains]);

  function openDraftSave() {
    if (!draftSteps.length) return;
    setSavingDraft({ chainId: null, name: '', description: '', steps: draftSteps });
  }

  function openEdit(chain) {
    const steps = validSteps(chain?.steps);
    if (!steps.length) return;
    setSavingDraft({
      chainId: chain.chainId,
      name: chain.name || '',
      description: chain.description || '',
      steps
    });
  }

  function updateSavingSteps(updater) {
    setSavingDraft((prev) => {
      if (!prev) return prev;
      const nextSteps = validSteps(typeof updater === 'function' ? updater(prev.steps) : updater);
      if (!nextSteps.length) return null;
      return { ...prev, steps: nextSteps };
    });
  }

  function removeSavingStep(index) {
    updateSavingSteps((steps) => validSteps(steps).filter((_, idx) => idx !== index));
  }

  function moveSavingStep(index, direction) {
    updateSavingSteps((steps) => {
      const next = [...validSteps(steps)];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return next;
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function handleSaved() {
    if (!savingDraft?.chainId) {
      clearDraft();
    }
    setSavingDraft(null);
    await loadChains();
  }

  async function handleDelete(chain) {
    const chainId = chain?.chainId || chain;
    if (!chainId) return;

    try {
      await deleteChain(chainId);
      await loadChains();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete chain.');
    }
  }

  async function cloneTemplate(template, action) {
    if (!template?.chainId) return null;
    setActiveTemplateId(template.chainId);
    setActiveAction(action);
    setCloneError('');

    try {
      const result = await cloneDfyChain(template.chainId);
      const cloned = result?.chain || result;
      await loadChains();
      return cloned?.chainId ? cloned : null;
    } catch (cloneFailure) {
      setCloneError(cloneFailure.message || 'Unable to use this DFY chain.');
      return null;
    } finally {
      setActiveTemplateId('');
      setActiveAction('');
    }
  }

  async function handleUseTemplate(template) {
    await cloneTemplate(template, 'use');
  }

  async function handleRunTemplate(template) {
    const cloned = await cloneTemplate(template, 'run');
    if (cloned) {
      setLaunchingChain(cloned);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Chains</h1>
          <p className="mt-1 text-sm text-text-dim">Build, save, and launch multi-step workflows from your agents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { loadChains(); loadDfyChains(); }}>
            Refresh
          </Button>
          {draftSteps.length ? (
            <Button onClick={openDraftSave}>Save Agent Draft</Button>
          ) : null}
        </div>
      </div>

      {error ? <ErrorMessage message={error} onRetry={loadChains} /> : null}
      {cloneError ? <ErrorMessage message={cloneError} onRetry={loadDfyChains} /> : null}

      {initialLoading ? (
        <CatalogLoadingSkeleton
          title="Loading chain library"
          subtitle="Fetching saved chains and resolving DFY templates."
          statCount={3}
          cardCount={6}
          columnsClassName="xl:grid-cols-2"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">Saved Chains</p>
              <p className="font-display text-2xl text-white">{stats.total}</p>
            </Card>
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">DFY Chains</p>
              <p className="font-display text-2xl text-mint">{stats.dfy}</p>
            </Card>
            <Card className="p-4" bodyClassName="space-y-1">
              <p className="font-mono text-[11px] uppercase text-text-muted">Longest Chain</p>
              <p className="font-display text-2xl text-yellow">{stats.maxSteps}</p>
            </Card>
          </div>

          {draftSteps.length ? (
            <Card
              title="Agent Draft"
              subtitle="Agents added from the catalog but not saved as a chain yet."
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={openDraftSave}>Save Agent Draft</Button>
                  <Button variant="ghost" size="sm" onClick={clearDraft}>Clear Draft</Button>
                </div>
              }
            >
              <div className="flex flex-wrap gap-1.5">
                {draftSteps.map((step, index) => (
                  <span key={`${step.agentId}-${index}`} className="rounded-md border border-mint/20 bg-mint/10 px-2 py-1 text-xs text-mint">
                    {index + 1}. {step.name || step.agentName || step.agentId}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">DFY Chains</h2>
              <p className="mt-1 text-sm text-text-dim">Clone a prebuilt workflow, or run it after saving a copy to your account.</p>
            </div>
            <DfyChainsList
              chains={dfyChains}
              isLoading={dfyLoading}
              activeTemplateId={activeTemplateId}
              activeAction={activeAction}
              onUse={handleUseTemplate}
              onRun={handleRunTemplate}
            />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">My Chains</h2>
              <p className="mt-1 text-sm text-text-dim">Saved chains you can edit, delete, or launch.</p>
            </div>
            <ChainsList
              chains={chains}
              isLoading={loading}
              onEdit={openEdit}
              onRun={setLaunchingChain}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}

      <ChainSaveModal
        open={Boolean(savingDraft && validSteps(savingDraft.steps).length)}
        onClose={() => setSavingDraft(null)}
        steps={savingDraft?.steps || []}
        initialChain={savingDraft?.chainId ? savingDraft : null}
        onSaved={handleSaved}
        onRemoveStep={removeSavingStep}
        onMoveStep={moveSavingStep}
      />

      <ChainLaunchModal
        open={Boolean(launchingChain)}
        onClose={() => setLaunchingChain(null)}
        chain={launchingChain}
      />
    </div>
  );
}
