// filepath: frontend/src/components/features/settings-keys-form.jsx
import { useEffect, useState } from 'react';
import { getKeys, saveKeys } from '../../services/settings-api-service';
import { buildKeyUpdatePayload } from '../../utils/key-mask-utils';
import Button from '../common/button';
import InputField from '../common/input-field';

/**
 * API key settings form with masked-value patch semantics.
 */
export default function SettingsKeysForm({ onSaved }) {
  const [initialValues, setInitialValues] = useState({});
  const [values, setValues] = useState({
    openaiApiKey: '',
    falApiKey: '',
    zapierApiKey: '',
    makeApiKey: '',
    makeRegion: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getKeys();
        if (!mounted) return;
        setInitialValues(data || {});
        setValues({
          openaiApiKey: data?.openaiApiKey || '',
          falApiKey: data?.falApiKey || '',
          zapierApiKey: data?.zapierApiKey || '',
          makeApiKey: data?.makeApiKey || '',
          makeRegion: data?.makeRegion || ''
        });
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || 'Failed to load keys');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = buildKeyUpdatePayload(values, initialValues);
      if (!Object.keys(payload).length) {
        setMessage('No changes detected.');
        return;
      }

      const result = await saveKeys(payload);
      setInitialValues(result || {});
      setMessage('Keys updated successfully.');
      onSaved?.(result);
    } catch (saveError) {
      setError(saveError.message || 'Failed to save keys');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-dim">Loading key settings...</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-card-border bg-card-bg p-5">
      <InputField
        label="OpenAI API Key"
        value={values.openaiApiKey}
        onChange={(event) => setValues((prev) => ({ ...prev, openaiApiKey: event.target.value }))}
      />
      <InputField
        label="Fal API Key"
        value={values.falApiKey}
        onChange={(event) => setValues((prev) => ({ ...prev, falApiKey: event.target.value }))}
      />
      <InputField
        label="Zapier API Key (optional)"
        value={values.zapierApiKey}
        onChange={(event) => setValues((prev) => ({ ...prev, zapierApiKey: event.target.value }))}
      />
      <InputField
        label="Make API Key (optional)"
        value={values.makeApiKey}
        onChange={(event) => setValues((prev) => ({ ...prev, makeApiKey: event.target.value }))}
      />
      <InputField
        label="Make Region"
        value={values.makeRegion}
        placeholder="eu1, eu2, us1, or us2"
        onChange={(event) => setValues((prev) => ({ ...prev, makeRegion: event.target.value }))}
      />

      {message ? <p className="text-sm text-mint">{message}</p> : null}
      {error ? <p className="text-sm text-fuchsia">{error}</p> : null}

      <div className="flex justify-end">
        <Button loading={saving} onClick={handleSave}>
          Save Keys
        </Button>
      </div>
    </div>
  );
}
