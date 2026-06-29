// filepath: frontend/src/services/workspace-api-service.js
import { apiRequest } from './api-client';

export function listAgents(params = {}) {
  return apiRequest('/api/agents', { params });
}

export function listDfyAgents() {
  return apiRequest('/api/agents/dfy');
}

export function getAgent(agentId) {
  return apiRequest(`/api/agents/${agentId}`);
}

export function generateAgentSkillDraft(payload) {
  return apiRequest('/api/agents/generate-skill', { method: 'POST', data: payload });
}

export function saveAgent(payload) {
  return apiRequest('/api/agents', { method: 'POST', data: payload });
}

export function cloneAgent(agentId) {
  return apiRequest(`/api/agents/clone/${agentId}`, { method: 'POST' });
}

export function deleteAgent(agentId) {
  return apiRequest(`/api/agents/${agentId}`, { method: 'DELETE' });
}

export function listChains() {
  return apiRequest('/api/chains');
}

export function listDfyChains() {
  return apiRequest('/api/chains/dfy');
}

export function cloneDfyChain(templateId) {
  return apiRequest(`/api/chains/dfy/${templateId}/clone`, { method: 'POST' });
}

export function getChain(chainId) {
  return apiRequest(`/api/chains/${chainId}`);
}

export function saveChain(payload) {
  return apiRequest('/api/chains', { method: 'POST', data: payload });
}

export function deleteChain(chainId) {
  return apiRequest(`/api/chains/${chainId}`, { method: 'DELETE' });
}

export function launchTestRun(payload) {
  return apiRequest('/api/launch/test', { method: 'POST', data: payload });
}

export function launchChainRun(payload) {
  return apiRequest('/api/launch/chain', { method: 'POST', data: payload });
}

export function listRuns(params = {}) {
  return apiRequest('/api/runs', { params });
}

export function getRun(runId) {
  return apiRequest(`/api/runs/${runId}`);
}
