import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api';
import './CouponManagement.css';

const CouponManagement = ({ getLabel }) => {
    const [coupons, setCoupons] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Form state for add/edit coupon
    const [couponForm, setCouponForm] = useState({
        code: '',
        description: '',
        discount_percentage: '',
        min_spend_req: '0',
        max_discount: '',
        max_use_count: '',
        end_at: '',
        voucher_type: 'public',
        status: true
    });

    // Generate random coupon code
    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCouponForm(prev => ({ ...prev, code: result }));
    };

    // Fetch all coupons
    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('/api/admin/coupons', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setCoupons(response.data.coupons || []);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            // Mock data for development
            setCoupons([
                {
                    voucher_id: '1',
                    code: 'WELCOME20',
                    description: 'Welcome discount for new users',
                    discount_percentage: 20,
                    min_spend_req: 50,
                    max_discount: 100,
                    max_use_count: 100,
                    voucher_type: 'public',
                    status: true,
                    created_at: '2024-01-15T10:30:00Z',
                    end_at: '2024-12-31T23:59:59Z'
                },
                {
                    voucher_id: '2',
                    code: 'PREMIUM50',
                    description: 'Special discount for premium users',
                    discount_percentage: 50,
                    min_spend_req: 100,
                    max_discount: 200,
                    max_use_count: 50,
                    voucher_type: 'private',
                    status: true,
                    created_at: '2024-01-10T14:20:00Z',
                    end_at: '2024-06-30T23:59:59Z'
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCouponForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Reset form
    const resetForm = () => {
        setCouponForm({
            code: '',
            description: '',
            discount_percentage: '',
            min_spend_req: '0',
            max_discount: '',
            max_use_count: '',
            end_at: '',
            voucher_type: 'public',
            status: true
        });
    };

    // Prepare form data for API submission
    const prepareFormData = (formData) => {
        const prepared = {
            code: formData.code.trim(),
            description: formData.description.trim(),
            discount_percentage: parseFloat(formData.discount_percentage),
            min_spend_req: parseFloat(formData.min_spend_req),
            max_discount: parseFloat(formData.max_discount),
            voucher_type: formData.voucher_type,
            status: formData.status,
            end_at: formData.end_at
        };

        // Only include max_use_count if it has a value
        if (formData.max_use_count && formData.max_use_count.trim() !== '') {
            prepared.max_use_count = parseInt(formData.max_use_count);
        }

        return prepared;
    };

    // Handle add coupon
    const handleAddCoupon = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const preparedData = prepareFormData(couponForm);

            console.log('Sending coupon data:', preparedData); // Debug log

            const response = await apiClient.post('/api/admin/coupons', preparedData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201 || response.status === 200) {
                fetchCoupons();
                setShowAddModal(false);
                resetForm();
                //alert('Coupon created successfully!');
            }
        } catch (error) {
            console.error('Failed to create coupon:', error);

            // More detailed error handling
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                alert(`Failed to create coupon: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                console.error('Request error:', error.request);
                alert('Network error. Please check your connection and try again.');
            } else {
                console.error('Error:', error.message);
                alert('Failed to create coupon. Please try again.');
            }
        }
    };

    // Handle edit coupon
    const handleEditCoupon = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const preparedData = prepareFormData(couponForm);

            console.log('Updating coupon data:', preparedData); // Debug log

            const response = await apiClient.put(
                `/api/admin/coupons/${selectedCoupon.voucher_id}`,
                preparedData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                fetchCoupons();
                setShowEditModal(false);
                setSelectedCoupon(null);
                resetForm();
                //alert('Coupon updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update coupon:', error);

            // More detailed error handling
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                alert(`Failed to update coupon: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                console.error('Request error:', error.request);
                alert('Network error. Please check your connection and try again.');
            } else {
                console.error('Error:', error.message);
                alert('Failed to update coupon. Please try again.');
            }
        }
    };

    // Handle delete coupon
    const handleDeleteCoupon = async (couponId) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.delete(`/api/admin/coupons/${couponId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                fetchCoupons();
                //alert('Coupon deleted successfully!');
            }
        } catch (error) {
            console.error('Failed to delete coupon:', error);
            alert('Failed to delete coupon. Please try again.');
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (couponId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.patch(
                `/api/admin/coupons/${couponId}/status`,
                { status: !currentStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 200) {
                fetchCoupons();
                //alert(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            }
        } catch (error) {
            console.error('Failed to update coupon status:', error);
            alert('Failed to update coupon status. Please try again.');
        }
    };

    // Open edit modal
    const openEditModal = (coupon) => {
        setSelectedCoupon(coupon);

        // Format the date properly for datetime-local input
        const endDate = new Date(coupon.end_at);
        const formattedDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);

        setCouponForm({
            code: coupon.code || '',
            description: coupon.description || '',
            discount_percentage: coupon.discount_percentage?.toString() || '',
            min_spend_req: coupon.min_spend_req?.toString() || '0',
            max_discount: coupon.max_discount?.toString() || '',
            max_use_count: coupon.max_use_count?.toString() || '',
            end_at: formattedDate,
            voucher_type: coupon.voucher_type || 'public',
            status: coupon.status !== undefined ? coupon.status : true
        });
        setShowEditModal(true);
    };

    // Filter and sort coupons
    const filteredAndSortedCoupons = coupons
        .filter(coupon => {
            const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && coupon.status) ||
                (filterStatus === 'inactive' && !coupon.status);
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'created_at' || sortField === 'end_at') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="coupon-management">
            <div className="coupon-management-header">
                <div className="header-content">
                    <h2>{getLabel('Coupon Management')}</h2>
                    <p>{getLabel('Create and manage discount coupons for your platform')}</p>
                </div>
                <button
                    className="add-coupon-btn"
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                >
                    <span>+</span> {getLabel('Add New Coupon')}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="coupon-stats">
                <div className="stat-card">
                    <div className="stat-number">{coupons.length}</div>
                    <div className="stat-label">{getLabel('Total Coupons')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{coupons.filter(c => c.status).length}</div>
                    <div className="stat-label">{getLabel('Active Coupons')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{coupons.filter(c => !c.status).length}</div>
                    <div className="stat-label">{getLabel('Inactive Coupons')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{coupons.filter(c => new Date(c.end_at) < new Date()).length}</div>
                    <div className="stat-label">{getLabel('Expired Coupons')}</div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="coupon-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder={getLabel('Search coupons...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-controls">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">{getLabel('All Status')}</option>
                        <option value="active">{getLabel('Active')}</option>
                        <option value="inactive">{getLabel('Inactive')}</option>
                    </select>
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value)}
                    >
                        <option value="created_at">{getLabel('Created Date')}</option>
                        <option value="code">{getLabel('Coupon Code')}</option>
                        <option value="discount_percentage">{getLabel('Discount %')}</option>
                        <option value="end_at">{getLabel('End Date')}</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="desc">{getLabel('Descending')}</option>
                        <option value="asc">{getLabel('Ascending')}</option>
                    </select>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="coupons-table-container">
                {loading ? (
                    <div className="loading">{getLabel('Loading coupons...')}</div>
                ) : (
                    <table className="coupons-table">
                        <thead>
                            <tr>
                                <th>{getLabel('Code')}</th>
                                <th>{getLabel('Description')}</th>
                                <th>{getLabel('Discount')}</th>
                                <th>{getLabel('Min Spend')}</th>
                                <th>{getLabel('Max Discount')}</th>
                                <th>{getLabel('Type')}</th>
                                <th>{getLabel('Status')}</th>
                                <th>{getLabel('End Date')}</th>
                                <th>{getLabel('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        {getLabel('No coupons found')}
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedCoupons.map((coupon) => (
                                    <tr key={coupon.voucher_id}>
                                        <td className="coupon-code">{coupon.code}</td>
                                        <td className="coupon-description">{coupon.description}</td>
                                        <td>{coupon.discount_percentage}%</td>
                                        <td>৳{coupon.min_spend_req}</td>
                                        <td>৳{coupon.max_discount}</td>
                                        <td>
                                            <span className={`type-badge ${coupon.voucher_type}`}>
                                                {coupon.voucher_type}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`status-toggle ${coupon.status ? 'active' : 'inactive'}`}
                                                onClick={() => handleStatusToggle(coupon.voucher_id, coupon.status)}
                                            >
                                                {coupon.status ? getLabel('Active') : getLabel('Inactive')}
                                            </button>
                                        </td>
                                        <td className={new Date(coupon.end_at) < new Date() ? 'expired' : ''}>
                                            {formatDate(coupon.end_at)}
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => openEditModal(coupon)}
                                                title={getLabel('Edit')}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteCoupon(coupon.voucher_id)}
                                                title={getLabel('Delete')}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Coupon Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{getLabel('Add New Coupon')}</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddCoupon}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{getLabel('Coupon Code')} *</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            name="code"
                                            value={couponForm.code}
                                            onChange={handleFormChange}
                                            placeholder={getLabel('Enter coupon code')}
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        {/* <button
                                            type="button"
                                            onClick={generateCouponCode}
                                            className="generate-btn"
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {getLabel('Generate')}
                                        </button> */}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Coupon Type')} *</label>
                                    <select
                                        name="voucher_type"
                                        value={couponForm.voucher_type}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="public">{getLabel('Public')}</option>
                                        <option value="private">{getLabel('Private')}</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>{getLabel('Description')} *</label>
                                    <textarea
                                        name="description"
                                        value={couponForm.description}
                                        onChange={handleFormChange}
                                        placeholder={getLabel('Enter coupon description')}
                                        required
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Discount Percentage')} * (0-100)</label>
                                    <input
                                        type="number"
                                        name="discount_percentage"
                                        value={couponForm.discount_percentage}
                                        onChange={handleFormChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Minimum Spend Required')} *</label>
                                    <input
                                        type="number"
                                        name="min_spend_req"
                                        value={couponForm.min_spend_req}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Maximum Discount Amount')} *</label>
                                    <input
                                        type="number"
                                        name="max_discount"
                                        value={couponForm.max_discount}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Maximum Use Count')} ({getLabel('Optional')})</label>
                                    <input
                                        type="number"
                                        name="max_use_count"
                                        value={couponForm.max_use_count}
                                        onChange={handleFormChange}
                                        min="1"
                                        placeholder={getLabel('Unlimited')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('End Date')} *</label>
                                    <input
                                        type="datetime-local"
                                        name="end_at"
                                        value={couponForm.end_at}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={couponForm.status}
                                            onChange={handleFormChange}
                                        />
                                        {getLabel('Active')}
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {getLabel('Create Coupon')}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                >
                                    {getLabel('Cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Coupon Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{getLabel('Edit Coupon')}</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedCoupon(null);
                                    resetForm();
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditCoupon}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{getLabel('Coupon Code')} *</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            name="code"
                                            value={couponForm.code}
                                            onChange={handleFormChange}
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        {/* <button
                                            type="button"
                                            onClick={generateCouponCode}
                                            className="generate-btn"
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {getLabel('Generate')}
                                        </button> */}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Coupon Type')} *</label>
                                    <select
                                        name="voucher_type"
                                        value={couponForm.voucher_type}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="public">{getLabel('Public')}</option>
                                        <option value="private">{getLabel('Private')}</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>{getLabel('Description')} *</label>
                                    <textarea
                                        name="description"
                                        value={couponForm.description}
                                        onChange={handleFormChange}
                                        required
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Discount Percentage')} * (0-100)</label>
                                    <input
                                        type="number"
                                        name="discount_percentage"
                                        value={couponForm.discount_percentage}
                                        onChange={handleFormChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Minimum Spend Required')} *</label>
                                    <input
                                        type="number"
                                        name="min_spend_req"
                                        value={couponForm.min_spend_req}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Maximum Discount Amount')} *</label>
                                    <input
                                        type="number"
                                        name="max_discount"
                                        value={couponForm.max_discount}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('Maximum Use Count')} ({getLabel('Optional')})</label>
                                    <input
                                        type="number"
                                        name="max_use_count"
                                        value={couponForm.max_use_count}
                                        onChange={handleFormChange}
                                        min="1"
                                        placeholder={getLabel('Unlimited')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{getLabel('End Date')} *</label>
                                    <input
                                        type="datetime-local"
                                        name="end_at"
                                        value={couponForm.end_at}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={couponForm.status}
                                            onChange={handleFormChange}
                                        />
                                        {getLabel('Active')}
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {getLabel('Update Coupon')}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedCoupon(null);
                                        resetForm();
                                    }}
                                >
                                    {getLabel('Cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;