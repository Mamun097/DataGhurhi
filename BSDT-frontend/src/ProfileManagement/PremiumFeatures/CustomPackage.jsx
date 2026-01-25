import React, { useState, useEffect } from "react";
import CouponOverlay from './CouponOverlay';
import apiClient from "../../api";

// Updated Custom Package Builder Component with Premium Features and Lower Limits
const CustomPackageBuilder = ({
  getLabel,
  onPackageChange,
  handleBuyCustomPackage,
  handleCloseModal
}) => {
  const [packageItems, setPackageItems] = useState([]);
  const [validityPeriods, setValidityPeriods] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    tag: 0,
    question: 0,
    survey: 0,
    participant: 0,
  });
  const [featureStates, setFeatureStates] = useState({
    tag: false,
    question: false,
    survey: false,
    participant: false,
    advanced_analysis: false,
  });
  const [selectedValidity, setSelectedValidity] = useState(null);
  const [lowerLimits, setLowerLimits] = useState({
    tag: 0,
    question: 0,
    survey: 0,
    participant: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [isCouponOverlayOpen, setIsCouponOverlayOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // New state for processing custom package purchase
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    fetchCustomPackageData();
  }, []);

  useEffect(() => {
    if (selectedValidity) {
      fetchLowerLimits(selectedValidity.id);
    }
  }, [selectedValidity]);

  // Update quantities when feature states change and we have lower limits
  useEffect(() => {
    if (Object.values(lowerLimits).some((limit) => limit > 0)) {
      setSelectedItems((prev) => ({
        tag: featureStates.tag ? Math.max(prev.tag, lowerLimits.tag) : prev.tag,
        question: featureStates.question
          ? Math.max(prev.question, lowerLimits.question)
          : prev.question,
        survey: featureStates.survey
          ? Math.max(prev.survey, lowerLimits.survey)
          : prev.survey,
        participant: featureStates.participant
          ? Math.max(prev.participant, lowerLimits.participant)
          : prev.participant,
      }));
    }
  }, [featureStates, lowerLimits]);

  useEffect(() => {
    // Only call onPackageChange if it exists and packageItems are loaded
    if (onPackageChange && packageItems.length > 0) {
      const basePrice = calculateCustomPackagePrice();
      const finalPrice = calculateFinalPrice(basePrice);
      const hasAnyFeature = Object.values(featureStates).some((state) => state);
      const hasValidItems =
        (featureStates.tag && selectedItems.tag > 0) ||
        (featureStates.question && selectedItems.question > 0) ||
        (featureStates.survey && selectedItems.survey > 0) ||
        (featureStates.participant && selectedItems.participant > 0) ||
        featureStates.advanced_analysis;

      onPackageChange({
        items: selectedItems,
        features: featureStates,
        validity: selectedValidity,
        basePrice: basePrice,
        finalPrice: finalPrice,
        appliedCoupon: appliedCoupon,
        isValid:
          selectedValidity &&
          hasAnyFeature &&
          hasValidItems &&
          Object.keys(validationErrors).length === 0,
      });
    }
  }, [
    selectedItems,
    featureStates,
    selectedValidity,
    packageItems.length,
    validationErrors,
    appliedCoupon,
  ]);

  const fetchCustomPackageData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch package items
      let itemsData = [];
      try {
        const itemsResponse = await apiClient.get(
          "/api/admin/get-package-items"
        );
        const itemsJson = itemsResponse.data;
        if (itemsJson.packageItems && Array.isArray(itemsJson.packageItems)) {
          itemsData = itemsJson.packageItems;
        } else if (itemsJson.items && Array.isArray(itemsJson.items)) {
          itemsData = itemsJson.items;
        } else if (Array.isArray(itemsJson)) {
          itemsData = itemsJson;
        } else {
          itemsData = [];
        }
      } catch (itemsError) {
        console.error("Error fetching package items:", itemsError);
      }

      // Fetch validity periods
      let validityData = [];
      try {
        const validityResponse = await apiClient.get(
          "/api/admin/get-validity-periods"
        );
        const validityJson = validityResponse.data;
        if (
          validityJson.validityPeriods &&
          Array.isArray(validityJson.validityPeriods)
        ) {
          validityData = validityJson.validityPeriods;
        } else if (
          validityJson.periods &&
          Array.isArray(validityJson.periods)
        ) {
          validityData = validityJson.periods;
        } else if (Array.isArray(validityJson)) {
          validityData = validityJson;
        } else {
          validityData = [];
        }
      } catch (validityError) {
        console.error("Error fetching validity periods:", validityError);
      }

      console.log("Package Items:", itemsData);
      console.log("Validity Periods:", validityData);

      setPackageItems(itemsData);
      validityData.sort((a, b) => a.days - b.days);
      setValidityPeriods(validityData);

      if (validityData && validityData.length > 0) {
        setSelectedValidity(validityData[0]);
      }
    } catch (err) {
      console.error("Error in fetchCustomPackageData:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowerLimits = async (validityId) => {
    try {
      console.log("Fetching lower limits for validity ID:", validityId);
      const response = await apiClient.get(
        `/api/get-items-lower-limit/${validityId}`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch lower limits: ${response.status}`);
      }
      const data = response.data;
      console.log("Lower limits response:", data);

      const limits = {
        tag: data.itemsLowerLimit.tag || 0,
        question: data.itemsLowerLimit.question || 0,
        survey: data.itemsLowerLimit.survey || 0,
        participant: data.itemsLowerLimit.participant || 0,
      };

      console.log("Processed limits:", limits);
      setLowerLimits(limits);

      // Always update selected items to meet minimum requirements, regardless of feature states
      // The feature states will be checked when rendering/validating
      setSelectedItems((prev) => {
        const updated = {
          tag: Math.max(prev.tag, limits.tag),
          question: Math.max(prev.question, limits.question),
          survey: Math.max(prev.survey, limits.survey),
          participant: Math.max(prev.participant, limits.participant),
        };
        console.log("Updated selected items:", updated);
        return updated;
      });

      // Clear any existing validation errors when limits change
      setValidationErrors({});
    } catch (error) {
      console.error("Error fetching lower limits:", error);
      // Set default limits if API fails
      const defaultLimits = {
        tag: 0,
        question: 0,
        survey: 0,
        participant: 0,
      };
      console.log("Setting default limits:", defaultLimits);
      setLowerLimits(defaultLimits);
    }
  };

  const getItemPrice = (itemType) => {
    // Ensure packageItems is an array and has items
    if (!Array.isArray(packageItems) || packageItems.length === 0) {
      return 0;
    }
    const item = packageItems.find((item) => item.item_type === itemType);
    return item ? item.base_price_per_unit : 0;
  };

  const calculateCustomPackagePrice = () => {
    if (
      !selectedValidity ||
      !Array.isArray(packageItems) ||
      packageItems.length === 0
    ) {
      return 0;
    }

    let basePrice = 0;

    // Calculate price for quantity-based features
    if (featureStates.tag) {
      basePrice += selectedItems.tag * getItemPrice("tag");
    }
    if (featureStates.question) {
      basePrice += selectedItems.question * getItemPrice("question");
    }
    if (featureStates.survey) {
      basePrice += selectedItems.survey * getItemPrice("survey");
    }
    if (featureStates.participant) {
      basePrice += selectedItems.participant * getItemPrice("participant");
    }

    // Add advanced analysis if enabled
    if (featureStates.advanced_analysis) {
      basePrice += getItemPrice("advanced_analysis");
    }

    return Math.round(basePrice * selectedValidity.price_multiplier);
  };

  const calculateFinalPrice = (basePrice) => {
    if (!appliedCoupon || !appliedCoupon.data) {
      return basePrice;
    }

    const coupon = appliedCoupon.data;

    // Check if coupon has required properties
    if (!coupon.discount_percentage) {
      return basePrice;
    }

    // Calculate discount amount
    const discountAmount = Math.round((basePrice * coupon.discount_percentage) / 100);

    // Apply max discount limit if it exists
    const actualDiscount = coupon.max_discount
      ? Math.min(discountAmount, coupon.max_discount)
      : discountAmount;

    // Calculate final price (ensure it's not less than 0)
    const finalPrice = Math.max(0, basePrice - actualDiscount);

    console.log('Price calculation:', {
      basePrice,
      discountPercentage: coupon.discount_percentage,
      calculatedDiscount: discountAmount,
      maxDiscount: coupon.max_discount,
      actualDiscount,
      finalPrice
    });

    return finalPrice;
  };

  const validateItemCount = (itemType, value) => {
    const minRequired = lowerLimits[itemType] || 0;
    if (value < minRequired) {
      return `Minimum ${minRequired} ${getFeatureLabel(
        itemType
      ).toLowerCase()}(s) required for this validity period`;
    }
    return null;
  };

  const handleItemChange = (itemType, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);

    // Validate against lower limits
    const validationError = validateItemCount(itemType, numValue);

    setValidationErrors((prev) => ({
      ...prev,
      [itemType]: validationError,
    }));

    setSelectedItems((prev) => ({
      ...prev,
      [itemType]: numValue,
    }));
  };

  const handleFeatureToggle = (featureType) => {
    const isCurrentlyEnabled = featureStates[featureType];

    setFeatureStates((prev) => ({
      ...prev,
      [featureType]: !prev[featureType],
    }));

    // When enabling a feature, set to minimum required or current value, whichever is higher
    if (
      !isCurrentlyEnabled &&
      ["tag", "question", "survey", "participant"].includes(featureType)
    ) {
      const minRequired = lowerLimits[featureType] || 0;
      const newValue = Math.max(selectedItems[featureType], minRequired);

      console.log(
        `Enabling ${featureType}: setting value to ${newValue} (min: ${minRequired}, current: ${selectedItems[featureType]})`
      );

      setSelectedItems((prev) => ({
        ...prev,
        [featureType]: newValue,
      }));

      // Clear validation error when feature is enabled with valid value
      setValidationErrors((prev) => ({
        ...prev,
        [featureType]: null,
      }));
    }

    // Reset quantity to 0 when feature is disabled
    if (
      isCurrentlyEnabled &&
      ["tag", "question", "survey", "participant"].includes(featureType)
    ) {
      setSelectedItems((prev) => ({
        ...prev,
        [featureType]: 0,
      }));

      // Clear validation error when feature is disabled
      setValidationErrors((prev) => ({
        ...prev,
        [featureType]: null,
      }));
    }
  };

  const handleValidityChange = (period) => {
    setSelectedValidity(period);
    // Clear validation errors when validity changes
    setValidationErrors({});
  };

  const formatValidityDisplay = (days) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} ${years === 1 ? getLabel("Year") : getLabel("Years")}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? getLabel("Month") : getLabel("Months")}`;
    } else {
      return `${days} ${days === 1 ? getLabel("Day") : getLabel("Days")}`;
    }
  };

  const getFeatureIcon = (featureType) => {
    const icons = {
      survey: "📋",
      question: "❓",
      tag: "🏷️",
      participant: "👥",
      advanced_analysis: "📊",
    };
    return icons[featureType] || "📦";
  };

  const getFeatureLabel = (featureType) => {
    const labels = {
      survey: "Survey",
      question: "Question",
      tag: "Question Tag",
      participant: "Survey Participants",
      advanced_analysis: "Advanced Statistical Analyses",
    };
    return getLabel ? getLabel(labels[featureType]) : labels[featureType];
  };

  const renderQuantityFeature = (featureType) => {
    const minRequired = lowerLimits[featureType] || 0;
    const hasValidationError = validationErrors[featureType];

    return (
      <label className="feature-option">
        <input
          type="checkbox"
          checked={featureStates[featureType]}
          onChange={() => handleFeatureToggle(featureType)}
        />
        <div
          className={`feature-card ${hasValidationError ? "has-error" : ""}`}
        >
          <div className="feature-header">
            <div className="feature-icon">{getFeatureIcon(featureType)}</div>
            <h4>{getFeatureLabel(featureType)}</h4>
            <span className="feature-price">
              ৳{getItemPrice(featureType)}/unit
            </span>
          </div>
          <div
            className={`quantity-controls ${!featureStates[featureType] ? "disabled" : ""
              }`}
          >
            <div className="quantity-input-wrapper">
              <span className="quantity-label">Quantity:</span>
              <input
                type="number"
                min={minRequired}
                value={
                  featureStates[featureType] ? selectedItems[featureType] : 0
                }
                onChange={(e) => handleItemChange(featureType, e.target.value)}
                disabled={!featureStates[featureType]}
                placeholder={minRequired > 0 ? `Min: ${minRequired}` : "0"}
                className={hasValidationError ? "error" : ""}
              />
            </div>
            {minRequired > 0 && featureStates[featureType] && (
              <div className="minimum-requirement">
                <span className="min-label">Minimum: {minRequired}</span>
              </div>
            )}
            {hasValidationError && (
              <div className="validation-error">
                {/* <span className="error-icon">⚠️</span> */}
                <span className="error-message">{hasValidationError}</span>
              </div>
            )}
          </div>
        </div>
      </label>
    );
  };

  const renderToggleFeature = (featureType) => (
    <label className="feature-option">
      <input
        type="checkbox"
        checked={featureStates[featureType]}
        onChange={() => handleFeatureToggle(featureType)}
      />
      <div className="feature-card toggle-only">
        <div className="feature-header">
          <div className="feature-icon">{getFeatureIcon(featureType)}</div>
          <h4>{getFeatureLabel(featureType)}</h4>
          <span className="feature-price">৳{getItemPrice(featureType)}</span>
        </div>
        <div className="feature-description">
          <p>
            {getLabel
              ? getLabel(
                "Unlock advanced statistical analyses and insights along with basic ones"
              )
              : "Unlock advanced statistical analyses and insights along with basic ones"}
          </p>
        </div>
      </div>
    </label>
  );

  const handleApplyCoupon = (couponCode, type, couponData = null) => {
    console.log('Applying coupon:', { couponCode, type, couponData });

    // Set the applied coupon with the coupon data for price calculation
    if (type === 'manual') {
      // Handle manual coupon code - you might want to validate this via API
      setAppliedCoupon({
        code: couponCode,
        type: 'manual',
        data: couponData // Manual coupons might not have data initially
      });
    } else if (type === 'public') {
      // Handle public coupon
      setAppliedCoupon({
        code: couponCode,
        type: 'public',
        data: couponData
      });
    }

    // Close the overlay after applying
    setIsCouponOverlayOpen(false);

    // You can add success notification here
    alert(`Coupon ${couponCode} applied successfully!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // New function to handle custom package purchase
  const handleCustomPackagePurchase = async () => {
    const basePrice = calculateCustomPackagePrice();
    const finalPrice = calculateFinalPrice(basePrice);

    // Check if final price is greater than 0
    if (finalPrice > 0) {
      alert(
        getLabel
          ? getLabel("Custom package payment will be implemented soon. Please contact support for custom packages.")
          : "Custom package payment will be implemented soon. Please contact support for custom packages."
      );
      return;
    }

    // Get current user from localStorage token
    const token = localStorage.getItem("token");
    if (!token) {
      alert(getLabel ? getLabel("Please login to purchase a package") : "Please login to purchase a package");
      return;
    }

    // Get user profile to get user_id
    let currentUser = null;
    try {
      const profileResponse = await apiClient.get("/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      if (profileResponse.status === 200) {
        currentUser = profileResponse.data.user;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert(getLabel ? getLabel("Error fetching user profile") : "Error fetching user profile");
      return;
    }

    if (!currentUser || !currentUser.user_id) {
      alert(getLabel ? getLabel("Please login to purchase a package") : "Please login to purchase a package");
      return;
    }

    setProcessingPurchase(true);

    try {
      // 1. Add transaction to transaction table (commented out for now)
      // TODO: Implement transaction logging
      // const transactionData = {
      //   user_id: currentUser.user_id,
      //   amount: finalPrice,
      //   type: 'custom_package',
      //   status: 'completed',
      //   package_details: {
      //     items: selectedItems,
      //     features: featureStates,
      //     validity: selectedValidity,
      //     appliedCoupon: appliedCoupon
      //   }
      // };
      // await apiClient.post('/api/transaction/create', transactionData);

      // 2. Add the pack to user account (subscription table)
      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + (selectedValidity.days * 24 * 60 * 60 * 1000));

      const subscriptionData = {
        user_id: currentUser.user_id,
        tag: featureStates.tag ? selectedItems.tag : 0,
        question: featureStates.question ? selectedItems.question : 0,
        survey: featureStates.survey ? selectedItems.survey : 0,
        participant_count: featureStates.participant ? selectedItems.participant : 0,
        advanced_analysis: featureStates.advanced_analysis,
        start_date: currentDate.toISOString(),
        end_date: endDate.toISOString(),
        cost: finalPrice,
        package_id: null // null for custom package
      };

      console.log('Creating subscription with data:', subscriptionData);

      // Placeholder API call for adding subscription
      const subscriptionResponse = await apiClient.post("/api/subscription/create", subscriptionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Subscription created:', subscriptionResponse.data);

      // 3. Add coupon usage info if coupon is applied
      if (appliedCoupon && appliedCoupon.data) {
        const discountAmount = basePrice - finalPrice;

        const voucherUsedData = {
          user_id: currentUser.user_id,
          voucher_id: appliedCoupon.data.id || appliedCoupon.data.voucher_id, // Adjust based on your coupon structure
          subscription_id: subscriptionResponse.data.subscription_id || subscriptionResponse.data.id, // Adjust based on API response
          purchased_at: currentDate.toISOString(),
          discount_amount: discountAmount
        };

        console.log('Recording voucher usage with data:', voucherUsedData);

        // Placeholder API call for adding voucher usage
        await apiClient.post('/api/voucher-used/create', voucherUsedData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Voucher usage recorded');
      }

      // Show success message
      alert(
        getLabel
          ? getLabel("Custom package purchased successfully! Your subscription is now active.")
          : "Custom package purchased successfully! Your subscription is now active."
      );

      // Reset form or redirect user
      // You might want to reset the form or redirect to a success page
      // For now, we'll just clear the applied coupon
      setAppliedCoupon(null);

    } catch (error) {
      console.error("Error processing custom package purchase:", error);
      alert(
        getLabel
          ? getLabel("Error processing purchase. Please try again.")
          : "Error processing purchase. Please try again."
      );
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Calculate prices for display
  const basePrice = calculateCustomPackagePrice();
  const finalPrice = calculateFinalPrice(basePrice);
  const discountAmount = basePrice - finalPrice;

  // Always render something, even during loading
  return (
    <div className="custom-package-builder">
      {loading ? (
        <div className="custom-package-loading">
          <div className="loading-spinner"></div>
          <p>
            {getLabel
              ? getLabel("Loading customization options...")
              : "Loading customization options..."}
          </p>
        </div>
      ) : error ? (
        <div className="custom-package-error">
          <span className="error-icon">⚠️</span>
          <p>
            {getLabel
              ? getLabel("Failed to load customization options.")
              : "Failed to load customization options."}
          </p>
          <button className="retry-btn" onClick={fetchCustomPackageData}>
            {getLabel ? getLabel("Retry") : "Retry"}
          </button>
        </div>
      ) : (
        <>
          <div className="builder-header">
            <h3>
              {getLabel
                ? getLabel("Build Your Custom Package")
                : "Build Your Custom Package"}
            </h3>
            <p>
              {getLabel
                ? getLabel(
                  "Select the features you need and choose validity period"
                )
                : "Select the features you need and choose validity period"}
            </p>
          </div>

          <div className="features-selector">
            <div className="features-grid">
              {renderQuantityFeature("survey")}
              {renderQuantityFeature("question")}
              {renderQuantityFeature("tag")}
            </div>
            <div className="features-grid-row-2">
              {renderQuantityFeature("participant")}
              {renderToggleFeature("advanced_analysis")}
            </div>
          </div>

          {validityPeriods.length > 0 && (
            <div className="validity-selector">
              <h4>
                {getLabel
                  ? getLabel("Choose Validity Period")
                  : "Choose Validity Period"}
              </h4>
              <div className="validity-options">
                {validityPeriods.map((period) => (
                  <label key={period.id} className="validity-option">
                    <input
                      type="radio"
                      name="validity"
                      value={period.id}
                      checked={selectedValidity?.id === period.id}
                      onChange={() => handleValidityChange(period)}
                    />
                    <div className="validity-card">
                      <span className="validity-duration">
                        {formatValidityDisplay(period.days)}
                      </span>
                      <span className="validity-multiplier">
                        {period.price_multiplier < 1
                          ? `${Math.round(
                            (1 - period.price_multiplier) * 100
                          )}% ${getLabel ? getLabel("OFF") : "OFF"}`
                          : period.price_multiplier > 1
                            ? `+${Math.round(
                              (period.price_multiplier - 1) * 100
                            )}%`
                            : getLabel
                              ? getLabel("Standard")
                              : "Standard"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="package-summary">
            <h4>
              {getLabel ? getLabel("Package Summary") : "Package Summary"}
            </h4>
            <div className="summary-items">
              {featureStates.tag && selectedItems.tag > 0 && (
                <div className="summary-item">
                  <span>
                    {selectedItems.tag}{" "}
                    {getLabel ? getLabel("Question Tags") : "Question Tags"}
                  </span>
                  <span>৳{selectedItems.tag * getItemPrice("tag")}</span>
                </div>
              )}
              {featureStates.question && selectedItems.question > 0 && (
                <div className="summary-item">
                  <span>
                    {selectedItems.question}{" "}
                    {getLabel ? getLabel("Questions") : "Questions"}
                  </span>
                  <span>
                    ৳{selectedItems.question * getItemPrice("question")}
                  </span>
                </div>
              )}
              {featureStates.survey && selectedItems.survey > 0 && (
                <div className="summary-item">
                  <span>
                    {selectedItems.survey}{" "}
                    {getLabel ? getLabel("Surveys") : "Surveys"}
                  </span>
                  <span>৳{selectedItems.survey * getItemPrice("survey")}</span>
                </div>
              )}
              {featureStates.participant && selectedItems.participant > 0 && (
                <div className="summary-item">
                  <span>
                    {selectedItems.participant}{" "}
                    {getLabel
                      ? getLabel("Survey Participants")
                      : "Survey Participants"}
                  </span>
                  <span>
                    ৳{selectedItems.participant * getItemPrice("participant")}
                  </span>
                </div>
              )}
              {featureStates.advanced_analysis && (
                <div className="summary-item">
                  <span>
                    {getLabel
                      ? getLabel("Advanced Analysis")
                      : "Advanced Analysis"}
                  </span>
                  <span>৳{getItemPrice("advanced_analysis")}</span>
                </div>
              )}
              {selectedValidity && (
                <div className="summary-item validity-summary">
                  <span>
                    {getLabel ? getLabel("Validity") : "Validity"}:{" "}
                    {formatValidityDisplay(selectedValidity.days)}
                  </span>
                  <span>
                    {selectedValidity.price_multiplier !== 1 && (
                      <>x{selectedValidity.price_multiplier}</>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Base Price */}
            <div className="summary-subtotal">
              <span>{getLabel ? getLabel("Subtotal") : "Subtotal"}: ৳{basePrice}</span>
            </div>

            {/* Discount Information */}
            {appliedCoupon && appliedCoupon.data && discountAmount > 0 && (
              <div className="summary-discount">
                <span>
                  {getLabel ? getLabel("Discount") : "Discount"} ({appliedCoupon.code}):
                  -৳{discountAmount}
                </span>
              </div>
            )}

            {/* Final Total */}
            <div className="summary-total">
              <strong>
                {getLabel ? getLabel("Total") : "Total"}: ৳{finalPrice}
              </strong>
            </div>
          </div>

          <div className="custom-package-actions">
            <div className="coupon-section">
              <button
                className="coupon-link"
                onClick={() => setIsCouponOverlayOpen(true)}
              >
                {getLabel ? getLabel("Have a coupon?") : "Have a coupon?"} 🎟️
              </button>
              {appliedCoupon && (
                <div className="applied-coupon-info">
                  <span className="coupon-applied-text">
                    ✅ Coupon {appliedCoupon.code} applied
                    {appliedCoupon.data && (
                      <span className="coupon-discount-text">
                        ({appliedCoupon.data.discount_percentage}% off)
                      </span>
                    )}
                  </span>
                  <button
                    className="remove-coupon-btn"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              className="buy-custom-btn"
              onClick={handleCustomPackagePurchase}
              disabled={
                processingPurchase ||
                !Object.values(featureStates).some((state) => state) ||
                Object.keys(validationErrors).some(
                  (key) => validationErrors[key]
                )
              }
            >
              {processingPurchase
                ? (getLabel ? getLabel("Processing...") : "Processing...")
                : `${getLabel ? getLabel("Buy Now") : "Buy Now"} : ৳${finalPrice}`
              }
            </button>
          </div>
        </>
      )}

      <CouponOverlay
        isOpen={isCouponOverlayOpen}
        onClose={() => setIsCouponOverlayOpen(false)}
        totalAmount={basePrice}
        onApplyCoupon={handleApplyCoupon}
      />
    </div>
  );
};

export default CustomPackageBuilder;