import React, { useState, useEffect } from 'react';
import './CouponOverlay.css';
import apiClient from '../../api';

const CouponOverlay = ({ isOpen, onClose, totalAmount, onApplyCoupon }) => {
    const [publicCoupons, setPublicCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manualCouponCode, setManualCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(null);
    const [manualCouponError, setManualCouponError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPublicCoupons();
            // Reset manual coupon state when overlay opens
            setManualCouponCode('');
            setManualCouponError('');
        }
    }, [isOpen]);

    const fetchPublicCoupons = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            alert(getLabel ? getLabel("Please login to purchase a package") : "Please login to purchase a package");
            return;
        }

        try {
            const response = await apiClient.get('/api/vouchers/public', {
                headers: { Authorization: "Bearer " + token },
            });

            // Handle the specific API response format with publicVouchers
            let couponsData = [];
            if (response.data && Array.isArray(response.data.publicVouchers)) {
                couponsData = response.data.publicVouchers;
            } else if (Array.isArray(response.data)) {
                couponsData = response.data;
            } else {
                console.warn('Unexpected API response format:', response.data);
                couponsData = [];
            }

            setPublicCoupons(couponsData);
        } catch (err) {
            console.error('Error fetching public coupons:', err);
            setError('Failed to load available coupons');
            setPublicCoupons([]); // Ensure it's always an array
        } finally {
            setLoading(false);
        }
    };

    const validateManualCoupon = async (couponCode) => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error('Please login to validate coupon');
        }

        try {
            console.log('Validating manual coupon:', couponCode);

            const response = await apiClient.post('/api/vouchers/validate', {
                code: couponCode.trim().toUpperCase(),
                totalAmount: totalAmount
            },
                {
                    headers: { Authorization: "Bearer " + token },
                }
            );

            console.log('Manual coupon validation response:', response.data);

            if (response.data.success && response.data.voucher) {
                return response.data.voucher;
            } else {
                throw new Error(response.data.message || 'Invalid coupon code');
            }
        } catch (err) {
            console.error('Manual coupon validation error:', err);

            // Handle different types of errors
            if (err.response) {
                // API responded with error status
                const errorMessage = err.response.data?.message || 'Invalid coupon code';
                throw new Error(errorMessage);
            } else if (err.request) {
                // Network error
                throw new Error('Unable to validate coupon. Please check your connection.');
            } else {
                // Other errors
                throw new Error(err.message || 'Failed to validate coupon');
            }
        }
    };

    const handleManualApply = async () => {
        if (!manualCouponCode.trim()) return;

        setApplyingCoupon('manual');
        setManualCouponError('');

        try {
            // Validate the manual coupon
            const couponData = await validateManualCoupon(manualCouponCode);

            // Check if coupon meets minimum spend requirement
            if (couponData.min_spend_req && totalAmount < couponData.min_spend_req) {
                throw new Error(`Minimum spend of ৳${couponData.min_spend_req} required for this coupon`);
            }

            console.log('Applying manual coupon:', manualCouponCode, couponData);
            onApplyCoupon && onApplyCoupon(manualCouponCode, 'manual', couponData);
        } catch (error) {
            console.error('Manual coupon validation failed:', error);
            setManualCouponError(error.message || 'Invalid coupon code');
        } finally {
            setApplyingCoupon(null);
        }
    };

    const handleCouponApply = (coupon) => {
        if (!isCouponApplicable(coupon)) return;

        setApplyingCoupon(coupon.code);
        // Apply the coupon immediately since it's already validated
        setTimeout(() => {
            console.log('Applying coupon:', coupon);
            onApplyCoupon && onApplyCoupon(coupon.code, 'public', coupon);
            setApplyingCoupon(null);
        }, 500);
    };

    const isCouponApplicable = (coupon) => {
        // Check if coupon is expired
        if (new Date(coupon.end_at) < new Date()) {
            return false;
        }

        // Check minimum spend requirement
        return totalAmount >= coupon.min_spend_req;
    };

    const getProgressPercentage = (coupon) => {
        return Math.min((totalAmount / coupon.min_spend_req) * 100, 100);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return `৳${amount.toLocaleString()}`;
    };

    if (!isOpen) return null;

    return (
        <div className="coupon-overlay-backdrop" onClick={onClose}>
            <div
                className="coupon-overlay"
                onClick={(e) => e.stopPropagation()}
                style={{
                    // Reset styles to prevent inheritance
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    lineHeight: 'normal',
                    textAlign: 'left',
                    textDecoration: 'none',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    wordSpacing: 'normal',
                    whiteSpace: 'normal',
                    verticalAlign: 'baseline',
                    color: '#111827',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '0',
                    boxShadow: 'none',
                    margin: '0',
                    padding: '0',
                    position: 'static'
                }}
            >
                <div className="coupon-overlay-header">
                    <h3>Apply Coupon</h3>
                    <button className="close-btn" onClick={onClose} type="button">
                        <span>&times;</span>
                    </button>
                </div>

                <div className="coupon-overlay-content">
                    {/* Manual Coupon Section */}
                    <div className="manual-coupon-section">
                        <h4>Have a coupon code?</h4>
                        <div className="manual-coupon-input">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={manualCouponCode}
                                onChange={(e) => setManualCouponCode(e.target.value.toUpperCase())}
                                className={`coupon-input ${manualCouponError ? 'error' : ''}`}
                                autoComplete="off"
                                spellCheck="false"
                                disabled={applyingCoupon === 'manual'}
                            />
                            <button
                                type="button"
                                className={`apply-manual-btn ${applyingCoupon === 'manual' ? 'applying' : ''}`}
                                onClick={handleManualApply}
                                disabled={!manualCouponCode.trim() || applyingCoupon === 'manual'}
                            >
                                {applyingCoupon === 'manual' ? (
                                    <span className="applying-text">
                                        <span className="applying-spinner"></span>
                                        Applying...
                                    </span>
                                ) : (
                                    'Apply'
                                )}
                            </button>
                        </div>
                        {manualCouponError && (
                            <div className="manual-coupon-error">
                                {/* <span className="error-icon">⚠️</span> */}
                                <span className="error-message">{manualCouponError}</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="section-divider">
                        <span>or choose from available offers</span>
                    </div>

                    {/* Public Coupons Section */}
                    <div className="public-coupons-section">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading available coupons...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <span className="error-icon">⚠️</span>
                                <p>{error}</p>
                                <button type="button" className="retry-btn" onClick={fetchPublicCoupons}>
                                    Retry
                                </button>
                            </div>
                        ) : publicCoupons.length === 0 ? (
                            <div className="no-coupons">
                                <span className="no-coupons-icon">🎟️</span>
                                <p>No coupons available at the moment</p>
                            </div>
                        ) : (
                            <div className="coupons-list">
                                {publicCoupons.map((coupon, index) => {
                                    const isApplicable = isCouponApplicable(coupon);
                                    const progressPercentage = getProgressPercentage(coupon);
                                    const isExpired = new Date(coupon.end_at) < new Date();

                                    return (
                                        <div
                                            key={coupon.id || index}
                                            className={`coupon-card ${!isApplicable ? 'not-applicable' : ''} ${isExpired ? 'expired' : ''}`}
                                        >
                                            <div className="coupon-left">
                                                <div className="coupon-code">{coupon.code}</div>
                                                <div className="coupon-discount">
                                                    {coupon.discount_percentage}% OFF
                                                    {coupon.max_discount && (
                                                        <span className="max-discount">
                                                            up to {formatAmount(coupon.max_discount)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="coupon-middle">
                                                <div className="coupon-description">
                                                    {coupon.description}
                                                </div>
                                                <div className="coupon-details">
                                                    <div className="min-spend">
                                                        Min. spend: {formatAmount(coupon.min_spend_req)}
                                                    </div>
                                                    <div className="expiry">
                                                        Expires: {formatDate(coupon.end_at)}
                                                    </div>
                                                </div>

                                                {/* Progress Indicator */}
                                                <div className="progress-container">
                                                    <div className="progress-wrapper">
                                                        <div className="progress-info">
                                                            <span className="progress-text">
                                                                {isApplicable
                                                                    ? 'Coupon applicable!'
                                                                    : `Spend ${formatAmount(coupon.min_spend_req - totalAmount)} more to unlock`
                                                                }
                                                            </span>
                                                            <span className="progress-percentage">
                                                                {Math.round(progressPercentage)}%
                                                            </span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width: `${progressPercentage}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`apply-coupon-btn ${applyingCoupon === coupon.code ? 'applying' : ''}`}
                                                        onClick={() => handleCouponApply(coupon)}
                                                        disabled={!isApplicable || isExpired || applyingCoupon === coupon.code}
                                                    >
                                                        {applyingCoupon === coupon.code ? (
                                                            <span className="applying-text">
                                                                <span className="applying-spinner"></span>
                                                                Applying...
                                                            </span>
                                                        ) : isExpired ? (
                                                            'Expired'
                                                        ) : (
                                                            'Apply'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponOverlay;