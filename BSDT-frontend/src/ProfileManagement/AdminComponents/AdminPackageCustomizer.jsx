import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminPackageCustomizer = ({ getLabel }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
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
            const data = await response.json();
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
        try {
            // API call to delete package
            await fetch(`http://localhost:2000/api/admin/delete-package/${selectedPackage.id}`, {
                method: 'DELETE'
            });
            
            setPackages(packages.filter(pkg => pkg.id !== selectedPackage.id));
            setShowDeleteModal(false);
            setSelectedPackage(null);
        } catch (error) {
            console.error('Error deleting package:', error);
        }
    };

    const handleSavePackage = async () => {
        if (!validateForm()) return;

        try {
            const packageData = {
                ...formData,
                tag: parseInt(formData.tag),
                question: parseInt(formData.question),
                survey: parseInt(formData.survey),
                original_price: parseFloat(formData.original_price),
                discount_price: parseFloat(formData.discount_price),
                validity: parseInt(formData.validity)
            };

            if (showEditModal) {
                // API call to update package
                await fetch(`http://localhost:2000/api/admin/update-package/${selectedPackage.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packageData)
                });

                setPackages(packages.map(pkg => 
                    pkg.id === selectedPackage.id 
                        ? { ...pkg, ...packageData }
                        : pkg
                ));
                setShowEditModal(false);
            } else {
                // API call to create package
                const response = await fetch('http://localhost:2000/api/admin/create-package', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(packageData)
                });

                const newPackage = {
                    id: Date.now(),
                    ...packageData
                };
                setPackages([...packages, newPackage]);
                setShowAddModal(false);
            }

            resetForm();
            setSelectedPackage(null);
        } catch (error) {
            console.error('Error saving package:', error);
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
                            <span className="admin-package-icon">📦</span>
                            {getLabel("Package Management")}
                        </h2>
                        <p className="admin-package-subtitle">
                            {getLabel("Manage and customize premium packages for your users")}
                        </p>
                    </div>
                    <button
                        onClick={handleAddPackage}
                        className="admin-add-package-btn"
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
                        <h3>{packages.filter(pkg => pkg.title.toLowerCase().includes('premium') || pkg.title.toLowerCase().includes('recommended')).length}</h3>
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
                            <div className="package-header-info">
                                <h3 className="package-title">{pkg.title}</h3>
                                <div className="package-validity">
                                    <span className="validity-badge">
                                        {pkg.validity} {getLabel("days")}
                                    </span>
                                </div>
                            </div>
                            <div className="package-actions">
                                <button
                                    onClick={() => handleEditPackage(pkg)}
                                    className="package-action-btn edit-btn"
                                    title={getLabel("Edit Package")}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeletePackage(pkg)}
                                    className="package-action-btn delete-btn"
                                    title={getLabel("Delete Package")}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* Package Features */}
                        <div className="package-features">
                            <div className="feature-item">
                                <div className="feature-label">
                                    <span className="feature-icon">🏷️</span>
                                    <span>{getLabel("Tags")}</span>
                                </div>
                                <span className="feature-value">{pkg.tag}</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-label">
                                    <span className="feature-icon">❓</span>
                                    <span>{getLabel("Questions")}</span>
                                </div>
                                <span className="feature-value">{pkg.question}</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-label">
                                    <span className="feature-icon">📄</span>
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
                            {/* <div className="pricing-duration">
                                <span className="duration-icon">📅</span>
                                <span className="duration-text">{pkg.validity}{getLabel("d")}</span>
                            </div> */}
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
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className={`form-input ${errors.title ? 'error' : ''}`}
                                    placeholder={getLabel("e.g., Starter, Premium, Enterprise")}
                                />
                                {errors.title && <p className="error-message">{errors.title}</p>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Tags")}</label>
                                    <input
                                        type="number"
                                        value={formData.tag}
                                        onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                        className={`form-input ${errors.tag ? 'error' : ''}`}
                                        min="1"
                                    />
                                    {errors.tag && <p className="error-message">{errors.tag}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Questions")}</label>
                                    <input
                                        type="number"
                                        value={formData.question}
                                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                                        className={`form-input ${errors.question ? 'error' : ''}`}
                                        min="1"
                                    />
                                    {errors.question && <p className="error-message">{errors.question}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Surveys")}</label>
                                    <input
                                        type="number"
                                        value={formData.survey}
                                        onChange={(e) => setFormData({...formData, survey: e.target.value})}
                                        className={`form-input ${errors.survey ? 'error' : ''}`}
                                        min="1"
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
                                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                                        className={`form-input ${errors.original_price ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.original_price && <p className="error-message">{errors.original_price}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{getLabel("Discount Price")} (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.discount_price}
                                        onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
                                        className={`form-input ${errors.discount_price ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.discount_price && <p className="error-message">{errors.discount_price}</p>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{getLabel("Validity")} ({getLabel("Days")})</label>
                                <input
                                    type="number"
                                    value={formData.validity}
                                    onChange={(e) => setFormData({...formData, validity: e.target.value})}
                                    className={`form-input ${errors.validity ? 'error' : ''}`}
                                    min="1"
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
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="modal-btn cancel-btn"
                            >
                                {getLabel("Cancel")}
                            </button>
                            <button
                                onClick={handleSavePackage}
                                className="modal-btn save-btn"
                            >
                                <span className="btn-icon">💾</span>
                                {showEditModal ? getLabel('Update') : getLabel('Create')}
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
                                >
                                    {getLabel("Cancel")}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="modal-btn delete-btn"
                                >
                                    {getLabel("Delete")}
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