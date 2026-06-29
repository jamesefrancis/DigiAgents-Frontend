// filepath: frontend/src/components/features/activation-code-form.jsx
import { useState } from 'react';
import { applyActivationCode } from '../../services/auth-api-service';
import Button from '../common/button';
import StatusBadge from '../common/status-badge';

/**
 * Activation code form for unlocking tier flags.
 */
export default function ActivationCodeForm({ profile = null, onActivated }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleActivate() {
    if (!code.trim()) {
      setError('Enter an activation code.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const updated = await applyActivationCode(code.trim());
      setMessage('Activation code applied.');
      setCode('');
      onActivated?.(updated);
    } catch (activationError) {
      setError(activationError.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  }

  const tier = profile?.tier || { base: true, unlimited: false, dfy: false };

  return (
    <div className="space-y-4 rounded-2xl border border-card-border bg-card-bg p-5">
      <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">Activation Code</label>
      <div className="flex gap-2">
        <input
          className="w-full rounded-[10px] border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow/40"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter code"
        />
        <Button loading={loading} onClick={handleActivate}>
          Activate
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge value={tier.base ? 'base' : 'inactive'} />
        <StatusBadge value={tier.unlimited ? 'unlimited' : 'limited'} />
        <StatusBadge value={tier.dfy ? 'dfy' : 'standard'} />
      </div>

      {message ? <p className="text-sm text-mint">{message}</p> : null}
      {error ? <p className="text-sm text-fuchsia">{error}</p> : null}
    </div>
  );
}
