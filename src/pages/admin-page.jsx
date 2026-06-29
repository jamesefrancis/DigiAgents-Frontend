// src/pages/admin-page.jsx
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/common/button';
import Card from '../components/common/card';
import ErrorMessage from '../components/common/error-message';
import LoadingSpinner from '../components/common/loading-spinner';
import { listAdminUsers, updateAdminUserTier } from '../services/admin-api-service';

function formatDate(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function TierButton({ user, tier, busyKey, onToggle }) {
  const enabled = Boolean(user.tier?.[tier]);
  const key = `${user.uid}:${tier}`;
  return (
    <Button
      type="button"
      variant={enabled ? 'secondary' : 'ghost'}
      loading={busyKey === key}
      onClick={() => onToggle(user.uid, tier, !enabled)}
      className={enabled ? 'border-mint/50 text-mint' : 'border-white/15 text-text-dim'}
    >
      {tier}: {enabled ? 'on' : 'off'}
    </Button>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');

  const totals = useMemo(() => ({
    users: users.length,
    base: users.filter((user) => user.tier?.base).length,
    unlimited: users.filter((user) => user.tier?.unlimited).length,
    dfy: users.filter((user) => user.tier?.dfy).length
  }), [users]);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const payload = await listAdminUsers();
      setUsers(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError?.message || 'Could not load admin users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(uid, tier, enabled) {
    const key = `${uid}:${tier}`;
    setBusyKey(key);
    setError('');
    try {
      const updated = await updateAdminUserTier(uid, tier, enabled);
      setUsers((prev) => prev.map((user) => (
        user.uid === uid ? { ...user, ...updated, jvzooTransactions: user.jvzooTransactions || [] } : user
      )));
    } catch (toggleError) {
      setError(toggleError?.message || 'Could not update user tier.');
    } finally {
      setBusyKey('');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Adminzoo</h1>
          <p className="text-text-dim">Support-only user entitlements and JVZoo transaction audit.</p>
        </div>
        <Button type="button" onClick={loadUsers} loading={loading}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Users" className="p-5"><div className="text-3xl text-white">{totals.users}</div></Card>
        <Card title="Base" className="p-5"><div className="text-3xl text-yellow">{totals.base}</div></Card>
        <Card title="Unlimited" className="p-5"><div className="text-3xl text-mint">{totals.unlimited}</div></Card>
        <Card title="DFY" className="p-5"><div className="text-3xl text-fuchsia">{totals.dfy}</div></Card>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner label="Loading admin users..." /> : null}

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.uid} className="p-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1.4fr]">
              <div>
                <h2 className="text-lg font-semibold text-white">{user.email || 'No email'}</h2>
                <p className="mt-1 break-all text-xs text-text-dim">{user.uid}</p>
                <p className="mt-2 text-sm text-text-dim">Created: {formatDate(user.createdAt)}</p>
              </div>

              <div className="flex flex-wrap items-start gap-2">
                {['base', 'unlimited', 'dfy'].map((tier) => (
                  <TierButton key={tier} user={user} tier={tier} busyKey={busyKey} onToggle={handleToggle} />
                ))}
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">JVZoo Transactions</div>
                {user.jvzooTransactions?.length ? (
                  <div className="max-h-36 space-y-2 overflow-auto pr-2">
                    {user.jvzooTransactions.map((tx) => (
                      <div key={tx.transactionKey} className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-text-dim">
                        <div className="text-white">{tx.transactionType || 'n/a'} - {tx.productId || 'n/a'}</div>
                        <div>{tx.actionTaken || 'no action'} ({tx.receivedCount || 1}x)</div>
                        <div>{tx.transactionId || tx.transactionKey}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-dim">No JVZoo transactions logged.</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
