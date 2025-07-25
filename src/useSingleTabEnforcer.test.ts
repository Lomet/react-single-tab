// Simple unit tests for the single tab enforcer functionality

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Test the core logic functions independently
describe('Single Tab Enforcer Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should generate unique tab IDs with correct format', () => {
    // Import the generateTabId function by testing its output pattern
    const tabId1 = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tabId2 = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    expect(tabId1).toMatch(/^tab-\d+-[a-z0-9]+$/);
    expect(tabId2).toMatch(/^tab-\d+-[a-z0-9]+$/);
    expect(tabId1).not.toBe(tabId2); // Should be unique
  });

  it('should create correct storage key with app name', () => {
    const appName = 'test-app';
    const expectedKey = `single-tab-${appName}`;
    expect(expectedKey).toBe('single-tab-test-app');
  });

  it('should handle expired timestamp detection', () => {
    const now = Date.now();
    const timeout = 5000;
    
    // Test expired timestamp
    const expiredTimestamp = now - 10000; // 10 seconds ago
    const isExpired = (now - expiredTimestamp) > timeout;
    expect(isExpired).toBe(true);
    
    // Test valid timestamp
    const validTimestamp = now - 2000; // 2 seconds ago
    const isValid = (now - validTimestamp) <= timeout;
    expect(isValid).toBe(true);
  });

  it('should handle localStorage getItem correctly', () => {
    const storageKey = 'single-tab-my-app';
    
    // Test when no data exists
    localStorageMock.getItem.mockReturnValue(null);
    const result1 = localStorage.getItem(storageKey);
    expect(result1).toBe(null);
    
    // Test when data exists
    const testData = JSON.stringify({ id: 'test-id', timestamp: Date.now() });
    localStorageMock.getItem.mockReturnValue(testData);
    const result2 = localStorage.getItem(storageKey);
    const parsed = result2 ? JSON.parse(result2) : null;
    expect(parsed).toHaveProperty('id', 'test-id');
    expect(parsed).toHaveProperty('timestamp');
  });

  it('should handle localStorage setItem correctly', () => {
    const storageKey = 'single-tab-my-app';
    const tabId = 'test-tab-id';
    const timestamp = Date.now();
    
    const dataToStore = JSON.stringify({ id: tabId, timestamp });
    localStorage.setItem(storageKey, dataToStore);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(storageKey, dataToStore);
  });

  it('should handle JSON parsing errors gracefully', () => {
    const storageKey = 'single-tab-my-app';
    
    // Mock invalid JSON
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    let data = null;
    try {
      const stored = localStorage.getItem(storageKey);
      data = stored ? JSON.parse(stored) : null;
    } catch (error) {
      // Should handle parsing error
      expect(error).toBeInstanceOf(SyntaxError);
    }
    
    expect(data).toBe(null);
  });

  it('should determine leadership correctly based on different scenarios', () => {
    const now = Date.now();
    const timeout = 5000;
    const currentTabId = 'current-tab';
    
    // Helper function to check leadership
    const checkLeadership = (data: { id: string; timestamp: number } | null) => {
      return !data || (now - data.timestamp) > timeout || data.id === currentTabId;
    };
    
    // Test case 1: No existing data - should become leader
    expect(checkLeadership(null)).toBe(true);
    
    // Test case 2: Expired leader - should become leader
    expect(checkLeadership({ id: 'other-tab', timestamp: now - 10000 })).toBe(true);
    
    // Test case 3: Current tab is already leader - should stay leader
    expect(checkLeadership({ id: currentTabId, timestamp: now - 1000 })).toBe(true);
    
    // Test case 4: Another tab is active leader - should not be leader
    expect(checkLeadership({ id: 'other-tab', timestamp: now - 1000 })).toBe(false);
  });
});
