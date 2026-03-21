'use client';

import { useEffect, useState } from 'react';

/**
 * `true` = server has NEON_AUTH_BASE_URL + NEON_AUTH_COOKIE_SECRET (handler exists).
 * `false` = use Supabase or show “configure auth”.
 * `null` = still fetching (avoid calling /api/auth and getting 503).
 */
export function useNeonAuthReady(): boolean | null {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/ready', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { neonAuth?: boolean }) => {
        if (!cancelled) setReady(!!d.neonAuth);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
