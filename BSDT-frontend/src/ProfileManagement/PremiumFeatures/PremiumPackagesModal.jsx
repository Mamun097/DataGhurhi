import React from 'react';
import './PremiumPackagesModal.css';

const PremiumPackagesModal = ({ isOpen, onClose, getLabel }) => {
  if (!isOpen) return null;

  const packages = [
    {
      id: 'starter',
      tokens: '1K',
      originalPrice: 50,
      discountPrice: 50,
      discount: 0,
      popular: false,
      features: [
        getLabel("1,000 AI Tokens"),
        getLabel("Basic Survey Templates"),
        getLabel("Question Generation"),
        getLabel("Automatic Question Tagging")
      ]
    },
    {
      id: 'professional',
      tokens: '10K',
      originalPrice: 500,
      discountPrice: 450,
      discount: 10,
      popular: true,
      features: [
        getLabel("10,000 AI Tokens"),
        getLabel("Advanced Survey Templates"),
        getLabel("Smart Question Generation"),
        getLabel("Automatic Question Tagging"),
        // getLabel("Priority Support"),
        // getLabel("Analytics Dashboard")
      ]
    },
    {
      id: 'enterprise',
      tokens: '100K',
      originalPrice: 4500,
      discountPrice: 3990,
      discount: 11,
      popular: false,
      features: [
        getLabel("100,000 AI Tokens"),
        getLabel("Unlimited Advance Survey Templates"),
        getLabel("Advanced AI Features"),
        getLabel("Advaced Smart Question Generation"),
        getLabel("Automatic Question Tagging"),
        // getLabel("White-label Solutions"),
        // getLabel("Dedicated Account Manager"),
        // getLabel("API Access")
      ]
    }
  ];

  const handleBuyClick = (packageId) => {
    console.log(`Buying package: ${packageId}`);
    // Payment gateway integration will be implemented here
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getLabel("Choose Your Premium Package")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="premium-features-showcase">
          <h3>{getLabel("Unlock Powerful AI Features")}</h3>
          <div className="showcase-features">
            <div className="showcase-item">
              <div className="showcase-icon">🤖</div>
              <div>
                <h4>{getLabel("AI Survey Generation")}</h4>
                <p>{getLabel("Create professional surveys in seconds with AI assistance")}</p>
              </div>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">❓</div>
              <div>
                <h4>{getLabel("Smart Question Creation")}</h4>
                <p>{getLabel("Generate relevant questions based on your research goals")}</p>
              </div>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">🏷️</div>
              <div>
                <h4>{getLabel("Automatic Tagging")}</h4>
                <p>{getLabel("Organize questions with intelligent tagging system")}</p>
              </div>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">📊</div>
              <div>
                <h4>{getLabel("Advanced Analytics")}</h4>
                <p>{getLabel("Get deeper insights with AI-powered analysis")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="packages-container">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && (
                <div className="popular-badge">{getLabel("Most Popular")}</div>
              )}
              
              <div className="package-header">
                <h3>{pkg.tokens} {getLabel("Tokens")}</h3>
                <div className="price-section">
                  {pkg.discount > 0 && (
                    <div className="original-price">৳{pkg.originalPrice}</div>
                  )}
                  <div className="current-price">৳{pkg.discountPrice}</div>
                  {pkg.discount > 0 && (
                    <div className="discount-badge">{pkg.discount}% {getLabel("OFF")}</div>
                  )}
                </div>
                {pkg.discount > 0 && (
                  <div className="savings">
                    {getLabel("Save")} ৳{pkg.originalPrice - pkg.discountPrice}!
                  </div>
                )}
              </div>
              
              <div className="package-features">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="feature">
                    <span className="check-icon">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
              
              <button 
                className="buy-btn"
                onClick={() => handleBuyClick(pkg.id)}
              >
                {getLabel("Buy Now")}
              </button>
            </div>
          ))}
        </div>
        
        <div className="modal-footer">
          <p className="guarantee">
            <span className="guarantee-icon">🛡️</span>
            {getLabel("Payment is 100% secure and protected.")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPackagesModal;