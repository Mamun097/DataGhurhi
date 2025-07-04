import React, { useState, useEffect } from 'react';
import './PremiumPackagesModal.css';
import CustomPackageBuilder from './CustomPackage';
import './CustomPackage.css';

// Tab Navigation Component
const PackageTabNavigation = ({ activeTab, onTabChange, getLabel }) => {
  return (
    <div className="package-tabs">
      <button
        className={`tab-button ${activeTab === 'fixed' ? 'active' : ''}`}
        onClick={() => onTabChange('fixed')}
      >
        {getLabel("Fixed Packages")}
      </button>
      <button
        className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
        onClick={() => onTabChange('custom')}
      >
        {getLabel("Custom Package")}
      </button>
    </div>
  );
};

// Main Modal Component (Enhanced)
const PremiumPackagesModal = ({ isOpen, onClose, getLabel }) => {
  const [packages, setPackages] = useState([]);
  const [mostPopularPackageId, setMostPopularPackageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fixed');
  const [customPackage, setCustomPackage] = useState({
    items: { tag: 0, question: 0, survey: 0 },
    validity: null,
    totalPrice: 0,
    isValid: false
  });

  // Fetch packages and most popular package when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPackagesData();
    }
  }, [isOpen]);

  const fetchPackagesData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all packages
      const packagesResponse = await fetch('http://localhost:2000/api/admin/get-all-packages');
      if (!packagesResponse.ok) {
        throw new Error('Failed to fetch packages');
      }
      const packagesData = await packagesResponse.json();

      // Extract the packages array from the response
      console.log('Packages API Response:', packagesData);
      const packagesArray = packagesData.packages || packagesData || [];

      // Fetch most popular package
      const popularResponse = await fetch('http://localhost:2000/api/admin/most-popular-package');
      let popularPackageId = null;
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        popularPackageId = popularData.popularPackageId;
        console.log('Popular Package API Response:', popularData);
      } else {
        console.warn('Failed to fetch most popular package, but continuing...');
      }

      console.log('Most Popular Package ID:', popularPackageId);
      console.log('Packages Array:', packagesArray);
      console.log('Packages Array Length:', packagesArray.length);

      setPackages(packagesArray);
      setMostPopularPackageId(popularPackageId);

    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(0)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  const calculateDiscount = (originalPrice, discountPrice) => {
    if (originalPrice <= discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const formatValidityPeriod = (validity) => {
    if (!validity) return null;

    if (validity % 30 === 0) {
      return getLabel(`${validity / 30} Months`);
    } else if (validity % 365 === 0) {
      return getLabel(`${validity / 365} Years`);
    } else {
      return getLabel(`${validity} Days`);
    }
  };

  const getValidityType = (validity) => {
    if (validity >= 36) return 'premium';
    if (validity >= 12) return 'popular';
    return 'standard';
  };

  const getPackageFeatures = (pkg) => {
    const features = [];

    if (pkg.survey > 0) {
      features.push(`${pkg.survey.toLocaleString()} ${getLabel("Automatic Survey Template Generation")}`);
    }
    if (pkg.question > 0) {
      features.push(`${pkg.question.toLocaleString()} ${getLabel("Automatic Question Generation")}`);
    }
    if (pkg.tag > 0) {
      features.push(`${pkg.tag.toLocaleString()} ${getLabel("Automatic Question Tag Generation")}`);
    }
    

    if (pkg.title.toLowerCase().includes('starter')) {
      features.push(getLabel("Basic Survey Templates"));
    } else if (pkg.title.toLowerCase().includes('professional') || pkg.title.toLowerCase().includes('yearly')) {
      features.push(getLabel("Advanced Survey Templates"));
    } else if (pkg.title.toLowerCase().includes('enterprise')) {
      features.push(getLabel("Premium Survey Templates"));
    }

    return features;
  };

  const handleBuyClick = (packageId) => {
    console.log(`Buying package: ${packageId}`);
    // Payment gateway integration will be implemented here
  };

  const handleCustomPackageChange = (packageData) => {
    setCustomPackage(packageData);
  };

  const handleBuyCustomPackage = () => {
    if (customPackage.isValid) {
      console.log('Buying custom package:', customPackage);
      // Payment gateway integration for custom package
    }
  };

  if (!isOpen) return null;

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
          </div>
        </div>

        <PackageTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getLabel={getLabel}
        />

        <div className="tab-content">
          {activeTab === 'fixed' && (
            <>
              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>{getLabel("Loading packages...")}</p>
                </div>
              )}

              {error && (
                <div className="error-container">
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <p>{getLabel("Failed to load packages. Please try again.")}</p>
                    <button className="retry-btn" onClick={fetchPackagesData}>
                      {getLabel("Retry")}
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && packages.length > 0 && (
                <div className="packages-container">
                  {packages.map((pkg) => {
                    const isPopular = pkg.package_id === mostPopularPackageId;
                    const discount = calculateDiscount(pkg.original_price, pkg.discount_price);
                    const validityPeriod = formatValidityPeriod(pkg.validity);
                    const validityType = getValidityType(pkg.validity);

                    return (
                      <div key={pkg.package_id} className={`package-card ${isPopular ? 'popular' : ''}`}>
                        {isPopular && (
                          <div className="popular-badge">{getLabel("Most Popular")}</div>
                        )}

                        <div className="package-header">
                          <h3>{pkg.title}</h3>

                          <div className="price-section">
                            {discount > 0 && (
                              <div className="original-price">৳{pkg.original_price}</div>
                            )}
                            <div className="current-price">৳{pkg.discount_price}</div>
                            {discount > 0 && (
                              <div className="discount-badge">{discount}% {getLabel("OFF")}</div>
                            )}
                          </div>

                          {validityPeriod && (
                            <div className={`validity-display ${validityType}`}>
                              <span className="validity-label">{getLabel("For ")}</span>
                              <span className="validity-period">{validityPeriod}</span>
                            </div>
                          )}
                        </div>

                        <div className="package-features">
                          {getPackageFeatures(pkg).map((feature, index) => (
                            <div key={index} className="feature">
                              <span className="check-icon">✓</span>
                              {feature}
                            </div>
                          ))}
                        </div>

                        <button
                          className="buy-btn"
                          onClick={() => handleBuyClick(pkg.package_id)}
                          disabled={loading}
                        >
                          {getLabel("Buy Now")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && packages.length === 0 && (
                <div className="no-packages-container">
                  <div className="no-packages-message">
                    <span className="no-packages-icon">📦</span>
                    <p>{getLabel("No packages available at the moment.")}</p>
                    <button className="retry-btn" onClick={fetchPackagesData}>
                      {getLabel("Retry Loading")}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'custom' && (
            <div className="custom-package-tab">
              <CustomPackageBuilder
                getLabel={getLabel}
                onPackageChange={handleCustomPackageChange}
                handleBuyCustomPackage={handleBuyCustomPackage}
              />
            </div>
          )}
        </div>

        {/* <div className="modal-footer">
          <p className="guarantee">
            <span className="guarantee-icon">🛡️</span>
            {getLabel("Payment is 100% secure and protected.")}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default PremiumPackagesModal;