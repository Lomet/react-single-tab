import { useEffect, useState, useRef } from 'react';

// Generate unique tab ID
const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface Config {
  timeout?: number;
  appName?: string;
}

export function useSingleTabEnforcer(config: Config = {}) {
  const {
    timeout = 5000,
    appName = 'my-app'
  } = config;

  const storageKey = `single-tab-${appName}`;
  const [isLeader, setIsLeader] = useState(false);
  const tabId = useRef(generateTabId());

  useEffect(() => {
    const checkLeadership = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        const data = stored ? JSON.parse(stored) : null;
        const now = Date.now();

        // No leader or expired, OR this tab is already leader - take/keep leadership
        if (!data || (now - data.timestamp) > timeout || data.id === tabId.current) {
          localStorage.setItem(storageKey, JSON.stringify({
            id: tabId.current,
            timestamp: now
          }));
          setIsLeader(true);
        }
        // Another tab is leader
        else {
          setIsLeader(false);
        }
      } catch (error) {
        console.error('SingleTab error:', error);
        setIsLeader(true); // Fail safe
      }
    };

    // Initial check
    checkLeadership();

    // Check every 2 seconds
    const interval = setInterval(checkLeadership, 2000);

    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setTimeout(checkLeadership, 100);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      
      // Clean up storage when component unmounts if this tab was leader
      const stored = localStorage.getItem(storageKey);
      const data = stored ? JSON.parse(stored) : null;
      if (data && data.id === tabId.current) {
        localStorage.removeItem(storageKey);
      }
    };
  }, [storageKey, timeout]);

  const forceLeadership = () => {
    localStorage.setItem(storageKey, JSON.stringify({
      id: tabId.current,
      timestamp: Date.now()
    }));
    setIsLeader(true);
  };

  return {
    isLeader,
    forceLeadership
  };
}
