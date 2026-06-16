import { useState, useEffect, useCallback } from 'react';

export default function useRuns(backendUrl) {
  const [runs, setRuns] = useState([]);

  const refresh = useCallback(() => {
    return fetch(`${backendUrl}/api/runs`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRuns(list);
        return list;
      })
      .catch((err) => {
        console.error('Error fetching runs:', err);
        return [];
      });
  }, [backendUrl]);

  useEffect(() => { refresh(); }, [refresh]);

  return { runs, setRuns, refreshRuns: refresh };
}
