import React from 'react';
import { useSingleTabEnforcer } from 'react-single-tab-enforcer';

function App() {
  const { isLeader, forceLeadership } = useSingleTabEnforcer({
    appName: 'demo-app'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Single Tab Demo</h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: isLeader ? '#90EE90' : '#FFB6C1',
        marginBottom: '20px'
      }}>
        <h2>{isLeader ? 'LEADER TAB' : 'FOLLOWER TAB'}</h2>
        <p>Open multiple tabs to see the effect</p>
      </div>

      <button onClick={forceLeadership}>
        Force Leadership
      </button>
    </div>
  );
}

export default App;
