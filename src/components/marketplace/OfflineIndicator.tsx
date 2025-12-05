import React from 'react';
import { WifiOff, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface OfflineIndicatorProps {
  isOffline: boolean;
  isCached: boolean;
  cacheTimestamp: Date | null;
  pendingSyncCount?: number;
  isSyncing?: boolean;
  onSyncNow?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  isCached,
  cacheTimestamp,
  pendingSyncCount = 0,
  isSyncing = false,
  onSyncNow
}) => {
  // Show sync indicator when back online with pending actions
  if (!isOffline && pendingSyncCount > 0) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex items-center gap-3">
        <RefreshCw className={`h-5 w-5 text-blue-600 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {isSyncing ? 'Syncing...' : `${pendingSyncCount} action${pendingSyncCount > 1 ? 's' : ''} pending`}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {isSyncing ? 'Uploading your offline changes' : 'Click to sync your offline actions'}
          </p>
        </div>
        {onSyncNow && !isSyncing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSyncNow}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/20"
          >
            Sync Now
          </Button>
        )}
      </div>
    );
  }

  if (!isOffline && !isCached) return null;

  if (isOffline) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            You're offline
            {pendingSyncCount > 0 && (
              <span className="ml-2 text-xs bg-amber-500/20 px-2 py-0.5 rounded-full">
                {pendingSyncCount} pending
              </span>
            )}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {isCached 
              ? 'Showing cached products. Actions will sync when back online.'
              : 'No cached data available. Connect to browse products.'}
          </p>
        </div>
        {cacheTimestamp && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(cacheTimestamp, { addSuffix: true })}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;
