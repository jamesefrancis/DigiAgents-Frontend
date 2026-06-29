// filepath: frontend/src/components/features/chain-builder-pill.jsx
import Button from '../common/button';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isValidBlock(block) {
  return Boolean(block?.agentId);
}

/**
 * Floating chain draft pill for quick save/edit entry.
 */
export default function ChainBuilderPill({ blocks = [], maxBlocks = 6, onOpen }) {
  const safeBlocks = asArray(blocks).filter(isValidBlock);

  if (!safeBlocks.length) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border border-mint/35 bg-bg-deep/90 px-4 py-3 shadow-[0_12px_32px_rgba(54,240,193,0.18)] backdrop-blur">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-mono text-xs font-bold text-bg-deep">
        {safeBlocks.length}
      </div>
      <p className="text-sm text-white">
        <span className="font-semibold text-mint">{safeBlocks.length}</span> of {maxBlocks} blocks added
      </p>
      <Button size="sm" onClick={() => onOpen?.()}>
        Save Agent Draft
      </Button>
    </div>
  );
}
