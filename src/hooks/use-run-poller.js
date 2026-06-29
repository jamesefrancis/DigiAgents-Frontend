// filepath: frontend/src/hooks/use-run-poller.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { getRun } from '../services/workspace-api-service';

export function useRunPoller({ runId = '', enabled = true, intervalMs = 5000 }) {
  const [run, setRun] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  const fetchRun = useCallback(async () => {
    if (!runId || !enabled) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await getRun(runId);
      if (isMounted.current) {
        setRun(response);
      }
    } catch (fetchError) {
      if (isMounted.current) {
        setError(fetchError.message || 'Failed to fetch run');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [runId, enabled]);

  useEffect(() => {
    isMounted.current = true;
    if (!enabled || !runId) {
      setRun(null);
      return () => {
        isMounted.current = false;
      };
    }

    fetchRun();
    timerRef.current = window.setInterval(fetchRun, intervalMs);

    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [enabled, runId, intervalMs, fetchRun]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { run, isLoading, error, refresh: fetchRun, stop };
}
