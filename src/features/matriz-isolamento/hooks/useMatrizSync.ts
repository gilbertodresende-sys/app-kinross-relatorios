import { useCallback, useEffect, useState } from 'react';

import { matrizSyncService } from '../services/matrizSyncService';

export function useMatrizSync() {
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  const sync = useCallback(async () => {
    setIsSyncing(true);

    try {
      const result = await matrizSyncService.syncIfNeeded();
      setSyncMessage(result.message);
      setLastSyncedAt(result.updatedAt);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    void sync();
  }, [sync]);

  return {
    sync,
    syncMessage,
    isSyncing,
    lastSyncedAt,
  };
}