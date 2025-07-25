# React Single Tab Enforcer

A simple React hook for enforcing single-tab behavior with TypeScript support. Only one tab can be the "leader" at a time, perfect for applications where multiple tabs could cause conflicts.

## Features

- 🔒 **Single Tab Leadership** - Only one tab is active (leader) at a time
- ⚡ **Automatic Switching** - When leader tab closes, another tab automatically takes over
- 🔄 **Real-time Updates** - Uses localStorage events for instant cross-tab communication
- ⏱️ **Timeout Handling** - Configurable timeout for inactive leaders
- 🛡️ **TypeScript Support** - Full TypeScript definitions included
- 🎯 **Simple API** - Just one hook with clear return values

## Installation

```bash
npm install react-single-tab-enforcer
```

## Basic Usage

```javascript
import React from 'react';
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

function App() {
  const { isLeader, forceLeadership } = useSingleTabEnforcer({
    appName: 'my-app',
    timeout: 5000
  });

  return (
    <div>
      <h1>{isLeader ? 'Leader Tab' : 'Follower Tab'}</h1>
      <p>
        {isLeader 
          ? 'This tab is in control' 
          : 'Another tab is currently active'
        }
      </p>
      <button onClick={forceLeadership}>
        Force Leadership
      </button>
    </div>
  );
}
```

## API

### `useSingleTabEnforcer(config)`

#### Parameters

- **config** (optional): Configuration object
  - **appName** (string, default: 'my-app'): Unique identifier for your app
  - **timeout** (number, default: 5000): Milliseconds before a tab is considered inactive

#### Returns

- **isLeader** (boolean): Whether this tab is currently the leader
- **forceLeadership** (function): Force this tab to become the leader

## How It Works

1. **Leadership Election**: When multiple tabs are open, only one becomes the leader
2. **Heartbeat System**: Leader tabs update their timestamp every 2 seconds
3. **Storage Events**: Tabs listen for localStorage changes to react instantly
4. **Automatic Cleanup**: When a tab closes, it cleans up its storage entry
5. **Timeout Handling**: If a leader becomes inactive, others can take over

## Example Use Cases

- **Database Connections**: Only one tab maintains the real-time connection
- **Background Sync**: Prevent multiple tabs from syncing simultaneously
- **Resource Management**: Avoid conflicts in resource-intensive operations
- **User Experience**: Show different UI states for active vs inactive tabs

## Running the Demo

To see the hook in action:

```bash
# Clone the repository
git clone <repository-url>
cd react-single-tab-enforcer

# Install dependencies
npm install

# Start the demo app
cd demo-app
npm install
npm start
```

Then:
1. Open `http://localhost:3000` in multiple browser tabs
2. Watch how only one tab becomes the "leader" (green)
3. Close the leader tab and see another tab take over
4. Try the "Force Leadership" button to steal control

## Configuration Examples

### Basic Setup
```javascript
const { isLeader } = useSingleTabEnforcer();
```

### Custom App Name
```javascript
const { isLeader } = useSingleTabEnforcer({
  appName: 'chat-app'
});
```

### Custom Timeout
```javascript
const { isLeader } = useSingleTabEnforcer({
  appName: 'sync-app',
  timeout: 10000 // 10 seconds
});
```

## Browser Support

Works in all modern browsers that support:
- localStorage
- Storage events
- React 16.8+ (hooks)

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test with the demo app
5. Submit a pull request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run the demo
cd demo-app && npm start
```
