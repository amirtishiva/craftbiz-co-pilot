import React from 'react';
import { WifiOff, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OfflineIndicatorProps {
  isOffline: boolean;
  isCached: boolean;
  cacheTimestamp: Date | null;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  isCached,
  cacheTimestamp
}) => {
  if (!isOffline && !isCached) return null;

  if (isOffline) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            You're offline
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {isCached 
              ? 'Showing cached products. Some features may be limited.'
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
