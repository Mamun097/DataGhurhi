import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PremiumPackagesModal.css';
import CustomPackageBuilder from './CustomPackage';
import './CustomPackage.css';
import './PaymentModal.css';

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

// Payment Processing Modal Component
const PaymentProcessingModal = ({ isOpen, onClose, getLabel, status, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-content">
          {status === 'processing' && (
            <>
              <div className="loading-spinner large"></div>
              <h3>{getLabel("Processing Payment...")}</h3>
              <p>{getLabel("Please wait while we redirect you to the payment gateway.")}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="success-icon">✅</div>
              <h3>{getLabel("Payment Successful!")}</h3>
              <p>{message || getLabel("Your subscription has been activated successfully.")}</p>
              <button className="close-btn" onClick={onClose}>
                {getLabel("Close")}
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="error-icon">❌</div>
              <h3>{getLabel("Payment Failed")}</h3>
              <p>{message || getLabel("Something went wrong. Please try again.")}</p>
              <button className="close-btn" onClick={onClose}>
                {getLabel("Close")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Package Card Component
const PackageCard = ({ 
  pkg, 
  isPopular, 
  getLabel, 
  onBuyClick, 
  processingPayment, 
  loading,
  mostPopularPackageId 
}) => {
  const calculateDiscount = (originalPrice, discountPrice) => {
    if (originalPrice <= discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const formatValidityPeriod = (validity) => {
    if (!validity) return null;
    if (validity % 365 === 0) {
      return getLabel(`${validity / 365} Years`);
    } else if (validity % 30 === 0) {
      return getLabel(`${validity / 30} Months`);
    } else {
      return getLabel(`${validity} Days`);
    }
  };

  const getValidityType = (validity) => {
    if (validity >= 365) return 'premium';
    if (validity >= 90) return 'popular';
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
    
    if (pkg.title && pkg.title.toLowerCase().includes('starter')) {
      features.push(getLabel("Basic Survey Templates"));
    } else if (pkg.title && (pkg.title.toLowerCase().includes('professional') || pkg.title.toLowerCase().includes('yearly'))) {
      features.push(getLabel("Advanced Survey Templates"));
    } else if (pkg.title && pkg.title.toLowerCase().includes('enterprise')) {
      features.push(getLabel("Premium Survey Templates"));
    }
    return features;
  };

  const discount = calculateDiscount(pkg.original_price, pkg.discount_price);
  const validityPeriod = formatValidityPeriod(pkg.validity);
  const validityType = getValidityType(pkg.validity);

  return (
    <div className={`package-card ${isPopular ? 'popular' : ''}`}>
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
        onClick={() => onBuyClick(pkg.package_id)}
        disabled={loading || processingPayment}
      >
        {processingPayment ? getLabel("Processing...") : getLabel("Buy Now")}
      </button>
    </div>
  );
};

// Main Modal Component
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

  const [currentUser, setCurrentUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);

  // Payment state
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    status: null,
    message: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get user profile
  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return;
    }

    try {
      const response = await axios.get("http://localhost:2000/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 200) {
        setCurrentUser(response.data.user);
        // Also fetch user subscription
        await fetchUserSubscription(response.data.user.user_id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  // Fetch user subscription
  const fetchUserSubscription = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`http://localhost:2000/api/subscription/user/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 200) {
        setUserSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  // Fetch user profile on mount
  useEffect(() => {
    if (isOpen) {
      getProfile();
    }
  }, [isOpen, getProfile]);

  // Fetch packages and most popular package when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPackagesData();
    }
  }, [isOpen]);

  // Handle payment response from URL parameters - UPDATED
  useEffect(() => {
    const handlePaymentResponse = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for both 'payment' and 'status' parameters for backward compatibility
      const paymentStatus = urlParams.get('payment');
      const status = urlParams.get('status');
      const tran_id = urlParams.get('tran_id');
      const packageName = urlParams.get('package');
      const errorMsg = urlParams.get('error');
      const message = urlParams.get('message');
      
      // Use whichever parameter is available
      const finalStatus = paymentStatus || status;
      
      if (finalStatus && (tran_id || finalStatus === 'success')) {
        if (finalStatus === 'success') {
          setPaymentModal({
            isOpen: true,
            status: 'success',
            message: packageName 
              ? getLabel(`Payment completed successfully! Your ${decodeURIComponent(packageName)} subscription is now active.`)
              : getLabel('Payment completed successfully! Your subscription is now active.')
          });
        } else if (finalStatus === 'failed') {
          const failureMessage = errorMsg 
            ? decodeURIComponent(errorMsg)
            : getLabel('Payment failed. Please try again.');
          
          setPaymentModal({
            isOpen: true,
            status: 'error',
            message: failureMessage
          });
        } else if (finalStatus === 'cancelled') {
          setPaymentModal({
            isOpen: true,
            status: 'error',
            message: getLabel('Payment was cancelled.')
          });
        } else if (finalStatus === 'error') {
          const errorMessage = message 
            ? decodeURIComponent(message)
            : getLabel('An error occurred during payment processing.');
          
          setPaymentModal({
            isOpen: true,
            status: 'error',
            message: errorMessage
          });
        }
        
        // Clean up URL parameters
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };

    if (isOpen) {
      // Add a small delay to ensure the modal is fully rendered
      setTimeout(handlePaymentResponse, 100);
    }
  }, [isOpen, getLabel]);

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
      const packagesArray = packagesData.packages || packagesData || [];

      // Fetch most popular package
      try {
        const popularResponse = await fetch('http://localhost:2000/api/admin/most-popular-package');
        let popularPackageId = null;
        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          popularPackageId = popularData.popularPackageId;
        }
        setMostPopularPackageId(popularPackageId);
      } catch (popularError) {
        console.warn('Failed to fetch most popular package:', popularError);
      }

      setPackages(packagesArray);

    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async (packageId) => {
    if (!currentUser || !currentUser.user_id) {
      alert(getLabel('Please login to purchase a package'));
      return;
    }

    // Check if user already has an active subscription
    if (userSubscription && new Date(userSubscription.end_date) > new Date()) {
      const confirmUpgrade = window.confirm(
        getLabel('You already have an active subscription. Do you want to upgrade/renew?')
      );
      if (!confirmUpgrade) return;
    }

    setProcessingPayment(true);
    setPaymentModal({
      isOpen: true,
      status: 'processing',
      message: ''
    });

    try {
      const response = await fetch('http://localhost:2000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          packageId: packageId,
          userId: currentUser.user_id,
          customerName: currentUser.name || 'Customer',
          customerEmail: currentUser.email,
          customerPhone: currentUser.contact || '01700000000',
          customerAddress: currentUser.address || 'Dhaka, Bangladesh'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Close the modal before redirecting
        setPaymentModal({ isOpen: false, status: null, message: '' });
        
        // Store the transaction ID for reference
        localStorage.setItem('pending_transaction', data.transaction_id);
        
        // Redirect to SSLCommerz payment gateway
        window.location.href = data.GatewayPageURL;
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentModal({
        isOpen: true,
        status: 'error',
        message: error.message || getLabel('Failed to initiate payment. Please try again.')
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCustomPackageChange = (packageData) => {
    setCustomPackage(packageData);
  };

  const handleBuyCustomPackage = async () => {
    if (!customPackage.isValid) {
      alert(getLabel('Please configure your custom package first'));
      return;
    }

    if (!currentUser || !currentUser.user_id) {
      alert(getLabel('Please login to purchase a package'));
      return;
    }

    // For now, show a message that custom package will be implemented
    alert(getLabel('Custom package payment will be implemented soon. Please contact support for custom packages.'));
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      status: null,
      message: ''
    });
    // Refresh user data after successful payment
    if (paymentModal.status === 'success') {
      getProfile();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{getLabel("Choose Your Premium Package")}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* Current Subscription Info */}
          {userSubscription && new Date(userSubscription.end_date) > new Date() && (
            <div className="current-subscription-info">
              <div className="subscription-status">
                <span className="status-icon">🎯</span>
                <div>
                  <h4>{getLabel("Current Subscription")}</h4>
                  <p>{getLabel("Active until")}: {new Date(userSubscription.end_date).toLocaleDateString()}</p>
                  <div className="subscription-details">
                    <span>Survey: {userSubscription.survey}</span>
                    <span>Question: {userSubscription.question}</span>
                    <span>Tag: {userSubscription.tag}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      return (
                        <PackageCard
                          key={pkg.package_id}
                          pkg={pkg}
                          isPopular={isPopular}
                          getLabel={getLabel}
                          onBuyClick={handleBuyClick}
                          processingPayment={processingPayment}
                          loading={loading}
                          mostPopularPackageId={mostPopularPackageId}
                        />
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
        </div>
      </div>

      <PaymentProcessingModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        getLabel={getLabel}
        status={paymentModal.status}
        message={paymentModal.message}
      />
    </>
  );
};

export default PremiumPackagesModal;