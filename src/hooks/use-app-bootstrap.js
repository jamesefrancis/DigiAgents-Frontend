// filepath: frontend/src/hooks/use-app-bootstrap.js
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { bootstrapProfile } from '../services/auth-api-service';

export function useAppBootstrap() {
  const { isAuthenticated, loading, user } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [profile, setProfile] = useState(null);
  const didRunRef = useRef(false);
  const lastUidRef = useRef(null);

  useEffect(() => {
    const uid = user?.uid || null;
    if (lastUidRef.current !== uid) {
      lastUidRef.current = uid;
      didRunRef.current = false;
      setProfile(null);
      setBootstrapError('');
    }
  }, [user?.uid]);

  useEffect(() => {
    if (loading || !isAuthenticated || didRunRef.current) {
      return;
    }

    let active = true;
    didRunRef.current = true;
    setBootstrapping(true);
    setBootstrapError('');

    bootstrapProfile([])
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile || null);
      })
      .catch((error) => {
        if (!active) return;
        setBootstrapError(error?.message || 'Profile bootstrap failed');
      })
      .finally(() => {
        if (!active) return;
        setBootstrapping(false);
      });

    return () => {
      active = false;
    };
  }, [loading, isAuthenticated, user?.uid]);

  const accountDisabled = profile?.tier?.base === false;

  return { bootstrapping, bootstrapError, profile, accountDisabled };
}
