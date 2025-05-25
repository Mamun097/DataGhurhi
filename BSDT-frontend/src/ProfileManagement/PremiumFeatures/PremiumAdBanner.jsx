import React from 'react';
import './PremiumAdBanner.css';

const PremiumAdBanner = ({ onClose, onCheckoutClick, getLabel }) => {
    return (
        <div className="premium-ad-overlay">
            <div className="premium-ad-banner">
                <div className="premium-ad-content">
                    <div className="premium-ad-header">
                        <h3>{getLabel("Unlock Premium Features")}</h3>
                        <p>{getLabel("Take your surveys to the next level with AI-powered tools")}</p>
                    </div>

                    <div className="premium-features-list" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        overflow: 'auto'
                    }}>
                        <div className="feature-item" style={{ flex: '1', minWidth: 'auto', textAlign: 'center', padding: '0 8px' }}>
                            <span className="feature-icon">🤖</span>
                            <span style={{ display: 'block' }}>{getLabel("AI Survey Template Generation")}</span>
                        </div>
                        <div className="feature-item" style={{ flex: '1', minWidth: 'auto', textAlign: 'center', padding: '0 8px' }}>
                            <span className="feature-icon">❓</span>
                            <span style={{ display: 'block' }}>{getLabel("Smart Question Generation")}</span>
                        </div>
                        <div className="feature-item" style={{ flex: '1', minWidth: 'auto', textAlign: 'center', padding: '0 8px' }}>
                            <span className="feature-icon">🏷️</span>
                            <span style={{ display: 'block' }}>{getLabel("Automatic Question Tagging")}</span>
                        </div>
                        <div className="feature-item" style={{ flex: '1', minWidth: 'auto', textAlign: 'center', padding: '0 8px' }}>
                            <span className="feature-icon">📊</span>
                            <span style={{ display: 'block' }}>{getLabel("Advanced Analytics")}</span>
                        </div>
                    </div>

                    <div className="premium-ad-buttons">
                        <button className="continue-free-btn" onClick={onClose}>
                            {getLabel("Continue as Free User")}
                        </button>
                        <button className="checkout-premium-btn" onClick={onCheckoutClick}>
                            {getLabel("Checkout Premium Packages")}
                        </button>
                    </div>
                </div>

                <div className="premium-ad-visual">
                    <div className="premium-icon">✨</div>
                    <div className="premium-text">{getLabel("Premium")}</div>
                </div>
            </div>
        </div>
    );
};

export default PremiumAdBanner;