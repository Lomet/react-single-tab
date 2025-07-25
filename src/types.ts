import { ReactNode } from 'react';

export interface SingleTabConfig {
  /**
   * Unique identifier for your application. Used to namespace the tab enforcement.
   * @default 'my-app'
   */
  appName?: string;
  
  /**
   * Timeout in milliseconds before a tab is considered abandoned and can be taken over.
   * @default 15000
   */
  timeout?: number;
  
  /**
   * Interval in milliseconds for checking tab leadership status.
   * @default 10000
   */
  interval?: number;
  
  /**
   * Custom component to show when another tab is already active.
   * @default Built-in warning component
   */
  fallbackComponent?: ReactNode;
  
  /**
   * Whether to use BroadcastChannel API when available for faster communication.
   * @default true
   */
  useBroadcastChannel?: boolean;
  
  /**
   * Custom storage key prefix. Useful for testing or multiple app instances.
   * @default 'single-tab'
   */
  storagePrefix?: string;
  
  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean;
  
  /**
   * Callback fired when tab becomes leader.
   */
  onBecomeLeader?: () => void;
  
  /**
   * Callback fired when tab loses leadership.
   */
  onLoseLeadership?: () => void;
  
  /**
   * Callback fired when another tab is detected.
   */
  onTabDetected?: () => void;
}

export interface SingleTabState {
  /**
   * Whether this tab is currently the leader (allowed to run).
   */
  isLeader: boolean;
  
  /**
   * The unique ID of this tab.
   */
  tabId: string;
  
  /**
   * Number of tabs detected (including this one).
   */
  tabCount: number;
  
  /**
   * Whether the hook is currently checking for other tabs.
   */
  isChecking: boolean;
}

export interface TabRecord {
  id: string;
  timestamp: number;
}

export interface SingleTabMethods {
  /**
   * Force this tab to become leader (use with caution).
   */
  forceLeadership: () => void;
  
  /**
   * Manually trigger a leadership check.
   */
  checkLeadership: () => void;
  
  /**
   * Get the current tab record from storage.
   */
  getCurrentRecord: () => TabRecord | null;
}
