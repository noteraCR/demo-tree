// src/views/AdminDashboard/components/ExplorerNode.js
import React, { useState } from 'react';
// import Sparkline from './Sparkline';

const ExplorerNode = ({ agent, level, onSelect, onFocus }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = agent.children && agent.children.length > 0;

  return (
    <div className="explorer-node">
      <div className="node-row" style={{ paddingLeft: `${level * 25}px` }}>
        <span onClick={() => setIsOpen(!isOpen)}>
          {hasChildren ? (isOpen ? '▼' : '▶') : ' '}
        </span>
        <span>{agent.name}</span>
        {/* ... other data cells for direct refs, total, earnings ... */}
        {/* <Sparkline data={agent.earningsHistory} /> */}
        <div>
          <button onClick={() => onFocus(agent.id)}>Фокус</button>
          <button onClick={() => onSelect(agent.id)}>👁</button>
        </div>
      </div>
      {isOpen && hasChildren && (
        <div className="node-children">
          {agent.children.map(child => (
            <ExplorerNode
              key={child.id}
              agent={child}
              level={level + 1}
              onSelect={onSelect}
              onFocus={onFocus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorerNode;