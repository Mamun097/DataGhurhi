import React from 'react';
import './TokenDisplay.css';

const TokenDisplay = ({ availableTokens, userType, getLabel }) => {
  return (
    <div className="token-display">
      <div className="token-info">
        
        <div className="token-details">
          <span className="token-count"><span className="token-icon">৳ </span>{(availableTokens || 0).toFixed(2)}</span>
          <span className="token-label">{getLabel("Available Balance")}</span>
        </div>
      </div>
      {userType === 'premium' && (
        <div className="premium-badge-small">
          <span className="premium-icon">✨</span>
          <span>{getLabel("Premium")}</span>
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;