import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PremiumPackagesModal.css";
import CustomPackageBuilder from "./CustomPackage";
import "./CustomPackage.css";
import usePaymentGateway from "./PaymentGateway/FixedPackGateway";
import apiClient from "../../api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

// Language configurations matching Dashboard
const LANGUAGES = [
  { code: "en", name: "ENGLISH", flag: "🇬🇧", googleCode: "en" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", googleCode: "bn" },
  { code: "zh", name: "中文", flag: "🇨🇳", googleCode: "zh-CN" }, // Mandarin Chinese
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", googleCode: "hi" },
  { code: "es", name: "ESPAÑOL", flag: "🇪🇸", googleCode: "es" },
  { code: "ar", name: "العربية", flag: "🇸🇦", googleCode: "ar" },
  { code: "fr", name: "FRANÇAIS", flag: "🇫🇷", googleCode: "fr" },
  { code: "pt", name: "PORTUGUÊS", flag: "🇵🇹", googleCode: "pt" },
  { code: "ru", name: "РУССКИЙ", flag: "🇷🇺", googleCode: "ru" },
  { code: "ur", name: "اردو", flag: "🇵🇰", googleCode: "ur" },
  { code: "id", name: "BAHASA INDONESIA", flag: "🇮🇩", googleCode: "id" },
  { code: "de", name: "DEUTSCH", flag: "🇩🇪", googleCode: "de" },
  { code: "ja", name: "日本語", flag: "🇯🇵", googleCode: "ja" },
  { code: "sw", name: "KISWAHILI", flag: "🇰🇪", googleCode: "sw" },
  { code: "mr", name: "मराठी", flag: "🇮🇳", googleCode: "mr" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳", googleCode: "te" },
  { code: "tr", name: "TÜRKÇE", flag: "🇹🇷", googleCode: "tr" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", googleCode: "ta" },
  { code: "vi", name: "TIẾNG VIỆT", flag: "🇻🇳", googleCode: "vi" },
  { code: "ko", name: "한국어", flag: "🇰🇷", googleCode: "ko" },
  { code: "it", name: "ITALIANO", flag: "🇮🇹", googleCode: "it" },
  { code: "th", name: "ไทย", flag: "🇹🇭", googleCode: "th" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", googleCode: "gu" },
  { code: "fa", name: "فارسی", flag: "🇮🇷", googleCode: "fa" },
  { code: "pl", name: "POLSKI", flag: "🇵🇱", googleCode: "pl" },
  { code: "uk", name: "УКРАЇНСЬКА", flag: "🇺🇦", googleCode: "uk" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳", googleCode: "kn" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳", googleCode: "ml" },
  { code: "or", name: "ଓଡ଼ିଆ", flag: "🇮🇳", googleCode: "or" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲", googleCode: "my" },
  // Additional major African languages (if not already included)
  { code: "ha", name: "HAUSA", flag: "🇳🇬", googleCode: "ha" },
  { code: "yo", name: "YORÙBÁ", flag: "🇳🇬", googleCode: "yo" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹", googleCode: "am" },
];

const translateText = async (textArray, targetLang) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: textArray,
        target: targetLang,
        format: "text",
      }
    );
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

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
  mapDigitIfBengali,
}) => {
  const calculateDiscount = (originalPrice, discountPrice) => {
    if (originalPrice <= discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const formatValidityPeriod = (validity) => {
    if (!validity) return null;
    if (validity % 365 === 0) {
      const years = validity / 365;
      return `${mapDigitIfBengali(years)} ${getLabel("Years")}`;
    } else if (validity % 30 === 0) {
      const months = validity / 30;
      return `${mapDigitIfBengali(months)} ${getLabel("Months")}`;
    } else {
      return `${mapDigitIfBengali(validity)} ${getLabel("Days")}`;
    }
  };

  const getValidityType = (validity) => {
    if (validity >= 365) return "premium";
    if (validity >= 90) return "popular";
    return "standard";
  };

  const formatParticipantCount = (count) => {
    if (count === -1) return getLabel("Unlimited");
    if (count >= 1000) return `${mapDigitIfBengali((count / 1000).toFixed(0))}K`;
    return mapDigitIfBengali(count.toLocaleString());
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
        ? `${mapDigitIfBengali(pkg.survey.toLocaleString())} ${getLabel(
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
        ? `${mapDigitIfBengali(pkg.question.toLocaleString())} ${getLabel(
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
        ? `${mapDigitIfBengali(pkg.tag.toLocaleString())} ${getLabel(
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
            <div className="original-price">৳{mapDigitIfBengali(pkg.original_price)}</div>
          )}
          <div className="current-price">৳{mapDigitIfBengali(pkg.discount_price)}</div>
          {discount > 0 && (
            <div className="discount-badge">
              {mapDigitIfBengali(discount)}% {getLabel("OFF")}
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
const PremiumPackagesModal = ({ isOpen, onClose, getLabel: parentGetLabel }) => {
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

  const [translatedLabels, setTranslatedLabels] = useState({});
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  // Listen for language changes from navbar (same as Dashboard)
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    
    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

  // Load translations (same pattern as Dashboard)
  const loadTranslations = async () => {
    if (language === "en") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      'Choose Your Premium Package',
      'Current Subscription',
      'Active until',
      'Analysis',
      'Responses',
      'Unlimited',
      'Survey',
      'Question',
      'Tag',
      'Unlock Powerful AI Features',
      'AI Survey Generation',
      'Create professional surveys in seconds with AI assistance',
      'Smart Question Creation',
      'Generate relevant questions based on your research goals',
      'Automatic Tagging',
      'Organize questions with intelligent tagging system',
      'Greater Number of Responses',
      'Collect greater number of survey responses without restrictions',
      'Advanced Analytics',
      'Access advanced statistical analyses along with regular ones',
      'Fixed Packages',
      'Custom Package',
      'Loading packages...',
      'Failed to load packages. Please try again.',
      'Retry',
      'Most Popular',
      'OFF',
      'Years',
      'Months',
      'Days',
      'Advanced Statistical Analyses',
      'Survey Responses',
      'Automatic Smart Survey Generation with LLM',
      'Automatic Smart Question Generation with LLM',
      'Automatic Question Tag Generation',
      'Processing...',
      'Buy Now',
      'No packages available at the moment.',
      'Retry Loading',
      'Please configure your custom package first',
      'Unlock advanced statistical analyses and insights along with basic ones',
      'Build Your Custom Package',
      'Select the features you need and choose validity period',
      'Choose Validity Period',
      'Days',
      'Months',
      'Years',
      'Day',
      'Month',
      'Year',
      'Package Summary',
      'Total',
      'Validity',
      'Subtotal',
      'Survey Participants',
      'Question Tag',
      'Have a coupon?',
      'Apply Coupon',
    ];

    // Get the Google Translate language code for the current language
    const currentLangObj = LANGUAGES.find(l => l.code === language);
    const targetLang = currentLangObj ? currentLangObj.googleCode : "en";

    const translations = await translateText(labelsToTranslate, targetLang);
    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });
    setTranslatedLabels(translated);
  };

  useEffect(() => {
    if (isOpen) {
      loadTranslations();
    }
  }, [language, isOpen]);

  // getLabel function (same pattern as Dashboard)
  const getLabel = (text) => {
    if (parentGetLabel) {
      return parentGetLabel(text);
    }
    return language === "en" ? text : translatedLabels[text] || text;
  };

  // Bengali digit mapping
  const mapDigitIfBengali = (text) => {
    if (!text && text !== 0) return '';
    if (language !== 'bn') return text.toString();
    const digitMapBn = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return text.toString().split('').map(char => digitMapBn[char] || char).join('');
  };

  // Initialize payment gateway - passing the getLabel function
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
  }, [isOpen, initializePaymentGateway]);

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
                        {getLabel("Analysis")}: {mapDigitIfBengali(userSubscription.advanced_analysis)}
                      </span>
                      <span>
                        {getLabel("Responses")}:{" "}
                        {userSubscription.participant_count === -1
                          ? getLabel("Unlimited")
                          : mapDigitIfBengali(userSubscription.participant_count)}
                      </span>
                      <span>{getLabel("Survey")}: {mapDigitIfBengali(userSubscription.survey)}</span>
                      <span>{getLabel("Question")}: {mapDigitIfBengali(userSubscription.question)}</span>
                      <span>{getLabel("Tag")}: {mapDigitIfBengali(userSubscription.tag)}</span>
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
                          mapDigitIfBengali={mapDigitIfBengali}
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