// filepath: frontend/src/components/features/chains-list.jsx
import Button from '../common/button';
import CatalogLoadingSkeleton from '../common/catalog-loading-skeleton';
import Card from '../common/card';
import EmptyState from '../common/empty-state';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Chains listing cards with run/edit/delete actions.
 */
export default function ChainsList({
  chains = [],
  isLoading = false,
  onRun,
  onEdit,
  onDelete
}) {
  const safeChains = asArray(chains);

  if (isLoading) {
    return (
      <CatalogLoadingSkeleton
        title="Loading saved chains"
        subtitle="Fetching your saved workflows."
        cardCount={2}
        columnsClassName="xl:grid-cols-2"
      />
    );
  }

  if (!safeChains.length) {
    return (
      <EmptyState
        icon="chain"
        title="No chains saved"
        description="Add agents to your draft and save a chain to launch multi-step runs."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {safeChains.map((chain) => (
        <Card
          key={chain.chainId}
          title={chain.name}
          subtitle={chain.description}
          footer={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onRun?.(chain)}>
                Run Chain
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onEdit?.(chain)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(chain)}>
                Delete
              </Button>
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap gap-1">
            {asArray(chain.steps).map((step, idx) => (
              <span key={`${chain.chainId}-${idx}`} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-text-dim">
                {idx + 1}. {step.agentName || step.name || step.agentId || `Step ${idx + 1}`}
              </span>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>Est. cost: ${Number(chain.estimatedCost || 0).toFixed(3)}</span>
            <span>Est. time: {chain.estimatedTimeMinutes || 0} min</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
