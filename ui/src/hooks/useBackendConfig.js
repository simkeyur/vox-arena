import { useState, useEffect, useCallback } from 'react';

export default function useBackendConfig(backendUrl, { onConfigLoaded } = {}) {
  const [backendConfig, setBackendConfig] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const refresh = useCallback(() => {
    return fetch(`${backendUrl}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        setBackendConfig(data);
        if (onConfigLoaded) onConfigLoaded(data);
        return data;
      })
      .catch((err) => {
        console.error('Error fetching backend config:', err);
        return null;
      });
  }, [backendUrl, onConfigLoaded]);

  useEffect(() => {
    fetch(`${backendUrl}/api/health`)
      .then((res) => setBackendStatus(res.ok ? 'connected' : 'error'))
      .catch(() => setBackendStatus('disconnected'));
    refresh();
  }, [backendUrl, refresh]);

  return { backendConfig, setBackendConfig, backendStatus, refreshBackendConfig: refresh };
}
