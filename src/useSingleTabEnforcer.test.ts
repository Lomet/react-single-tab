import { renderHook, act } from '@testing-library/react';
import { useSingleTabEnforcer } from './useSingleTabEnforcer';

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

// Mock timers
jest.useFakeTimers();

describe('useSingleTabEnforcer Hook', () => {
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
  });

  it('should take over leadership when existing tab times out', () => {
    // Simulate an expired tab record
    const expiredRecord = {
      id: 'expired-tab',
      timestamp: Date.now() - 10000, // 10 seconds ago (older than default 5s timeout)
    };
    localStorageMock.setItem('single-tab-my-app', JSON.stringify(expiredRecord));

    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
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
    const customTimeout = 3000;
    
    // Set up expired tab with custom timeout
    const expiredRecord = {
      id: 'expired-tab',
      timestamp: Date.now() - 4000, // 4 seconds ago
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
    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isLeader).toBe(true);
    const initialCalls = localStorageMock.setItem.mock.calls.length;

    // Fast-forward time to trigger interval (default is 2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
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

    // Should clean up storage if this tab was leader
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('single-tab-my-app');
  });

  it('should handle localStorage errors gracefully', () => {
    // Create a separate mock just for this test
    const errorLocalStorageMock = {
      ...localStorageMock,
      setItem: jest.fn(() => {
        throw new Error('Storage quota exceeded');
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: errorLocalStorageMock,
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useSingleTabEnforcer());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    // Should not crash and should handle error gracefully
    expect(result.current.isLeader).toBe(true); // Should fail safe to leader
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    
    // Restore original localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });
});
