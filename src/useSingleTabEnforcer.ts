import { useEffect, useRef, useState, useCallback, ReactNode, createElement } from 'react';
import { SingleTabConfig, SingleTabState, SingleTabMethods, TabRecord } from './types';
import { generateTabId, log } from './utils';

// Create a simple default fallback component
const createDefaultFallbackComponent = (): ReactNode => {
  return createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#333',
      textAlign: 'center' as const,
      padding: '20px',
    }
  }, 
    createElement('div', {
      style: {
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }
    },
      createElement('div', { 
        style: { fontSize: '48px', marginBottom: '20px' } 
      }, '⚠️'),
      createElement('h1', { 
        style: { fontSize: '24px', marginBottom: '16px', fontWeight: '600' } 
      }, 'Application Already Open'),
      createElement('p', { 
        style: { fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' } 
      }, 'This application is already running in another tab or window. Please close this tab and return to the existing one.')
    )
  );
};

const DEFAULT_CONFIG: Required<Omit<SingleTabConfig, 'fallbackComponent'>> & { fallbackComponent: ReactNode } = {
  appName: 'my-app',
  timeout: 15000,
  interval: 10000,
  fallbackComponent: createDefaultFallbackComponent(),
  useBroadcastChannel: true,
  storagePrefix: 'single-tab',
  debug: false,
  onBecomeLeader: () => {},
  onLoseLeadership: () => {},
  onTabDetected: () => {},
};

/**
 * A modern React hook for enforcing single-tab behavior in web applications.
 * 
 * @param config Configuration options for tab enforcement
 * @returns Object containing tab state and control methods
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { isLeader, fallbackComponent } = useSingleTabEnforcer({
 *     appName: 'my-app',
 *     timeout: 15000,
 *   });
 * 
 *   if (!isLeader) {
 *     return fallbackComponent;
 *   }
 * 
 *   return <div>Your app content here</div>;
 * }
 * ```
 */
export function useSingleTabEnforcer(
  config: SingleTabConfig = {}
): SingleTabState & SingleTabMethods & { fallbackComponent: ReactNode } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    appName,
    timeout,
    interval,
    fallbackComponent,
    useBroadcastChannel,
    storagePrefix,
    debug,
    onBecomeLeader,
    onLoseLeadership,
    onTabDetected,
  } = finalConfig;

  const tabId = useRef(generateTabId());
  const [isLeader, setIsLeader] = useState(false);
  const [tabCount, setTabCount] = useState(1);
  const [isChecking, setIsChecking] = useState(true);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const previousLeaderState = useRef(false);

  const storageKey = `${storagePrefix}-${appName}`;

  const getCurrentRecord = useCallback((): TabRecord | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      log(debug, 'Error reading from localStorage:', error);
      return null;
    }
  }, [storageKey, debug]);

  const setTabRecord = useCallback((record: TabRecord) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch (error) {
      log(debug, 'Error writing to localStorage:', error);
    }
  }, [storageKey, debug]);

  const removeTabRecord = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      log(debug, 'Error removing from localStorage:', error);
    }
  }, [storageKey, debug]);

  const checkLeadership = useCallback(() => {
    setIsChecking(true);
    
    const record = getCurrentRecord();
    const now = Date.now();
    const currentTabId = tabId.current;

    log(debug, 'Checking leadership:', { record, currentTabId, now });

    // If no record exists or the record is expired, claim leadership
    if (!record || now - record.timestamp > timeout) {
      log(debug, 'Claiming leadership - no record or expired');
      setTabRecord({ id: currentTabId, timestamp: now });
      setIsLeader(true);
      setTabCount(1);
    } 
    // If this tab is the leader, update timestamp
    else if (record.id === currentTabId) {
      log(debug, 'Updating leadership timestamp');
      setTabRecord({ id: currentTabId, timestamp: now });
      setIsLeader(true);
      setTabCount(1);
    } 
    // Another tab is the leader
    else {
      log(debug, 'Another tab is leader:', record.id);
      setIsLeader(false);
      setTabCount(2); // Simplified - could be enhanced to track actual count
      onTabDetected();
    }
    
    setIsChecking(false);
  }, [getCurrentRecord, setTabRecord, timeout, debug, onTabDetected]);

  const forceLeadership = useCallback(() => {
    log(debug, 'Forcing leadership for tab:', tabId.current);
    const now = Date.now();
    setTabRecord({ id: tabId.current, timestamp: now });
    setIsLeader(true);
    setTabCount(1);
  }, [setTabRecord, debug]);

  // Handle leadership state changes
  useEffect(() => {
    if (previousLeaderState.current !== isLeader) {
      if (isLeader) {
        log(debug, 'Tab became leader');
        onBecomeLeader();
      } else {
        log(debug, 'Tab lost leadership');
        onLoseLeadership();
      }
      previousLeaderState.current = isLeader;
    }
  }, [isLeader, onBecomeLeader, onLoseLeadership, debug]);

  // Set up BroadcastChannel for faster communication
  useEffect(() => {
    if (!useBroadcastChannel || typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel(storageKey);
    broadcastChannelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      log(debug, 'BroadcastChannel message received:', event.data);
      if (event.data.type === 'leadership-change') {
        // Trigger immediate check when another tab announces leadership
        setTimeout(checkLeadership, 100);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [storageKey, useBroadcastChannel, checkLeadership, debug]);

  // Set up storage event listener for cross-tab communication
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        log(debug, 'Storage change detected for key:', storageKey);
        checkLeadership();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, checkLeadership, debug]);

  // Set up periodic leadership checks
  useEffect(() => {
    // Initial check
    checkLeadership();

    // Set up interval
    intervalRef.current = setInterval(checkLeadership, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkLeadership, interval]);

  // Cleanup on unmount
  useEffect(() => {
    const currentTabId = tabId.current;
    
    const cleanup = () => {
      const record = getCurrentRecord();
      if (record && record.id === currentTabId) {
        log(debug, 'Cleaning up tab record on unmount');
        removeTabRecord();
      }
      
      // Notify other tabs via BroadcastChannel
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'tab-closing',
          tabId: currentTabId,
        });
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      cleanup();
    };

    // Handle visibility change (tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        log(debug, 'Tab became hidden, updating timestamp');
        // Update timestamp when tab becomes hidden to prevent takeover
        if (isLeader) {
          setTabRecord({ id: currentTabId, timestamp: Date.now() });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getCurrentRecord, removeTabRecord, setTabRecord, isLeader, debug]);

  return {
    isLeader,
    tabId: tabId.current,
    tabCount,
    isChecking,
    fallbackComponent,
    forceLeadership,
    checkLeadership,
    getCurrentRecord,
  };
}
