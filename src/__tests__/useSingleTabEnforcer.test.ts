import { renderHook, act } from '@testing-library/react';
import { useSingleTabEnforcer } from '../useSingleTabEnforcer';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock BroadcastChannel
const mockBroadcastChannel = {
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
};

// Mock globals for browser APIs
(globalThis as any).BroadcastChannel = jest.fn(() => mockBroadcastChannel);

// Mock timers
jest.useFakeTimers();

describe('useSingleTabEnforcer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should become leader when no other tabs exist', () => {
    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
    expect(result.current.tabCount).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should not become leader when another tab exists', () => {
    // Simulate another tab's record
    const existingRecord = {
      id: 'existing-tab',
      timestamp: Date.now(),
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(existingRecord));

    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(false);
    expect(result.current.tabCount).toBe(2);
  });

  it('should take over leadership when existing tab times out', () => {
    // Simulate an expired tab record
    const expiredRecord = {
      id: 'expired-tab',
      timestamp: Date.now() - 20000, // 20 seconds ago (older than default 15s timeout)
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(expiredRecord));

    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
    expect(result.current.tabCount).toBe(1);
  });

  it('should call onBecomeLeader callback when becoming leader', () => {
    const onBecomeLeader = jest.fn();
    const { result } = renderHook(() => 
      useSingleTabEnforcer({ onBecomeLeader })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onBecomeLeader).toHaveBeenCalledTimes(1);
    expect(result.current.isLeader).toBe(true);
  });

  it('should call onTabDetected when another tab is found', () => {
    const onTabDetected = jest.fn();
    
    // Set up existing tab
    const existingRecord = {
      id: 'existing-tab',
      timestamp: Date.now(),
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(existingRecord));

    renderHook(() => 
      useSingleTabEnforcer({ onTabDetected })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    // The callback might be called multiple times (initial check + interval checks)
    // so we just verify it was called at least once
    expect(onTabDetected).toHaveBeenCalled();
  });

  it('should force leadership when forceLeadership is called', () => {
    // Set up existing tab
    const existingRecord = {
      id: 'existing-tab',
      timestamp: Date.now(),
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(existingRecord));

    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(false);

    act(() => {
      result.current.forceLeadership();
    });

    expect(result.current.isLeader).toBe(true);
  });

  it('should use custom app name in storage key', () => {
    const customAppName = 'my-custom-app';
    renderHook(() => useSingleTabEnforcer({ appName: customAppName }));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `single-tab-${customAppName}`,
      expect.any(String)
    );
  });

  it('should use custom timeout value', () => {
    const customTimeout = 5000;
    
    // Set up expired tab with custom timeout
    const expiredRecord = {
      id: 'expired-tab',
      timestamp: Date.now() - 6000, // 6 seconds ago
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(expiredRecord));

    const { result } = renderHook(() => 
      useSingleTabEnforcer({ timeout: customTimeout })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
  });

  it('should update timestamp periodically when leader', () => {
    const { result } = renderHook(() => useSingleTabEnforcer({ interval: 1000 }));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
    const initialCalls = localStorageMock.setItem.mock.calls.length;

    // Fast-forward time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(localStorageMock.setItem.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('should clean up on unmount', () => {
    const { result, unmount } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);

    unmount();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('single-tab-my-app');
  });

  it('should return current record when getCurrentRecord is called', () => {
    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const record = result.current.getCurrentRecord();
    expect(record).toMatchObject({
      id: result.current.tabId,
      timestamp: expect.any(Number),
    });
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useSingleTabEnforcer({ debug: true }));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    // Should not crash and should handle error gracefully
    expect(result.current.tabId).toBeDefined();
  });

  it('should setup BroadcastChannel when enabled', () => {
    renderHook(() => useSingleTabEnforcer({ useBroadcastChannel: true }));

    expect((globalThis as any).BroadcastChannel).toHaveBeenCalledWith('single-tab-my-app');
    expect(mockBroadcastChannel.addEventListener).toHaveBeenCalledWith(
      'message', 
      expect.any(Function)
    );
  });

  it('should not setup BroadcastChannel when disabled', () => {
    jest.clearAllMocks();
    
    renderHook(() => useSingleTabEnforcer({ useBroadcastChannel: false }));

    expect((globalThis as any).BroadcastChannel).not.toHaveBeenCalled();
  });
});
