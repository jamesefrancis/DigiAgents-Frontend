// src/pages/settings-page.jsx
import { useEffect, useState } from 'react';
import ActivationCodeForm from '../components/features/activation-code-form';
import SettingsKeysForm from '../components/features/settings-keys-form';
import Button from '../components/common/button';
import Card from '../components/common/card';
import ErrorMessage from '../components/common/error-message';
import LoadingSpinner from '../components/common/loading-spinner';
import Modal from '../components/common/modal';
import { getSettingsProfile } from '../services/settings-api-service';
import { fetchProfile } from '../services/auth-api-service';
import { mockProfile } from '../data/mock-data';
import { formatDateTime } from '../utils/date-time';

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [securityOpen, setSecurityOpen] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const settingsProfile = await getSettingsProfile();
      setProfile(settingsProfile || null);
    } catch (settingsError) {
      try {
        const authProfile = await fetchProfile();
        setProfile(authProfile || null);
      } catch (authError) {
        console.error('[SettingsPage] loadProfile failed:', settingsError, authError);
        setProfile(mockProfile);
        setError('Live API unavailable. Showing mock account profile.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const tier = profile?.tier || { base: true, unlimited: false, dfy: false };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-sm text-text-dim">Manage BYOK credentials, activation codes, and account access level.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadProfile}>
            Refresh
          </Button>
          <Button onClick={() => setSecurityOpen(true)}>Security Notes</Button>
        </div>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner label="Loading account settings..." /> : null}

      {!loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <SettingsKeysForm onSaved={() => loadProfile()} />
            <ActivationCodeForm profile={profile} onActivated={(next) => setProfile(next || profile)} />
          </div>

          <div className="space-y-4">
            <Card className="p-5" title="Account" subtitle="Current workspace access">
              <div className="space-y-2 text-sm text-text-dim">
                <p>Email: <span className="text-white">{profile?.email || 'Unknown'}</span></p>
                <p>Member since: <span className="text-white">{formatDateTime(profile?.createdAt)}</span></p>
                <p>Last updated: <span className="text-white">{formatDateTime(profile?.updatedAt)}</span></p>
              </div>
            </Card>

            <Card className="p-5" title="Tier Flags" subtitle="Feature entitlements">
              <div className="space-y-2 text-sm">
                <p className={tier.base ? 'text-mint' : 'text-text-dim'}>• Base access</p>
                <p className={tier.unlimited ? 'text-mint' : 'text-text-dim'}>• Unlimited block/chain limits</p>
                <p className={tier.dfy ? 'text-mint' : 'text-text-dim'}>• DFY catalog unlocked</p>
              </div>
            </Card>

            <Card className="p-5" title="Best Practices" subtitle="Keep your account healthy">
              <ul className="list-disc space-y-1 pl-4 text-sm text-text-dim">
                <li>Rotate provider keys periodically.</li>
                <li>Use separate keys per environment when possible.</li>
                <li>Confirm Make region matches your token scope.</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : null}

      <Modal
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
        title="Security posture"
        subtitle="Defense-in-depth currently active in Agentix"
      >
        <div className="space-y-2 text-sm text-text-dim">
          <p>• API keys are stored encrypted at rest (AES-GCM via backend key).</p>
          <p>• Frontend requests include authenticated bearer token and backend secret header.</p>
          <p>• MCP access is run-scoped with short-lived tokens.</p>
          <div className="pt-2 text-right">
            <Button onClick={() => setSecurityOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
