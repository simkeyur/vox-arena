import { useState, useEffect, useCallback } from 'react';

export default function useTemplates(backendUrl) {
  const [templates, setTemplates] = useState([]);

  const refresh = useCallback(() => {
    return fetch(`${backendUrl}/api/templates`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTemplates(list);
        return list;
      })
      .catch((err) => {
        console.error('Error fetching templates:', err);
        return [];
      });
  }, [backendUrl]);

  useEffect(() => { refresh(); }, [refresh]);

  return { templates, setTemplates, refreshTemplates: refresh };
}
