import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminPackageCustomizer = ({ getLabel }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state for operations
    const [formData, setFormData] = useState({
        title: '',
        tag: '',
        question: '',
        survey: '',
        original_price: '',
        discount_price: '',
        validity: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch packages from API
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:2000/api/admin/get-all-packages');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            //sorting packages by price in ascending order
            data.packages.sort((a, b) => a.original_price - b.original_price);
            setPackages(data.packages || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
            // Mock data for demonstration
            setPackages([
                {
                    id: 1,
                    title: "Starter",
                    tag: 10,
                    question: 50,
                    survey: 5,
                    original_price: 999,
                    discount_price: 799,
                    validity: 30
                },
                {
                    id: 2,
                    title: "Recommended",
                    tag: 25,
                    question: 150,
                    survey: 15,
                    original_price: 2499,
                    discount_price: 1999,
                    validity: 90
                },
                {
                    id: 3,
                    title: "Yearly",
                    tag: 100,
                    question: 500,
                    survey: 50,
                    original_price: 9999,
                    discount_price: 7999,
                    validity: 365
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            tag: '',
            question: '',
            survey: '',
            original_price: '',
            discount_price: '',
            validity: ''
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = getLabel('Title is required');
        if (!formData.tag || formData.tag < 1) newErrors.tag = getLabel('Valid tag count is required');
        if (!formData.question || formData.question < 1) newErrors.question = getLabel('Valid question count is required');
        if (!formData.survey || formData.survey < 1) newErrors.survey = getLabel('Valid survey count is required');
        if (!formData.original_price || formData.original_price < 0) newErrors.original_price = getLabel('Valid original price is required');
        if (!formData.discount_price || formData.discount_price < 0) newErrors.discount_price = getLabel('Valid discount price is required');
        if (!formData.validity || formData.validity < 1) newErrors.validity = getLabel('Valid validity days is required');

        if (parseFloat(formData.discount_price) > parseFloat(formData.original_price)) {
            newErrors.discount_price = getLabel('Discount price cannot be higher than original price');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddPackage = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditPackage = (pkg) => {
        setSelectedPackage(pkg);
        setFormData({
            title: pkg.title,
            tag: pkg.tag.toString(),
            question: pkg.question.toString(),
            survey: pkg.survey.toString(),
            original_price: pkg.original_price.toString(),
            discount_price: pkg.discount_price.toString(),
            validity: pkg.validity.toString()
        });
        setShowEditModal(true);
    };

    const handleDeletePackage = (pkg) => {
        setSelectedPackage(pkg);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedPackage) return;

        try {
            setIsSubmitting(true);

            const response = await fetch(`http://localhost:2000/api/admin/delete-package/${selectedPackage.package_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Delete success:', data.message);

            // Only update state if API call was successful
            setPackages(packages.filter(pkg => pkg.id !== selectedPackage.id));
            setShowDeleteModal(false);
            setSelectedPackage(null);
            fetchPackages();

        } catch (error) {
            console.error('Error deleting package:', error);
            alert(`Failed to delete package: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSavePackage = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const packageData = {
                ...formData,
                tag: parseInt(formData.tag),
                question: parseInt(formData.question),
                survey: parseInt(formData.survey),
                original_price: parseFloat(formData.original_price),
                discount_price: parseFloat(formData.discount_price),
                validity: parseInt(formData.validity)
            };

            let response;
            let updatedPackages;

            if (showEditModal) {
                // API call to update package
                response = await fetch(`http://localhost:2000/api/admin/update-package/${selectedPackage.package_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packageData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Update success:', data.message);

                // Update local state with the returned package data
                updatedPackages = packages.map(pkg =>
                    pkg.id === selectedPackage.id
                        ? { ...pkg, ...packageData }
                        : pkg
                );
                setPackages(updatedPackages);
                fetchPackages();
                setShowEditModal(false);

            } else {
                // API call to create package
                response = await fetch('http://localhost:2000/api/admin/create-package', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packageData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Create success:', data.message);

                // Use the returned package data instead of creating a new object
                const newPackage = data.package || {
                    id: Date.now(), // Fallback ID
                    ...packageData
                };

                setPackages([...packages, newPackage]);
                fetchPackages();
                setShowAddModal(false);
            }

            resetForm();
            setSelectedPackage(null);

        } catch (error) {
            console.error('Error saving package:', error);
            alert(`Failed to save package: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return `৳ ${price.toLocaleString()}`;
    };

    const calculateDiscount = (original, discount) => {
        return Math.round(((original - discount) / original) * 100);
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="admin-spinner"></div>
                <p>{getLabel("Loading packages...")}</p>
            </div>
        );
    }

    return (
        <div className="admin-package-customizer">
            {/* Header Section */}
            <div className="admin-package-header">
                <div className="admin-package-header-content">
                    <div className="admin-package-header-info">
                        <h2 className="admin-package-title">
                            {getLabel("Package Management")}
                        </h2>
                        <p className="admin-package-subtitle">
                            {getLabel("Manage and customize premium packages for your users")}
                        </p>
                    </div>
                    <button
                        onClick={handleAddPackage}
                        className="admin-add-package-btn"
                        disabled={isSubmitting}
                    >
                        <span className="btn-icon">➕</span>
                        {getLabel("Add Package")}
                    </button>
                </div>
            </div>

            {/* Package Statistics */}
            <div className="admin-package-stats">
                <div className="package-stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{packages.length}</h3>
                        <p>{getLabel("Total Packages")}</p>
                    </div>
                </div>
                <div className="package-stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>{packages.filter(pkg => pkg.discount_price < pkg.original_price).length}</h3>
                        <p>{getLabel("Discounted")}</p>
                    </div>
                </div>
                <div className="package-stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>{packages.filter(pkg => pkg.discount_price > 0).length}</h3>
                        <p>{getLabel("Premium")}</p>
                    </div>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="admin-packages-grid">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="admin-package-card">
                        {/* Package Header */}
                        <div className="package-card-header">
                            <div className="package-header-row">
                                <h3 className="package-title">{pkg.title}</h3>
                                {/* <div className="package-actions">
                                    <button
                                        onClick={() => handleDeletePackage(pkg)}
                                        className="package-action-btn dtl-btn"
                                        title={getLabel("Delete Package")}
                                        disabled={isSubmitting}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleEditPackage(pkg)}
                                        className="package-action-btn edit-btn"
                                        title={getLabel("Edit Package")}
                                        disabled={isSubmitting}
                                    >
                                        Edit
                                    </button>

                                </div> */}
                            </div>
                            <div className="package-validity-row">
                                <span className="validity-badge">
                                    {pkg.validity} {getLabel("days")}
                                </span>
                            </div>
                        </div>

                        {/* Package Features */}
                        <div className="package-features">
                            <div className="feature-item">
                                <div className="feature-label">
                                    {/* <span className="feature-icon">🏷️</span> */}
                                    <span>{getLabel("Tags")}</span>
                                </div>
                                <span className="feature-value">{pkg.tag}</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-label">
                                    {/* <span className="feature-icon">❓</span> */}
                                    <span>{getLabel("Questions")}</span>
                                </div>
                                <span className="feature-value">{pkg.question}</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-label">
                                    {/* <span className="feature-icon">📄</span> */}
                                    <span>{getLabel("Surveys")}</span>
                                </div>
                                <span className="feature-value">{pkg.survey}</span>
                            </div>
                        </div>

                        {/* Package Pricing */}
                        <div className="package-pricing">
                            <div className="pricing-main">
                                <div className="current-price">
                                    <span className="price-amount">{formatPrice(pkg.discount_price)}</span>
                                    <span className="discount-badge">
                                        {calculateDiscount(pkg.original_price, pkg.discount_price)}% {getLabel("OFF")}
                                    </span>
                                </div>
                                <span className="original-price">{formatPrice(pkg.original_price)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3 className="modal-title">
                                {showEditModal ? getLabel('Edit Package') : getLabel('Add New Package')}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="modal-close-btn"
                                title={getLabel("Close")}
                                disabled={isSubmitting}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label className="form-label">{getLabel("Title")}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`form-input ${errors.title ? 'error' : ''}`}
                                    placeholder={getLabel("e.g., Starter, Premium, Enterprise")}
                                    disabled={isSubmitting}
                                />
                                {errors.title && <p className="error-message">{errors.title}</p>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Tags")}</label>
                                    <input
                                        type="number"
                                        value={formData.tag}
                                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                        className={`form-input ${errors.tag ? 'error' : ''}`}
                                        min="1"
                                        disabled={isSubmitting}
                                    />
                                    {errors.tag && <p className="error-message">{errors.tag}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Questions")}</label>
                                    <input
                                        type="number"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        className={`form-input ${errors.question ? 'error' : ''}`}
                                        min="1"
                                        disabled={isSubmitting}
                                    />
                                    {errors.question && <p className="error-message">{errors.question}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Surveys")}</label>
                                    <input
                                        type="number"
                                        value={formData.survey}
                                        onChange={(e) => setFormData({ ...formData, survey: e.target.value })}
                                        className={`form-input ${errors.survey ? 'error' : ''}`}
                                        min="1"
                                        disabled={isSubmitting}
                                    />
                                    {errors.survey && <p className="error-message">{errors.survey}</p>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Original Price")} (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.original_price}
                                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                        className={`form-input ${errors.original_price ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                        disabled={isSubmitting}
                                    />
                                    {errors.original_price && <p className="error-message">{errors.original_price}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Discount Price")} (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.discount_price}
                                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                                        className={`form-input ${errors.discount_price ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                        disabled={isSubmitting}
                                    />
                                    {errors.discount_price && <p className="error-message">{errors.discount_price}</p>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{getLabel("Validity")} ({getLabel("Days")})</label>
                                <input
                                    type="number"
                                    value={formData.validity}
                                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                                    className={`form-input ${errors.validity ? 'error' : ''}`}
                                    min="1"
                                    disabled={isSubmitting}
                                />
                                {errors.validity && <p className="error-message">{errors.validity}</p>}
                            </div>

                            {formData.original_price && formData.discount_price && (
                                <div className="discount-preview">
                                    <p className="discount-info">
                                        {getLabel("Discount")}: {calculateDiscount(parseFloat(formData.original_price), parseFloat(formData.discount_price))}% {getLabel("OFF")}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer">
                            {/* <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="modal-btn cancel-btn"
                                disabled={isSubmitting}
                            >
                                {getLabel("Cancel")}
                            </button> */}
                            <button
                                onClick={handleSavePackage}
                                className="modal-btn save-btn"
                                disabled={isSubmitting}
                            >
                                {/* <span className="btn-icon">💾</span> */}
                                {isSubmitting
                                    ? getLabel("Saving...")
                                    : (showEditModal ? getLabel('Update') : getLabel('Create'))
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal delete-modal">
                        <div className="delete-modal-content">
                            <div className="delete-icon">⚠️</div>
                            <h3 className="delete-title">{getLabel("Delete Package")}</h3>
                            <p className="delete-message">
                                {getLabel("Are you sure you want to delete the")} "{selectedPackage?.title}" {getLabel("package? This action cannot be undone.")}
                            </p>
                            <div className="delete-actions">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedPackage(null);
                                    }}
                                    className="modal-btn cancel-btn"
                                    disabled={isSubmitting}
                                >
                                    {getLabel("Cancel")}
                                </button>
                                <button
                                    onClick={confirmDelete}
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

export default AdminPackageCustomizer;