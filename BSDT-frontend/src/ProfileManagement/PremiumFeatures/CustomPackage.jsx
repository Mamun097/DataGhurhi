import React, { useState, useEffect } from 'react';

// Updated Custom Package Builder Component with Premium Features
const CustomPackageBuilder = ({ getLabel, onPackageChange, handleBuyCustomPackage }) => {
  const [packageItems, setPackageItems] = useState([]);
  const [validityPeriods, setValidityPeriods] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    tag: 0,
    question: 0,
    survey: 0,
    participant: 0
  });
  const [featureStates, setFeatureStates] = useState({
    tag: false,
    question: false,
    survey: false,
    participant: false,
    advanced_analysis: false
  });
  const [selectedValidity, setSelectedValidity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomPackageData();
  }, []);

  useEffect(() => {
    // Only call onPackageChange if it exists and packageItems are loaded
    if (onPackageChange && packageItems.length > 0) {
      const totalPrice = calculateCustomPackagePrice();
      const hasAnyFeature = Object.values(featureStates).some(state => state);
      const hasValidItems = (featureStates.tag && selectedItems.tag > 0) ||
        (featureStates.question && selectedItems.question > 0) ||
        (featureStates.survey && selectedItems.survey > 0) ||
        (featureStates.participant && selectedItems.participant > 0) ||
        featureStates.advanced_analysis;

      onPackageChange({
        items: selectedItems,
        features: featureStates,
        validity: selectedValidity,
        totalPrice: totalPrice,
        isValid: selectedValidity && hasAnyFeature && hasValidItems
      });
    }
  }, [selectedItems, featureStates, selectedValidity, packageItems.length]);

  const fetchCustomPackageData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add timeout and better error handling
      const fetchWithTimeout = (url, timeout = 10000) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };

      // Fetch package items with error handling
      let itemsData = [];
      try {
        const itemsResponse = await fetchWithTimeout('http://103.94.135.115:2000/api/admin/get-package-items');
        if (!itemsResponse.ok) {
          throw new Error(`Failed to fetch package items: ${itemsResponse.status}`);
        }
        const itemsJson = await itemsResponse.json();
        // Handle both response formats: {packageItems: [...]} or direct array
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
        console.error('Error fetching package items:', itemsError);
      }

      // Fetch validity periods with error handling
      let validityData = [];
      try {
        const validityResponse = await fetchWithTimeout('http://103.94.135.115:2000/api/admin/get-validity-periods');
        if (!validityResponse.ok) {
          throw new Error(`Failed to fetch validity periods: ${validityResponse.status}`);
        }
        const validityJson = await validityResponse.json();
        // Handle both response formats: {validityPeriods: [...]} or direct array
        if (validityJson.validityPeriods && Array.isArray(validityJson.validityPeriods)) {
          validityData = validityJson.validityPeriods;
        } else if (validityJson.periods && Array.isArray(validityJson.periods)) {
          validityData = validityJson.periods;
        } else if (Array.isArray(validityJson)) {
          validityData = validityJson;
        } else {
          validityData = [];
        }
      } catch (validityError) {
        console.error('Error fetching validity periods:', validityError);
      }

      console.log('Package Items:', itemsData);
      console.log('Validity Periods:', validityData);

      setPackageItems(itemsData);
      //sort validity periods by days in ascending order
      validityData.sort((a, b) => a.days - b.days);
      setValidityPeriods(validityData);

      // Set default validity to the first option
      if (validityData && validityData.length > 0) {
        setSelectedValidity(validityData[0]);
      }

    } catch (err) {
      console.error('Error in fetchCustomPackageData:', err);
      setError(err.message);
      
    } finally {
      setLoading(false);
    }
  };

  const getItemPrice = (itemType) => {
    // Ensure packageItems is an array and has items
    if (!Array.isArray(packageItems) || packageItems.length === 0) {
      return 0;
    }
    const item = packageItems.find(item => item.item_type === itemType);
    return item ? item.base_price_per_unit : 0;
  };

  const calculateCustomPackagePrice = () => {
    if (!selectedValidity || !Array.isArray(packageItems) || packageItems.length === 0) {
      return 0;
    }

    let basePrice = 0;

    // Calculate price for quantity-based features
    if (featureStates.tag) {
      basePrice += selectedItems.tag * getItemPrice('tag');
    }
    if (featureStates.question) {
      basePrice += selectedItems.question * getItemPrice('question');
    }
    if (featureStates.survey) {
      basePrice += selectedItems.survey * getItemPrice('survey');
    }
    if (featureStates.participant) {
      basePrice += selectedItems.participant * getItemPrice('participant');
    }

    // Add advanced analysis if enabled
    if (featureStates.advanced_analysis) {
      basePrice += getItemPrice('advanced_analysis');
    }

    return Math.round(basePrice * selectedValidity.price_multiplier);
  };

  const handleItemChange = (itemType, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setSelectedItems(prev => ({
      ...prev,
      [itemType]: numValue
    }));
  };

  const handleFeatureToggle = (featureType) => {
    setFeatureStates(prev => ({
      ...prev,
      [featureType]: !prev[featureType]
    }));

    // Reset quantity to 0 when feature is disabled
    if (featureStates[featureType] && ['tag', 'question', 'survey', 'participant'].includes(featureType)) {
      setSelectedItems(prev => ({
        ...prev,
        [featureType]: 0
      }));
    }
  };

  const formatValidityDisplay = (days) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    } else {
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }
  };

  const getFeatureIcon = (featureType) => {
    const icons = {
      survey: '📋',
      question: '❓',
      tag: '🏷️',
      participant: '👥',
      advanced_analysis: '📊'
    };
    return icons[featureType] || '📦';
  };

  const getFeatureLabel = (featureType) => {
    const labels = {
      survey: 'Survey',
      question: 'Question',
      tag: 'Question Tag',
      participant: 'Survey Participants',
      advanced_analysis: 'Advanced Statistical Analyses'
    };
    return getLabel ? getLabel(labels[featureType]) : labels[featureType];
  };

  const renderQuantityFeature = (featureType) => (
    <label className="feature-option">
      <input
        type="checkbox"
        checked={featureStates[featureType]}
        onChange={() => handleFeatureToggle(featureType)}
      />
      <div className="feature-card">
        <div className="feature-header">
          <div className="feature-icon">{getFeatureIcon(featureType)}</div>
          <h4>{getFeatureLabel(featureType)}</h4>
          <span className="feature-price">৳{getItemPrice(featureType)}/unit</span>
        </div>
        {/* <div className="feature-description">
          <p>Add {getFeatureLabel(featureType).toLowerCase()} to your package</p>
        </div> */}
        <div className={`quantity-controls ${!featureStates[featureType] ? 'disabled' : ''}`}>
          <span className="quantity-label">Quantity:</span>
          <input
            type="number"
            min="0"
            value={featureStates[featureType] ? selectedItems[featureType] : 0}
            onChange={(e) => handleItemChange(featureType, e.target.value)}
            disabled={!featureStates[featureType]}
            placeholder="0"
          />
        </div>
      </div>
    </label>
  );

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
          <p>{getLabel ? getLabel("Unlock advanced statistical analyses and insights along with basic ones") : "Unlock advanced statistical analyses and insights along with basic ones"}</p>
        </div>
      </div>
    </label>
  );

  // Always render something, even during loading
  return (
    <div className="custom-package-builder">
      {loading ? (
        <div className="custom-package-loading">
          <div className="loading-spinner"></div>
          <p>{getLabel ? getLabel("Loading customization options...") : "Loading customization options..."}</p>
        </div>
      ) : error ? (
        <div className="custom-package-error">
          <span className="error-icon">⚠️</span>
          <p>{getLabel ? getLabel("Failed to load customization options.") : "Failed to load customization options."}</p>
          <button className="retry-btn" onClick={fetchCustomPackageData}>
            {getLabel ? getLabel("Retry") : "Retry"}
          </button>
        </div>
      ) : (
        <>
          <div className="builder-header">
            <h3>{getLabel ? getLabel("Build Your Custom Package") : "Build Your Custom Package"}</h3>
            <p>{getLabel ? getLabel("Select the features you need and choose validity period") : "Select the features you need and choose validity period"}</p>
          </div>

          <div className="features-selector">
            <div className="features-grid">
              {renderQuantityFeature('survey')}
              {renderQuantityFeature('question')}
              {renderQuantityFeature('tag')}
            </div>
            <div className="features-grid-row-2">
              {renderQuantityFeature('participant')}
              {renderToggleFeature('advanced_analysis')}
            </div>
          </div>

          {validityPeriods.length > 0 && (
            <div className="validity-selector">
              <h4>{getLabel ? getLabel("Choose Validity Period") : "Choose Validity Period"}</h4>
              <div className="validity-options">
                {validityPeriods.map((period) => (
                  <label key={period.id} className="validity-option">
                    <input
                      type="radio"
                      name="validity"
                      value={period.id}
                      checked={selectedValidity?.id === period.id}
                      onChange={() => setSelectedValidity(period)}
                    />
                    <div className="validity-card">
                      <span className="validity-duration">{formatValidityDisplay(period.days)}</span>
                      <span className="validity-multiplier">
                        {period.price_multiplier < 1
                          ? `${Math.round((1 - period.price_multiplier) * 100)}% ${getLabel ? getLabel("OFF") : "OFF"}`
                          : period.price_multiplier > 1
                            ? `+${Math.round((period.price_multiplier - 1) * 100)}%`
                            : (getLabel ? getLabel("Standard") : "Standard")
                        }
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="package-summary">
            <h4>{getLabel ? getLabel("Package Summary") : "Package Summary"}</h4>
            <div className="summary-items">
              {featureStates.tag && selectedItems.tag > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.tag} {getLabel ? getLabel("Question Tags") : "Question Tags"}</span>
                  <span>৳{selectedItems.tag * getItemPrice('tag')}</span>
                </div>
              )}
              {featureStates.question && selectedItems.question > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.question} {getLabel ? getLabel("Questions") : "Questions"}</span>
                  <span>৳{selectedItems.question * getItemPrice('question')}</span>
                </div>
              )}
              {featureStates.survey && selectedItems.survey > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.survey} {getLabel ? getLabel("Surveys") : "Surveys"}</span>
                  <span>৳{selectedItems.survey * getItemPrice('survey')}</span>
                </div>
              )}
              {featureStates.participant && selectedItems.participant > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.participant} {getLabel ? getLabel("Survey Participants") : "Survey Participants"}</span>
                  <span>৳{selectedItems.participant * getItemPrice('participant')}</span>
                </div>
              )}
              {featureStates.advanced_analysis && (
                <div className="summary-item">
                  <span>{getLabel ? getLabel("Advanced Analysis") : "Advanced Analysis"}</span>
                  <span>৳{getItemPrice('advanced_analysis')}</span>
                </div>
              )}
              {selectedValidity && (
                <div className="summary-item validity-summary">
                  <span>{getLabel ? getLabel("Validity") : "Validity"}: {formatValidityDisplay(selectedValidity.days)}</span>
                  <span>
                    {selectedValidity.price_multiplier !== 1 && (
                      <>x{selectedValidity.price_multiplier}</>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="summary-total">
              <strong>{getLabel ? getLabel("Total") : "Total"}: ৳ {calculateCustomPackagePrice()}</strong>
            </div>
          </div>

          <div className="custom-package-actions">
            <button
              className="buy-custom-btn"
              onClick={handleBuyCustomPackage}
              disabled={!Object.values(featureStates).some(state => state)}
            >
              {getLabel ? getLabel("Buy Now") : "Buy Now"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomPackageBuilder;