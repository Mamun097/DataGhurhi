import React, { useState, useEffect } from "react";
import "./PremiumPackagesModal.css";
import CustomPackageBuilder from "./CustomPackage";
import "./CustomPackage.css";
import usePaymentGateway from "./PaymentGateway/FixedPackGateway";
import apiClient from "../../api";

// Tab Navigation Component
const PackageTabNavigation = ({ activeTab, onTabChange, getLabel }) => {
  return (
    <div className="package-tabs">
      <button
        className={`tab-button ${activeTab === "fixed" ? "active" : ""}`}
        onClick={() => onTabChange("fixed")}
      >
        {getLabel("Fixed Packages")}
      </button>
      <button
        className={`tab-button ${activeTab === "custom" ? "active" : ""}`}
        onClick={() => onTabChange("custom")}
      >
        {getLabel("Custom Package")}
      </button>
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
  mostPopularPackageId,
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
    if (validity >= 365) return "premium";
    if (validity >= 90) return "popular";
    return "standard";
  };

  const formatParticipantCount = (count) => {
    if (count === -1) return getLabel("Unlimited");
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toLocaleString();
  };

  const getPackageFeatures = (pkg) => {
    const features = [];

    // Order: Advanced analysis, participants, survey, question, tag

    // Advanced analysis feature (1st)
    const hasAdvancedAnalysis =
      pkg.advanced_analysis && pkg.advanced_analysis > 0;
    features.push({
      text: `${getLabel("Advanced Statistical Analyses")}`,
      type: "analysis",
      included: hasAdvancedAnalysis,
      highlight: false,
    });

    // Participant count feature (2nd)
    const hasParticipants =
      pkg.participant_count !== undefined &&
      pkg.participant_count !== null &&
      pkg.participant_count !== 0;
    features.push({
      text: hasParticipants
        ? `${formatParticipantCount(pkg.participant_count)} ${getLabel(
          "Survey Responses"
        )}`
        : `${getLabel("Survey Responses")}`,
      type: "participant",
      included: hasParticipants,
      highlight: pkg.participant_count === -1,
    });

    // Survey generation feature (3rd)
    const hasSurvey = pkg.survey && pkg.survey > 0;
    features.push({
      text: hasSurvey
        ? `${pkg.survey.toLocaleString()} ${getLabel(
          "Automatic Smart Survey Generation with LLM"
        )}`
        : `${getLabel("Automatic Smart Survey Generation with LLM")}`,
      type: "survey",
      included: hasSurvey,
      highlight: false,
    });

    // Question generation feature (4th)
    const hasQuestion = pkg.question && pkg.question > 0;
    features.push({
      text: hasQuestion
        ? `${pkg.question.toLocaleString()} ${getLabel(
          "Automatic Smart Question Generation with LLM"
        )}`
        : `${getLabel("Automatic Smart Question Generation with LLM")}`,
      type: "question",
      included: hasQuestion,
      highlight: false,
    });

    // Tag generation feature (5th)
    const hasTag = pkg.tag && pkg.tag > 0;
    features.push({
      text: hasTag
        ? `${pkg.tag.toLocaleString()} ${getLabel(
          "Automatic Question Tag Generation"
        )}`
        : `${getLabel("Automatic Question Tag Generation")}`,
      type: "tag",
      included: hasTag,
      highlight: false,
    });

    return features;
  };

  const discount = calculateDiscount(pkg.original_price, pkg.discount_price);
  const validityPeriod = formatValidityPeriod(pkg.validity);
  const validityType = getValidityType(pkg.validity);

  return (
    <div className={`package-card ${isPopular ? "popular" : ""}`}>
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
            <div className="discount-badge">
              {discount}% {getLabel("OFF")}
            </div>
          )}
        </div>

        {validityPeriod && (
          <div className={`validity-display ${validityType}`}>
            <span className="validity-period">{validityPeriod}</span>
          </div>
        )}
      </div>

      <div className="package-features">
        {getPackageFeatures(pkg).map((feature, index) => (
          <div
            key={index}
            className={`feature ${feature.included ? "included" : "not-included"
              } ${feature.highlight ? "highlight" : ""}`}
          >
            <span
              className={`feature-icon ${feature.included ? "check-icon" : "cross-icon"
                }`}
            >
              {feature.included ? "✓" : "×"}
            </span>
            <span className="feature-text">{feature.text}</span>
            {feature.highlight && feature.included && (
              <span className="unlimited-badge">{getLabel("Unlimited")}</span>
            )}
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
  const [activeTab, setActiveTab] = useState("fixed");
  const [customPackage, setCustomPackage] = useState({
    items: {
      tag: 0,
      question: 0,
      survey: 0,
      participant_count: 0,
      advanced_analysis: 0,
    },
    validity: null,
    totalPrice: 0,
    isValid: false,
  });

  // Initialize payment gateway
  const {
    currentUser,
    userSubscription,
    paymentModal,
    processingPayment,
    handleBuyClick,
    handleBuyCustomPackage,
    closePaymentModal,
    initializePaymentGateway,
    PaymentProcessingModal,
  } = usePaymentGateway(getLabel, onClose);

  // Initialize payment gateway when modal opens
  useEffect(() => {
    if (isOpen) {
      initializePaymentGateway();
    }
  }, [isOpen]);

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
      const packagesResponse = await apiClient.get(
        "/api/admin/get-all-packages"
      );
      const packagesData = packagesResponse.data;
      const packagesArray = packagesData.packages || packagesData || [];

      // Fetch most popular package
      let popularPackageId = null;
      try {
        const popularResponse = await apiClient.get(
          "/api/admin/most-popular-package"
        );
        const popularData = popularResponse.data;
        popularPackageId = popularData.popularPackageId;
        console.log("Popular Package API Response:", popularData);
      } catch (popularErr) {
        console.warn("Failed to fetch most popular package, but continuing...");
      }

      setPackages(packagesArray);
      setMostPopularPackageId(popularPackageId);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPackageChange = (packageData) => {
    setCustomPackage(packageData);
  };

  const handleCustomPackageBuy = () => {
    if (!customPackage.isValid) {
      alert(getLabel("Please configure your custom package first"));
      return;
    }
    handleBuyCustomPackage();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{getLabel("Choose Your Premium Package")}</h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Current Subscription Info */}
          {userSubscription &&
            new Date(userSubscription.end_date) > new Date() && (
              <div className="current-subscription-info">
                <div className="subscription-status">
                  <span className="status-icon">🎯</span>
                  <div>
                    <h4>{getLabel("Current Subscription")}</h4>
                    <p>
                      {getLabel("Active until")}:{" "}
                      {new Date(userSubscription.end_date).toLocaleDateString()}
                    </p>
                    <div className="subscription-details">
                      <span>
                        Analysis: {userSubscription.advanced_analysis}
                      </span>
                      <span>
                        Responses:{" "}
                        {userSubscription.participant_count === -1
                          ? getLabel("Unlimited")
                          : userSubscription.participant_count}
                      </span>
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
                <div className="showcase-icon">📋</div>
                <div>
                  <h4>{getLabel("AI Survey Generation")}</h4>
                  <p>
                    {getLabel(
                      "Create professional surveys in seconds with AI assistance"
                    )}
                  </p>
                </div>
              </div>
              <div className="showcase-item">
                <div className="showcase-icon">❓</div>
                <div>
                  <h4>{getLabel("Smart Question Creation")}</h4>
                  <p>
                    {getLabel(
                      "Generate relevant questions based on your research goals"
                    )}
                  </p>
                </div>
              </div>
              <div className="showcase-item">
                <div className="showcase-icon">🏷️</div>
                <div>
                  <h4>{getLabel("Automatic Tagging")}</h4>
                  <p>
                    {getLabel(
                      "Organize questions with intelligent tagging system"
                    )}
                  </p>
                </div>
              </div>
              <div className="showcase-item">
                <div className="showcase-icon">👥</div>
                <div>
                  <h4>{getLabel("Greater Number of Responses")}</h4>
                  <p>
                    {getLabel(
                      "Collect greater number of survey responses without restrictions"
                    )}
                  </p>
                </div>
              </div>
              <div className="showcase-item">
                <div className="showcase-icon">📈</div>
                <div>
                  <h4>{getLabel("Advanced Analytics")}</h4>
                  <p>
                    {getLabel(
                      "Access advanced statistical analyses along with regular ones"
                    )}
                  </p>
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
            {activeTab === "fixed" && (
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
                      <p>
                        {getLabel("Failed to load packages. Please try again.")}
                      </p>
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

            {activeTab === "custom" && (
              <div className="custom-package-tab">
                <CustomPackageBuilder
                  getLabel={getLabel}
                  onPackageChange={handleCustomPackageChange}
                  handleBuyCustomPackage={handleCustomPackageBuy}
                  handleCloseModal={onClose}
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
