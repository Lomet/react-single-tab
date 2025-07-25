# React Single Tab Enforcer

A modern, robust React hook for enforcing single-tab behavior in web applications with TypeScript support.

[![npm version](https://badge.fury.io/js/react-single-tab-enforcer.svg)](https://badge.fury.io/js/react-single-tab-enforcer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Modern Hook API** - Clean, declarative React hook interface
- 🔧 **TypeScript Support** - Full type safety with included type definitions
- ⚡ **Fast Communication** - Uses BroadcastChannel API when available, falls back to localStorage
- 🛡️ **Robust Error Handling** - Graceful fallbacks for storage limitations and browser compatibility
- 🎨 **Customizable UI** - Provide your own fallback component or use the built-in one
- 🧪 **Well Tested** - Comprehensive test suite with >80% coverage
- 📦 **Zero Dependencies** - Only requires React as a peer dependency
- 🔄 **Automatic Cleanup** - Handles tab close events and memory cleanup
- 🎛️ **Configurable** - Timeout, intervals, and behavior options

## 🚀 Installation

```bash
npm install react-single-tab-enforcer
```

or

```bash
yarn add react-single-tab-enforcer
```

## 📖 Basic Usage

```tsx
import React from 'react';
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

function App() {
  const { isLeader, fallbackComponent } = useSingleTabEnforcer({
    appName: 'my-awesome-app',
    timeout: 15000,
  });

  // If this tab is not the leader, show fallback
  if (!isLeader) {
    return fallbackComponent;
  }

  // Your main app content
  return (
    <div>
      <h1>My App</h1>
      <p>This will only render in one tab at a time!</p>
    </div>
  );
}

export default App;
```

## 🎛️ Configuration Options

```tsx
interface SingleTabConfig {
  /** Unique identifier for your application */
  appName?: string; // default: 'my-app'
  
  /** Timeout before a tab is considered abandoned (ms) */
  timeout?: number; // default: 15000
  
  /** Interval for checking tab leadership (ms) */
  interval?: number; // default: 10000
  
  /** Custom component to show when another tab is active */
  fallbackComponent?: ReactNode;
  
  /** Use BroadcastChannel for faster communication */
  useBroadcastChannel?: boolean; // default: true
  
  /** Custom storage key prefix */
  storagePrefix?: string; // default: 'single-tab'
  
  /** Enable debug logging */
  debug?: boolean; // default: false
  
  /** Callback when tab becomes leader */
  onBecomeLeader?: () => void;
  
  /** Callback when tab loses leadership */
  onLoseLeadership?: () => void;
  
  /** Callback when another tab is detected */
  onTabDetected?: () => void;
}
```

## 🎨 Custom Fallback Component

```tsx
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

const CustomFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>🚫 App Already Open</h2>
    <p>Please close this tab and use the existing one.</p>
    <button onClick={() => window.close()}>Close Tab</button>
  </div>
);

function App() {
  const { isLeader, fallbackComponent } = useSingleTabEnforcer({
    appName: 'my-app',
    fallbackComponent: <CustomFallback />,
  });

  return isLeader ? <MainApp /> : fallbackComponent;
}
```

## 🔍 Advanced Usage with State and Methods

```tsx
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

function App() {
  const {
    isLeader,
    tabId,
    tabCount,
    isChecking,
    fallbackComponent,
    forceLeadership,
    checkLeadership,
    getCurrentRecord,
  } = useSingleTabEnforcer({
    appName: 'advanced-app',
    debug: true,
    onBecomeLeader: () => console.log('Became leader!'),
    onLoseLeadership: () => console.log('Lost leadership'),
    onTabDetected: () => console.log('Another tab detected'),
  });

  if (!isLeader) {
    return (
      <div>
        {fallbackComponent}
        <button onClick={forceLeadership}>
          Force Take Control
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Leader Tab</h1>
      <p>Tab ID: {tabId}</p>
      <p>Tab Count: {tabCount}</p>
      <p>Checking: {isChecking ? 'Yes' : 'No'}</p>
      <button onClick={checkLeadership}>Manual Check</button>
      <button onClick={() => console.log(getCurrentRecord())}>
        Log Current Record
      </button>
    </div>
  );
}
```

## 🔧 Utility Functions

```tsx
import {
  generateTabId,
  isBroadcastChannelSupported,
  isLocalStorageAvailable,
} from 'react-single-tab-enforcer';

// Generate a unique tab ID
const tabId = generateTabId();

// Check browser support
if (isBroadcastChannelSupported()) {
  console.log('BroadcastChannel is supported');
}

if (isLocalStorageAvailable()) {
  console.log('localStorage is available');
}
```

## 🧪 Testing

The package includes comprehensive tests. To run them:

```bash
npm test
```

For coverage:

```bash
npm run test:coverage
```

## 🏗️ How It Works

1. **Tab Registration**: Each tab generates a unique ID and attempts to register as the leader
2. **Leadership Logic**: Only one tab can be leader at a time, determined by localStorage timestamps
3. **Communication**: Tabs communicate via BroadcastChannel (fast) or storage events (fallback)
4. **Timeout Handling**: Abandoned tabs (crashed, closed) are detected via timestamp expiration
5. **Cleanup**: Proper cleanup on tab close prevents ghost tabs

## 🌐 Browser Support

- **Modern Browsers**: Full support with BroadcastChannel
- **Legacy Browsers**: Fallback to localStorage + storage events
- **Required**: localStorage support (available in all modern browsers)

## 📝 TypeScript

This package is written in TypeScript and includes complete type definitions. No additional `@types` packages needed!

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs to the main branch.

## 📄 License

MIT © [Your Name]

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/react-single-tab-enforcer)
- [NPM Package](https://www.npmjs.com/package/react-single-tab-enforcer)
- [Issues](https://github.com/yourusername/react-single-tab-enforcer/issues)

---

Made with ❤️ for the React community
