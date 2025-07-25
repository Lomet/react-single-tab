import {
  generateTabId,
  log,
  isBroadcastChannelSupported,
  isLocalStorageAvailable,
  safeJsonParse,
} from '../utils';

describe('utils', () => {
  describe('generateTabId', () => {
    it('should generate unique tab IDs', () => {
      const id1 = generateTabId();
      const id2 = generateTabId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^tab-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^tab-\d+-[a-z0-9]+$/);
    });
  });

  describe('log', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    afterEach(() => {
      consoleSpy.mockClear();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it('should log when debug is true', () => {
      log(true, 'test message', 'arg1', 'arg2');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[SingleTabEnforcer] test message',
        'arg1',
        'arg2'
      );
    });

    it('should not log when debug is false', () => {
      log(false, 'test message', 'arg1', 'arg2');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('isBroadcastChannelSupported', () => {
    it('should return true when BroadcastChannel is available', () => {
      (globalThis as any).BroadcastChannel = jest.fn();
      
      expect(isBroadcastChannelSupported()).toBe(true);
    });

    it('should return false when BroadcastChannel is not available', () => {
      const originalBroadcastChannel = (globalThis as any).BroadcastChannel;
      delete (globalThis as any).BroadcastChannel;
      
      expect(isBroadcastChannelSupported()).toBe(false);
      
      (globalThis as any).BroadcastChannel = originalBroadcastChannel;
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage not available');
      });
      
      expect(isLocalStorageAvailable()).toBe(false);
      
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for empty string', () => {
      const fallback = { default: true };
      const result = safeJsonParse('', fallback);
      expect(result).toBe(fallback);
    });
  });
});
