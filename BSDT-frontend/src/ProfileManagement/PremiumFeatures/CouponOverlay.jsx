import React, { useState, useEffect } from 'react';
import './CouponOverlay.css';
import apiClient from '../../api';

const CouponOverlay = ({ isOpen, onClose, totalAmount, onApplyCoupon }) => {
    const [publicCoupons, setPublicCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manualCouponCode, setManualCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchPublicCoupons();
        }
    }, [isOpen]);

    const fetchPublicCoupons = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get('/api/vouchers/public');
            console.log('Public coupons API response:', response.data);

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

    const handleManualApply = () => {
        if (!manualCouponCode.trim()) return;

        // Placeholder for manual coupon application logic
        console.log('Applying manual coupon:', manualCouponCode);
        onApplyCoupon && onApplyCoupon(manualCouponCode, 'manual');
    };

    const handleCouponApply = (coupon) => {
        if (!isCouponApplicable(coupon)) return;

        setApplyingCoupon(coupon.code);
        // Placeholder for coupon application logic
        setTimeout(() => {
            console.log('Applying coupon:', coupon);
            onApplyCoupon && onApplyCoupon(coupon.code, 'public', coupon);
            setApplyingCoupon(null);
        }, 500);
    };

    const isCouponApplicable = (coupon) => {
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
            <div className="coupon-overlay" onClick={(e) => e.stopPropagation()}>
                <div className="coupon-overlay-header">
                    <h3>Apply Coupon</h3>
                    <button className="close-btn" onClick={onClose}>
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
                                className="coupon-input"
                            />
                            <button
                                className="apply-manual-btn"
                                onClick={handleManualApply}
                                disabled={!manualCouponCode.trim()}
                            >
                                Apply
                            </button>
                        </div>
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
                                <button className="retry-btn" onClick={fetchPublicCoupons}>
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
                                                                width: `${progressPercentage}%`,
                                                                animationDelay: `${index * 0.1}s`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="coupon-right">
                                                <button
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

                                            {/* Coupon decorative elements */}
                                            <div className="coupon-perforations">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="perforation" />
                                                ))}
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