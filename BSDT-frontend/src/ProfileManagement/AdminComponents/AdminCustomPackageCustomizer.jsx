import React, { useState, useEffect } from "react";
import "./AdminCustomPackageCustomizer.css";

const AdminCustomPackageCustomizer = ({ getLabel }) => {
    const [unitPrices, setUnitPrices] = useState([]);
    const [validityPeriods, setValidityPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal states
    const [showEditUnitPriceModal, setShowEditUnitPriceModal] = useState(false);
    const [showEditValidityModal, setShowEditValidityModal] = useState(false);
    const [showAddValidityModal, setShowAddValidityModal] = useState(false);
    const [showDeleteValidityModal, setShowDeleteValidityModal] = useState(false);
    
    // Selected items for editing
    const [selectedUnitPrice, setSelectedUnitPrice] = useState(null);
    const [selectedValidity, setSelectedValidity] = useState(null);
    
    // Form data
    const [unitPriceFormData, setUnitPriceFormData] = useState({
        base_price_per_unit: ''
    });
    const [validityFormData, setValidityFormData] = useState({
        days: '',
        price_multiplier: ''
    });
    
    // Errors
    const [unitPriceErrors, setUnitPriceErrors] = useState({});
    const [validityErrors, setValidityErrors] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchUnitPrices(), fetchValidityPeriods()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnitPrices = async () => {
        try {
            const response = await fetch('http://103.94.135.115:2000/api/admin/get-unit-price');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Sort by item_type in the descending order of base_price_per_unit
            const sortedPrices = (data.unitPrices || []).sort((a, b) => b.base_price_per_unit - a.base_price_per_unit);

            setUnitPrices(data.unitPrices || []);
        } catch (error) {
            console.error('Error fetching unit prices:', error);
            // Mock data for demonstration
            setUnitPrices([
                { id: 1, item_type: 'tag', base_price_per_unit: 0.0040 },
                { id: 2, item_type: 'question', base_price_per_unit: 0.0200 },
                { id: 3, item_type: 'survey', base_price_per_unit: 0.2500 }
            ]);
        }
    };

    const fetchValidityPeriods = async () => {
        try {
            const response = await fetch('http://103.94.135.115:2000/api/admin/get-validity-price-multiplier');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Sort by days in ascending order
            const sortedPeriods = (data.validityPeriods || []).sort((a, b) => a.days - b.days);
            setValidityPeriods(sortedPeriods);
        } catch (error) {
            console.error('Error fetching validity periods:', error);
            // Mock data for demonstration
            setValidityPeriods([
                { id: 1, days: 7, price_multiplier: 1.00 },
                { id: 2, days: 15, price_multiplier: 1.10 },
                { id: 3, days: 30, price_multiplier: 1.30 },
                { id: 4, days: 180, price_multiplier: 1.80 }
            ]);
        }
    };

    // Unit Price Functions
    const handleEditUnitPrice = (unitPrice) => {
        setSelectedUnitPrice(unitPrice);
        setUnitPriceFormData({
            base_price_per_unit: unitPrice.base_price_per_unit.toString()
        });
        setUnitPriceErrors({});
        setShowEditUnitPriceModal(true);
    };

    const validateUnitPriceForm = () => {
        const errors = {};
        if (!unitPriceFormData.base_price_per_unit || parseFloat(unitPriceFormData.base_price_per_unit) < 0) {
            errors.base_price_per_unit = getLabel("Valid price is required");
        }
        setUnitPriceErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveUnitPrice = async () => {
        if (!validateUnitPriceForm()) return;

        try {
            setIsSubmitting(true);
            
            // Demo API call - replace with actual endpoint
            const response = await fetch(`http://103.94.135.115:2000/api/admin/update-unit-price/${selectedUnitPrice.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base_price_per_unit: parseFloat(unitPriceFormData.base_price_per_unit)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update local state
            setUnitPrices(unitPrices.map(item => 
                item.id === selectedUnitPrice.id 
                    ? { ...item, base_price_per_unit: parseFloat(unitPriceFormData.base_price_per_unit) }
                    : item
            ));

            setShowEditUnitPriceModal(false);
            setSelectedUnitPrice(null);

        } catch (error) {
            console.error('Error updating unit price:', error);
            alert(`Failed to update unit price: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validity Period Functions
    const handleEditValidity = (validity) => {
        setSelectedValidity(validity);
        setValidityFormData({
            days: validity.days.toString(),
            price_multiplier: validity.price_multiplier.toString()
        });
        setValidityErrors({});
        setShowEditValidityModal(true);
    };

    const handleAddValidity = () => {
        setSelectedValidity(null);
        setValidityFormData({
            days: '',
            price_multiplier: ''
        });
        setValidityErrors({});
        setShowAddValidityModal(true);
    };

    const handleDeleteValidity = (validity) => {
        setSelectedValidity(validity);
        setShowDeleteValidityModal(true);
    };

    const validateValidityForm = () => {
        const errors = {};
        if (!validityFormData.days || parseInt(validityFormData.days) < 1) {
            errors.days = getLabel("Valid days is required");
        }
        if (!validityFormData.price_multiplier || parseFloat(validityFormData.price_multiplier) < 0) {
            errors.price_multiplier = getLabel("Valid price multiplier is required");
        }
        
        // Check if days already exist (for add mode)
        if (showAddValidityModal && validityPeriods.some(v => v.days === parseInt(validityFormData.days))) {
            errors.days = getLabel("This validity period already exists");
        }

        setValidityErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveValidity = async () => {
        if (!validateValidityForm()) return;

        try {
            setIsSubmitting(true);
            
            const validityData = {
                days: parseInt(validityFormData.days),
                price_multiplier: parseFloat(validityFormData.price_multiplier)
            };

            if (showEditValidityModal) {
                // Demo API call for update
                const response = await fetch(`http://103.94.135.115:2000/api/admin/update-validity/${selectedValidity.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validityData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Update local state
                setValidityPeriods(validityPeriods.map(item => 
                    item.id === selectedValidity.id ? { ...item, ...validityData } : item
                ).sort((a, b) => a.days - b.days));

                setShowEditValidityModal(false);
            } else if(showAddValidityModal){
                // Demo API call for create
                const response = await fetch('http://103.94.135.115:2000/api/admin/create-validity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validityData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Add to local state
                const newValidity = { id: Date.now(), ...validityData };
                setValidityPeriods([...validityPeriods, newValidity].sort((a, b) => a.days - b.days));

                setShowAddValidityModal(false);
            }

            setSelectedValidity(null);

        } catch (error) {
            console.error('Error saving validity:', error);
            alert(`Failed to save validity: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteValidity = async () => {
        if (!selectedValidity) return;

        try {
            setIsSubmitting(true);

            // Demo API call for delete
            const response = await fetch(`http://103.94.135.115:2000/api/admin/delete-validity/${selectedValidity.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update local state
            setValidityPeriods(validityPeriods.filter(item => item.id !== selectedValidity.id));
            setShowDeleteValidityModal(false);
            setSelectedValidity(null);

        } catch (error) {
            console.error('Error deleting validity:', error);
            alert(`Failed to delete validity: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return `৳ ${price.toFixed(4)}`;
    };

    const formatMultiplier = (multiplier) => {
        return `${multiplier.toFixed(2)}x`;
    };

    const getItemTypeLabel = (itemType) => {
        switch (itemType) {
            case 'tag': return getLabel("Tag");
            case 'question': return getLabel("Question");
            case 'survey': return getLabel("Survey");
            default: return itemType;
        }
    };

    const formatValidityDays = (days) => {
        if (days >= 365) {
            const years = Math.floor(days / 365);
            const remainingDays = days % 365;
            if (remainingDays === 0) {
                return `${years} ${getLabel(years === 1 ? 'year' : 'years')}`;
            } else {
                return `${years} ${getLabel(years === 1 ? 'year' : 'years')} ${remainingDays} ${getLabel(remainingDays === 1 ? 'day' : 'days')}`;
            }
        } else if (days >= 30) {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            if (remainingDays === 0) {
                return `${months} ${getLabel(months === 1 ? 'month' : 'months')}`;
            } else {
                return `${months} ${getLabel(months === 1 ? 'month' : 'months')} ${remainingDays} ${getLabel(remainingDays === 1 ? 'day' : 'days')}`;
            }
        } else {
            return `${days} ${getLabel(days === 1 ? 'day' : 'days')}`;
        }
    };

    if (loading) {
        return (
            <div className="custom-package-loading">
                <div className="admin-spinner"></div>
                <p>{getLabel("Loading custom package settings...")}</p>
            </div>
        );
    }

    return (
        <div className="admin-custom-package-customizer">
            {/* Header */}
            <div className="custom-package-header">
                <div className="custom-package-header-content">
                    <div className="custom-package-header-info">
                        <h2 className="custom-package-title">
                            {getLabel("Custom Package Management")}
                        </h2>
                        <p className="custom-package-subtitle">
                            {getLabel("Configure unit prices and validity periods for custom packages")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Unit Prices Section */}
            <div className="custom-package-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <span className="section-icon">💰</span>
                        {getLabel("Unit Prices")}
                    </h3>
                    <p className="section-subtitle">
                        {getLabel("Set base price per unit for each package item")}
                    </p>
                </div>

                <div className="unit-prices-grid">
                    {unitPrices.map((unitPrice) => (
                        <div key={unitPrice.id} className="unit-price-card">
                            <div className="unit-price-header">
                                <div className="item-type-info">
                                    <h4 className="item-type-title">
                                        {getItemTypeLabel(unitPrice.item_type)}
                                    </h4>
                                    <span className="item-type-badge">
                                        {getLabel("per unit")}
                                    </span>
                                </div>
                            </div>
                            <div className="unit-price-content">
                                <div className="price-display">
                                    <span className="price-amount">
                                        {formatPrice(unitPrice.base_price_per_unit)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleEditUnitPrice(unitPrice)}
                                    className="edit-price-btn"
                                    disabled={isSubmitting}
                                >
                                    {/* <span className="btn-icon">✏️</span> */}
                                    {getLabel("Edit Price")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Validity Periods Section */}
            <div className="custom-package-section">
                <div className="section-header with-button">
                    <div className="section-header-left">
                        <h3 className="section-title">
                            <span className="section-icon">⏰</span>
                            {getLabel("Validity Periods")}
                        </h3>
                        <p className="section-subtitle">
                            {getLabel("Configure validity periods and their price multipliers")}
                        </p>
                    </div>
                    <button
                        onClick={handleAddValidity}
                        className="add-validity-btn"
                        disabled={isSubmitting}
                    >
                        <span className="btn-icon">➕</span>
                        {getLabel("Add Validity")}
                    </button>
                </div>

                <div className="validity-periods-grid">
                    {validityPeriods.map((validity) => (
                        <div key={validity.id} className="validity-card">
                            <div className="validity-header">
                                <div className="validity-info">
                                    <h4 className="validity-days">
                                        {formatValidityDays(validity.days)}
                                    </h4>
                                    <span className="validity-raw-days">
                                        ({validity.days} {getLabel("days")})
                                    </span>
                                </div>
                                <div className="validity-actions">
                                    <button
                                        onClick={() => handleDeleteValidity(validity)}
                                        className="validity-action-btn delete-btn"
                                        title={getLabel("Delete Validity")}
                                        disabled={isSubmitting}
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => handleEditValidity(validity)}
                                        className="validity-action-btn edit-btn"
                                        title={getLabel("Edit Validity")}
                                        disabled={isSubmitting}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                            <div className="validity-content">
                                <div className="multiplier-display">
                                    <span className="multiplier-label">{getLabel("Price Multiplier")}</span>
                                    <span className="multiplier-value">
                                        {formatMultiplier(validity.price_multiplier)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Unit Price Modal */}
            {showEditUnitPriceModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3 className="modal-title">
                                {getLabel("Edit Unit Price")} - {getItemTypeLabel(selectedUnitPrice?.item_type)}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditUnitPriceModal(false);
                                    setSelectedUnitPrice(null);
                                }}
                                className="modal-close-btn"
                                disabled={isSubmitting}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label className="form-label required">
                                    {getLabel("Base Price Per Unit")} (৳) <span className="required-star">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={unitPriceFormData.base_price_per_unit}
                                    onChange={(e) => setUnitPriceFormData({ 
                                        ...unitPriceFormData, 
                                        base_price_per_unit: e.target.value 
                                    })}
                                    className={`form-input ${unitPriceErrors.base_price_per_unit ? 'error' : ''}`}
                                    min="0"
                                    step="0.0001"
                                    disabled={isSubmitting}
                                />
                                {unitPriceErrors.base_price_per_unit && (
                                    <p className="error-message">{unitPriceErrors.base_price_per_unit}</p>
                                )}
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                onClick={handleSaveUnitPrice}
                                className="modal-btn save-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? getLabel("Updating...") : getLabel("Update Price")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add Validity Modal */}
            {(showEditValidityModal || showAddValidityModal) && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3 className="modal-title">
                                {showEditValidityModal ? getLabel("Edit Validity Period") : getLabel("Add Validity Period")}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditValidityModal(false);
                                    setShowAddValidityModal(false);
                                    setSelectedValidity(null);
                                }}
                                className="modal-close-btn"
                                disabled={isSubmitting}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">
                                        {getLabel("Days")} <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={validityFormData.days}
                                        onChange={(e) => setValidityFormData({ 
                                            ...validityFormData, 
                                            days: e.target.value 
                                        })}
                                        className={`form-input ${validityErrors.days ? 'error' : ''}`}
                                        min="1"
                                        disabled={isSubmitting}
                                    />
                                    {validityErrors.days && (
                                        <p className="error-message">{validityErrors.days}</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">
                                        {getLabel("Price Multiplier")} <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={validityFormData.price_multiplier}
                                        onChange={(e) => setValidityFormData({ 
                                            ...validityFormData, 
                                            price_multiplier: e.target.value 
                                        })}
                                        className={`form-input ${validityErrors.price_multiplier ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                        disabled={isSubmitting}
                                    />
                                    {validityErrors.price_multiplier && (
                                        <p className="error-message">{validityErrors.price_multiplier}</p>
                                    )}
                                </div>
                            </div>
                            
                            {validityFormData.days && (
                                <div className="validity-preview">
                                    <p className="preview-text">
                                        {getLabel("Preview")}: {formatValidityDays(parseInt(validityFormData.days))}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                onClick={handleSaveValidity}
                                className="modal-btn save-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? getLabel("Saving...")
                                    : (showEditValidityModal ? getLabel("Update") : getLabel("Create"))
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Validity Modal */}
            {showDeleteValidityModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal delete-modal">
                        <div className="delete-modal-content">
                            <div className="delete-icon">⚠️</div>
                            <h3 className="delete-title">{getLabel("Delete Validity Period")}</h3>
                            <p className="delete-message">
                                {getLabel("Are you sure you want to delete the")} {formatValidityDays(selectedValidity?.days)} {getLabel("validity period? This action cannot be undone.")}
                            </p>
                            <div className="delete-actions">
                                <button
                                    onClick={() => {
                                        setShowDeleteValidityModal(false);
                                        setSelectedValidity(null);
                                    }}
                                    className="modal-btn cancel-btn"
                                    disabled={isSubmitting}
                                >
                                    {getLabel("Cancel")}
                                </button>
                                <button
                                    onClick={confirmDeleteValidity}
                                    className="modal-btn delete-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? getLabel("Deleting...") : getLabel("Delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomPackageCustomizer;