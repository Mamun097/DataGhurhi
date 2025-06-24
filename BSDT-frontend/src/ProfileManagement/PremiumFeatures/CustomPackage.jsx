import React, { useState, useEffect } from 'react';

// Fixed Custom Package Builder Component
const CustomPackageBuilder = ({ getLabel, onPackageChange, handleBuyCustomPackage }) => {
  const [packageItems, setPackageItems] = useState([]);
  const [validityPeriods, setValidityPeriods] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    tag: 0,
    question: 0,
    survey: 0
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
      const isValid = selectedValidity && totalPrice > 0 && (selectedItems.tag > 0 || selectedItems.question > 0 || selectedItems.survey > 0);

      onPackageChange({
        items: selectedItems,
        validity: selectedValidity,
        totalPrice: totalPrice,
        isValid: isValid
      });
    }
  }, [selectedItems, selectedValidity, packageItems.length]);

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
        const itemsResponse = await fetchWithTimeout('http://localhost:2000/api/admin/get-package-items');
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
        // Use default items if API fails
        itemsData = [
          { item_type: 'tag', base_price_per_unit: 5 },
          { item_type: 'question', base_price_per_unit: 10 },
          { item_type: 'survey', base_price_per_unit: 20 }
        ];
      }

      // Fetch validity periods with error handling
      let validityData = [];
      try {
        const validityResponse = await fetchWithTimeout('http://localhost:2000/api/admin/get-validity-periods');
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
        // Use default validity periods if API fails
        validityData = [
          { id: 1, days: 30, price_multiplier: 1.0 },
          { id: 2, days: 90, price_multiplier: 0.9 },
          { id: 3, days: 365, price_multiplier: 0.8 }
        ];
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

      // Set fallback data even on error
      setPackageItems([
        { item_type: 'tag', base_price_per_unit: 5 },
        { item_type: 'question', base_price_per_unit: 10 },
        { item_type: 'survey', base_price_per_unit: 20 }
      ]);
      setValidityPeriods([
        { id: 1, days: 30, price_multiplier: 1.0 },
        { id: 2, days: 90, price_multiplier: 0.9 },
        { id: 3, days: 365, price_multiplier: 0.8 }
      ]);
      setSelectedValidity({ id: 1, days: 30, price_multiplier: 1.0 });
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

    const tagsPrice = selectedItems.tag * getItemPrice('tag');
    const questionsPrice = selectedItems.question * getItemPrice('question');
    const surveysPrice = selectedItems.survey * getItemPrice('survey');

    const basePrice = tagsPrice + questionsPrice + surveysPrice;
    return Math.round(basePrice * selectedValidity.price_multiplier);
  };

  const handleItemChange = (itemType, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setSelectedItems(prev => ({
      ...prev,
      [itemType]: numValue
    }));
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
            <p>{getLabel ? getLabel("Select the items you need and choose validity period") : "Select the items you need and choose validity period"}</p>
          </div>

          <div className="items-selector">
          <div className="item-selector">
              <div className="item-header">
                <span className="item-icon">📋</span>
                <h4>{getLabel ? getLabel("Surveys") : "Surveys"}</h4>
                <span className="item-price">৳{getItemPrice('survey')}/{getLabel ? getLabel("unit") : "unit"}</span>
              </div>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => handleItemChange('survey', selectedItems.survey - 1)}
                  disabled={selectedItems.survey <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={selectedItems.survey}
                  onChange={(e) => handleItemChange('survey', e.target.value)}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => handleItemChange('survey', selectedItems.survey + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="item-selector">
              <div className="item-header">
                <span className="item-icon">❓</span>
                <h4>{getLabel ? getLabel("Questions") : "Questions"}</h4>
                <span className="item-price">৳{getItemPrice('question')}/{getLabel ? getLabel("unit") : "unit"}</span>
              </div>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => handleItemChange('question', selectedItems.question - 1)}
                  disabled={selectedItems.question <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={selectedItems.question}
                  onChange={(e) => handleItemChange('question', e.target.value)}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => handleItemChange('question', selectedItems.question + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="item-selector">
              <div className="item-header">
                <span className="item-icon">🏷️</span>
                <h4>{getLabel ? getLabel("Question Tags") : "Question Tags"}</h4>
                <span className="item-price">৳{getItemPrice('tag')}/{getLabel ? getLabel("unit") : "unit"}</span>
              </div>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => handleItemChange('tag', selectedItems.tag - 1)}
                  disabled={selectedItems.tag <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={selectedItems.tag}
                  onChange={(e) => handleItemChange('tag', e.target.value)}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => handleItemChange('tag', selectedItems.tag + 1)}
                >
                  +
                </button>
              </div>
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
              {selectedItems.tag > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.tag} {getLabel ? getLabel("Question Tags") : "Question Tags"}</span>
                  <span>৳{selectedItems.tag * getItemPrice('tag')}</span>
                </div>
              )}
              {selectedItems.question > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.question} {getLabel ? getLabel("Questions") : "Questions"}</span>
                  <span>৳{selectedItems.question * getItemPrice('question')}</span>
                </div>
              )}
              {selectedItems.survey > 0 && (
                <div className="summary-item">
                  <span>{selectedItems.survey} {getLabel ? getLabel("Surveys") : "Surveys"}</span>
                  <span>৳{selectedItems.survey * getItemPrice('survey')}</span>
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
            >
              {getLabel("Buy Now")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomPackageBuilder;