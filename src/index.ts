export { useSingleTabEnforcer } from './useSingleTabEnforcer';
export { DefaultFallbackComponent } from './components/DefaultFallbackComponent';
export type {
  SingleTabConfig,
  SingleTabState,
  SingleTabMethods,
  TabRecord,
} from './types';
export {
  generateTabId,
  isBroadcastChannelSupported,
  isLocalStorageAvailable,
} from './utils';
