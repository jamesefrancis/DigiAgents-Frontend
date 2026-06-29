// filepath: frontend/src/components/features/agents-grid.jsx
import { useState } from 'react';
import Button from '../common/button';
import Card from '../common/card';
import EmptyState from '../common/empty-state';
import StatusBadge from '../common/status-badge';

const filterTabs = ['all', 'dfy', 'custom', 'cloned'];
const keywordFilters = [
  'ad',
  'affiliate',
  'branded',
  'copy',
  'email',
  'hook',
  'html',
  'image',
  'page',
  'product',
  'sales',
  'script',
  'sequence',
  'testimonial',
  'video',
  'youtube'
];

function sourceFilter(agent, tab) {
  if (tab === 'all') return true;
  return String(agent.source || '').toLowerCase() === tab;
}

function getSearchParts(agent) {
  const instruction = agent.instruction || {};
  const requiredInputs = Array.isArray(agent.requiredInputs) ? agent.requiredInputs : [];

  return [
    agent.name,
    agent.description,
    agent.category,
    ...(Array.isArray(agent.tags) ? agent.tags : []),
    ...(Array.isArray(agent.basicMcpSkills) ? agent.basicMcpSkills : []),
    ...(Array.isArray(agent.externalMcps) ? agent.externalMcps : []),
    ...requiredInputs.map((input) => `${input.variable || ''} ${input.label || ''}`),
    instruction.goal,
    instruction.outputRequirements,
    instruction.additionalContext
  ].filter(Boolean);
}

function buildSearchText(agent) {
  return getSearchParts(agent).join(' ').toLowerCase();
}

function buildSearchTokens(agent) {
  return buildSearchText(agent)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function matchesSearch(agent, searchTerm, isPreset) {
  if (!searchTerm) return true;

  if (!isPreset) {
    return buildSearchText(agent).includes(searchTerm);
  }

  return buildSearchTokens(agent).some(
    (token) => token === searchTerm || token === `${searchTerm}s` || token.startsWith(`${searchTerm}-`)
  );
}

/**
 * Agents grid with source tabs, keyword search, create card, and per-agent actions.
 */
export default function AgentsGrid({
  agents = [],
  search = '',
  activeFilter = 'all',
  cloningAgentId = '',
  onSearchChange,
  onFilterChange,
  onCreateAgent,
  onTestRun,
  onCloneAgent,
  onAddToChain
}) {
  const [keywordMenuOpen, setKeywordMenuOpen] = useState(false);
  const normalizedSearch = String(search || '').toLowerCase();
  const presetValue = keywordFilters.includes(normalizedSearch) ? normalizedSearch : '';
  const visibleAgents = agents.filter(
    (agent) =>
      sourceFilter(agent, activeFilter) &&
      matchesSearch(agent, normalizedSearch, Boolean(presetValue))
  );

  function handleKeywordSelect(keyword) {
    onSearchChange?.(keyword);
    setKeywordMenuOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <input
              className="w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-text-muted focus:border-yellow/40 focus:outline-none"
              value={search}
              placeholder="Search agents..."
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </div>

          <div className="relative w-full max-w-[260px]">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-card-border bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-yellow/40 focus:border-yellow/40 focus:outline-none"
              onClick={() => setKeywordMenuOpen((open) => !open)}
              onBlur={() => window.setTimeout(() => setKeywordMenuOpen(false), 120)}
              aria-haspopup="listbox"
              aria-expanded={keywordMenuOpen}
            >
              <span>{presetValue || 'Filter All Agents'}</span>
              <span className="text-xs text-text-muted">v</span>
            </button>

            {keywordMenuOpen ? (
              <div
                className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border border-card-border bg-navy/95 p-1 shadow-2xl shadow-black/40 backdrop-blur"
                role="listbox"
              >
                <button
                  type="button"
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    !presetValue ? 'bg-yellow/20 text-yellow' : 'text-text-dim hover:bg-white/10 hover:text-white'
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleKeywordSelect('')}
                >
                  Filter All Agents
                </button>
                {keywordFilters.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm capitalize transition ${
                      presetValue === keyword ? 'bg-yellow/20 text-yellow' : 'text-text-dim hover:bg-white/10 hover:text-white'
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleKeywordSelect(keyword)}
                    role="option"
                    aria-selected={presetValue === keyword}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onFilterChange?.(tab)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
                activeFilter === tab ? 'bg-yellow/20 text-yellow' : 'text-text-dim hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => onCreateAgent?.()}
          className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow/35 bg-yellow/[0.03] px-6 text-center transition hover:-translate-y-0.5 hover:border-yellow/60 hover:bg-yellow/[0.06]"
        >
          <span className="mb-2 rounded-xl border border-yellow/30 bg-yellow/15 px-4 py-2 text-2xl text-yellow">+</span>
          <span className="font-display text-lg font-semibold text-yellow">Create New Agent</span>
          <span className="mt-2 text-sm text-text-dim">Define goal, tools, inputs, and output requirements.</span>
        </button>

        {visibleAgents.map((agent) => {
          const description = agent.description || 'No description';
          const isCloning = cloningAgentId === agent.agentId;

          return (
            <Card key={agent.agentId} className="min-h-[230px]" bodyClassName="flex h-full flex-col overflow-visible">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{agent.name || 'Untitled Agent'}</h3>
                  <div className="group/description relative mt-1">
                    <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-text-dim">{description}</p>
                    <div className="pointer-events-none absolute left-0 right-0 top-full z-40 mt-3 hidden rounded-lg border border-yellow/25 bg-[#071321] p-3 text-sm leading-relaxed text-white shadow-[0_18px_45px_rgba(0,0,0,0.7)] ring-1 ring-white/10 group-hover/description:block">
                      {description}
                    </div>
                  </div>
                </div>
                <StatusBadge value={agent.source || 'custom'} />
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs text-text-muted">
                <span className="rounded bg-white/5 px-2 py-1">{agent.maxTokens || 32000} tokens</span>
                <span className="rounded bg-white/5 px-2 py-1">${Number(agent.estimatedCost || 0).toFixed(3)}</span>
                <span className="rounded bg-white/5 px-2 py-1">{agent.estimatedTimeMinutes || 0} min</span>
              </div>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {(agent.basicMcpSkills || []).map((skill) => (
                  <span key={skill} className="rounded border border-mint/20 bg-mint/10 px-2 py-0.5 font-mono text-[10px] text-mint">
                    {skill}
                  </span>
                ))}
                {(agent.externalMcps || []).map((tool) => (
                  <span key={tool} className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-text-dim">
                    {tool}
                  </span>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2">
                <Button variant="primary" size="sm" onClick={() => onTestRun?.(agent)}>
                  Test Run
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={isCloning}
                  disabled={isCloning}
                  onClick={() => onCloneAgent?.(agent)}
                >
                  Clone
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="border-mint/35 bg-mint/15 text-mint hover:border-mint/60 hover:bg-mint/25 hover:text-mint disabled:border-mint/20 disabled:bg-mint/10 disabled:text-mint/60"
                  onClick={() => onAddToChain?.(agent)}
                >
                  + Chain
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {!visibleAgents.length ? (
        <EmptyState
          icon="piece"
          title="No agents matched"
          description="Try a different filter or search term, or create a new custom agent."
          actionLabel="Create Agent"
          onAction={onCreateAgent}
        />
      ) : null}
    </div>
  );
}
