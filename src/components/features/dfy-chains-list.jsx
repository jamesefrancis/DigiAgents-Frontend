// filepath: frontend/src/components/features/dfy-chains-list.jsx
import Button from '../common/button';
import CatalogLoadingSkeleton from '../common/catalog-loading-skeleton';
import Card from '../common/card';
import EmptyState from '../common/empty-state';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function DfyChainsList({
  chains = [],
  isLoading = false,
  activeTemplateId = '',
  activeAction = '',
  onUse,
  onRun
}) {
  const safeChains = asArray(chains);
  const hasActiveAction = Boolean(activeTemplateId);

  if (isLoading) {
    return (
      <CatalogLoadingSkeleton
        title="Loading DFY chains"
        subtitle="Resolving template steps and required inputs for your tier."
        cardCount={4}
        columnsClassName="xl:grid-cols-2"
      />
    );
  }

  if (!safeChains.length) {
    return (
      <EmptyState
        icon="*"
        title="No DFY chains available"
        description="Prebuilt chain templates will appear here when available for your tier."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {safeChains.map((chain) => {
        const isActive = activeTemplateId === chain.chainId;
        return (
          <Card
            key={chain.chainId}
            title={chain.name}
            subtitle={chain.description}
            footer={
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  loading={isActive && activeAction === 'run'}
                  disabled={hasActiveAction && (!isActive || activeAction !== 'run')}
                  onClick={() => onRun?.(chain)}
                >
                  Run Chain
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={isActive && activeAction === 'use'}
                  disabled={hasActiveAction && (!isActive || activeAction !== 'use')}
                  onClick={() => onUse?.(chain)}
                >
                  Use Chain
                </Button>
              </div>
            }
          >
            <div className="mb-3 flex flex-wrap gap-1">
              {asArray(chain.steps).map((step, idx) => (
                <span key={`${chain.chainId}-${idx}`} className="rounded-md border border-yellow/20 bg-yellow/10 px-2 py-1 text-xs text-yellow">
                  {idx + 1}. {step.agentName || step.name || step.agentId || `Step ${idx + 1}`}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-text-muted">
              <span>{asArray(chain.steps).length} steps</span>
              <span>Est. cost: ${Number(chain.estimatedCost || 0).toFixed(3)}</span>
              <span>Est. time: {chain.estimatedTimeMinutes || 0} min</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
