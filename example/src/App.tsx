import React from 'react';
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

// Custom fallback component example
const CustomFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '20px'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxWidth: '400px'
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
      <h1 style={{ color: '#1a73e8', marginBottom: '16px' }}>App Already Running</h1>
      <p style={{ color: '#5f6368', marginBottom: '24px', lineHeight: '1.5' }}>
        This application is already open in another tab. Please close this tab or 
        the other one to continue.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={() => window.close()}
          style={{
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Close This Tab
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: 'white',
            color: '#1a73e8',
            border: '2px solid #1a73e8',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

function App() {
  const {
    isLeader,
    tabId,
    tabCount,
    isChecking,
    fallbackComponent,
    forceLeadership,
    checkLeadership,
    getCurrentRecord
  } = useSingleTabEnforcer({
    appName: 'demo-app',
    timeout: 10000, // 10 seconds
    interval: 5000,  // Check every 5 seconds
    fallbackComponent: <CustomFallback />,
    debug: true,
    onBecomeLeader: () => console.log('🎉 This tab became the leader!'),
    onLoseLeadership: () => console.log('😢 This tab lost leadership'),
    onTabDetected: () => console.log('👀 Another tab was detected'),
  });

  // Show fallback if not leader
  if (!isLeader) {
    return <>{fallbackComponent}</>;
  }

  // Main application content
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <h1 style={{ color: '#1a73e8', marginBottom: '8px' }}>
          🎯 React Single Tab Enforcer Demo
        </h1>
        <p style={{ color: '#5f6368', margin: 0 }}>
          This content will only show in one tab at a time
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #4caf50'
        }}>
          <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✅ Tab Status</h3>
          <p><strong>Status:</strong> Leader Tab</p>
          <p><strong>Tab ID:</strong> {tabId}</p>
          <p><strong>Tab Count:</strong> {tabCount}</p>
          <p><strong>Checking:</strong> {isChecking ? 'Yes' : 'No'}</p>
        </div>

        <div style={{
          backgroundColor: '#fff3e0',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #ff9800'
        }}>
          <h3 style={{ color: '#f57c00', marginTop: 0 }}>🎛️ Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={checkLeadership}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Manual Check
            </button>
            <button 
              onClick={forceLeadership}
              style={{
                backgroundColor: '#ff5722',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Force Leadership
            </button>
            <button 
              onClick={() => console.log('Current Record:', getCurrentRecord())}
              style={{
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Log Record
            </button>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>📝 Instructions</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>Open this app in multiple tabs or windows</li>
          <li>Only one tab will show this content (the leader)</li>
          <li>Other tabs will show the fallback component</li>
          <li>Close the leader tab to see another tab take over</li>
          <li>Check the browser console for debug logs</li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#1976d2', marginTop: 0 }}>🚀 Your App Content</h3>
        <p>
          This is where your actual application content would go. Since this tab
          is the leader, it's safe to run expensive operations, make API calls,
          establish WebSocket connections, etc.
        </p>
        <p>
          The single-tab enforcement ensures that only one instance of your app
          is active at a time, preventing issues with:
        </p>
        <ul>
          <li>Duplicate WebSocket connections</li>
          <li>Multiple timers or intervals</li>
          <li>Conflicting local storage updates</li>
          <li>Authentication token conflicts</li>
          <li>Resource-intensive operations</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
