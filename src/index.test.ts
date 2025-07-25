import { useSingleTabEnforcer } from './index';

describe('Package Index', () => {
  it('should export useSingleTabEnforcer hook', () => {
    expect(typeof useSingleTabEnforcer).toBe('function');
  });
});
