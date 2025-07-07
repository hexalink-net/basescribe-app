// components/VersionSync.tsx
'use client';

import { useEffect } from 'react';

export default function VersionSync() {
  useEffect(() => {
    const localVersion = localStorage.getItem('app_version');
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;

    if (currentVersion && localVersion !== currentVersion) {
      localStorage.setItem('app_version', currentVersion);
      if (localVersion !== null) {
        window.location.reload(); // only reload on version mismatch
      }
    }
  }, []);

  return null;
}
