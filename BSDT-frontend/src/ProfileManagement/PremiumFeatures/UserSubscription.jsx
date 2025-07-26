import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserSubscription.css';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

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

const UserSubscriptions = ({ userType, language = "English" }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExpired, setShowExpired] = useState(false);
    const [error, setError] = useState(null);
    const [translatedLabels, setTranslatedLabels] = useState({});

    // Load translations when language changes
    const loadTranslations = async () => {
        if (language === "English") {
            setTranslatedLabels({});
            return;
        }

        const labelsToTranslate = [
            // Status labels
            "Active",
            "Expired", 
            "Expiring Soon",
            
            // Main section labels
            "My Subscription Packages",
            "Manage and view your premium subscription packages",
            "Loading subscription packages...",
            "Failed to load subscription packages",
            "Retry",
            
            // Package section labels
            "Active Packages",
            "Package History",
            "No Active Packages",
            "You don't have any active subscription packages at the moment.",
            "Hide Package History",
            "View Package History",
            
            // Feature labels
            "Auto Survey Generation",
            "Auto Question Generation", 
            "Auto Tag Generation",
            "Tags",
            "Questions",
            "Surveys",
            
            // Timeline labels
            "Started",
            "Expires",
            "Expired",
            "Days Remaining",
            // "days",
            
            // Cost labels
            "Package Cost"
        ];

        try {
            const translations = await translateText(labelsToTranslate, "bn");
            const translated = {};
            labelsToTranslate.forEach((key, idx) => {
                translated[key] = translations[idx];
            });
            setTranslatedLabels(translated);
        } catch (error) {
            console.error("Failed to load translations:", error);
            setTranslatedLabels({});
        }
    };

    useEffect(() => {
        loadTranslations();
    }, [language]);

    const getLabel = (text) => 
        language === "English" ? text : translatedLabels[text] || text;

    useEffect(() => {
        if (userType !== 'admin') {
            fetchUserPackages();
        }
    }, [userType]);

    const fetchUserPackages = async () => {
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            const response = await axios.get("http://103.94.135.115:2000/api/get-user-packages", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setSubscriptions(response.data.packages || []);
            }
        } catch (error) {
            console.error("Failed to fetch user packages:", error);
            setError("Failed to load subscription packages");
        } finally {
            setLoading(false);
        }
    };

    const isPackageActive = (endDate) => {
        return new Date(endDate) > new Date();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPackageTypeLabel = (subscription) => {
        const features = [];
        if (subscription.tag > 0) features.push(`${subscription.tag} ${getLabel('Tags')}`);
        if (subscription.question > 0) features.push(`${subscription.question} ${getLabel('Questions')}`);
        if (subscription.survey > 0) features.push(`${subscription.survey} ${getLabel('Surveys')}`);
        return features.join(' + ');
    };

    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const expiry = new Date(endDate);
        const timeDiff = expiry.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    };

    const getStatusBadge = (subscription) => {
        const isActive = isPackageActive(subscription.end_date);
        const daysRemaining = getDaysRemaining(subscription.end_date);

        if (!isActive) {
            return <span className="status-badge expired">{getLabel("Expired")}</span>;
        } else if (daysRemaining <= 7) {
            return <span className="status-badge expiring-soon">{getLabel("Expiring Soon")}</span>;
        } else {
            return <span className="status-badge active">{getLabel("Active")}</span>;
        }
    };

    const activePackages = subscriptions.filter(sub => isPackageActive(sub.end_date));
    const expiredPackages = subscriptions.filter(sub => !isPackageActive(sub.end_date));

    if (userType === 'admin') {
        return null; // Don't show for admin users
    }

    if (loading) {
        return (
            <div className="subscriptions-section">
                <div className="subscriptions-loading">
                    <div className="loading-spinner"></div>
                    <p>{getLabel("Loading subscription packages...")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subscriptions-section">
                <div className="subscriptions-error">
                    <p>{getLabel(error)}</p>
                    <button onClick={fetchUserPackages} className="retry-btn">
                        {getLabel("Retry")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="subscriptions-section">
            <div className="subscriptions-header">
                <h3>{getLabel("My Subscription Packages")}</h3>
                <p className="subscriptions-subtitle">
                    {getLabel("Manage and view your premium subscription packages")}
                </p>
            </div>

            {/* Active Packages */}
            {activePackages.length > 0 && (
                <div className="active-packages">
                    <h4 className="packages-section-title">
                        <span className="title-icon">🟢</span>
                        {getLabel("Active Packages")} ({activePackages.length})
                    </h4>
                    <div className="packages-grid">
                        {activePackages.map((subscription) => (
                            <div key={subscription.subscription_id} className="package-card active-card">
                                <div className="package-header">
                                    {getStatusBadge(subscription)}
                                </div>

                                <div className="package-details">
                                    <div className="package-features">
                                        {subscription.advanced_analysis && (
                                            <div className="feature-item">
                                                <span className="feature-icon">📈</span>
                                                <span>{getLabel("Advanced Statistical Analyses")}</span>
                                            </div>
                                        )}
                                        {subscription.participant_count>0 && (
                                            <div className="feature-item">
                                                <span className="feature-icon">👥</span>
                                                <span>{subscription.participant_count} {getLabel("Survey Participants beyond Free Limit")}</span>
                                            </div>
                                        )}
                                        {subscription.survey > 0 && (
                                            <div className="feature-item">
                                                <span className="feature-icon">📊</span>
                                                <span>{subscription.survey} {getLabel("Auto Survey Generation")}</span>
                                            </div>
                                        )}
                                        {subscription.question > 0 && (
                                            <div className="feature-item">
                                                <span className="feature-icon">❓</span>
                                                <span>{subscription.question} {getLabel("Auto Question Generation")}</span>
                                            </div>
                                        )}

                                        {subscription.tag > 0 && (
                                            <div className="feature-item">
                                                <span className="feature-icon">🏷️</span>
                                                <span>{subscription.tag} {getLabel("Auto Tag Generation")}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="package-timeline">
                                        <div className="timeline-item">
                                            <span className="timeline-label">{getLabel("Started")}:</span>
                                            <span className="timeline-date">{formatDate(subscription.start_date)}</span>
                                        </div>
                                        <div className="timeline-item">
                                            <span className="timeline-label">{getLabel("Expires")}:</span>
                                            <span className="timeline-date">{formatDate(subscription.end_date)}</span>
                                        </div>
                                        <div className="timeline-item">
                                            <span className="timeline-label">{getLabel("Days Remaining")}:</span>
                                            <span className={`timeline-date ${getDaysRemaining(subscription.end_date) <= 7 ? 'urgent' : ''}`}>
                                                {getDaysRemaining(subscription.end_date)} {getLabel('days')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="package-cost">
                                        <span className="cost-label">{getLabel("Package Cost")}</span>
                                        <span className="cost-amount">৳ {subscription.cost}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Active Packages Message */}
            {activePackages.length === 0 && (
                <div className="no-packages">
                    <div className="no-packages-icon">📦</div>
                    <h4>{getLabel("No Active Packages")}</h4>
                    <p>{getLabel("You don't have any active subscription packages at the moment.")}</p>
                </div>
            )}

            {/* Expired Packages Toggle */}
            {expiredPackages.length > 0 && (
                <div className="expired-packages-section">
                    <button
                        className="toggle-expired-btn"
                        onClick={() => setShowExpired(!showExpired)}
                    >
                        <span className="toggle-icon">{showExpired ? '📉' : '📋'}</span>
                        {showExpired
                            ? getLabel("Hide Package History")
                            : `${getLabel("View Package History")} (${expiredPackages.length})`
                        }
                        <span className={`chevron ${showExpired ? 'up' : 'down'}`}>
                            {showExpired ? '▲' : '▼'}
                        </span>
                    </button>

                    {showExpired && (
                        <div className="expired-packages">
                            <h4 className="packages-section-title">
                                <span className="title-icon">🔴</span>
                                {getLabel("Package History")}
                            </h4>
                            <div className="packages-grid">
                                {expiredPackages.map((subscription) => (
                                    <div key={subscription.subscription_id} className="package-card expired-card">
                                        <div className="package-header">
                                            {getStatusBadge(subscription)}
                                        </div>

                                        <div className="package-details">
                                            <div className="package-features">
                                            {subscription.survey > 0 && (
                                                    <div className="feature-item">
                                                        <span className="feature-icon">📊</span>
                                                        <span>{subscription.survey} {getLabel("Auto Survey Generation")}</span>
                                                    </div>
                                                )}

                                                {subscription.question > 0 && (
                                                    <div className="feature-item">
                                                        <span className="feature-icon">❓</span>
                                                        <span>{subscription.question} {getLabel("Auto Question Generation")}</span>
                                                    </div>
                                                )}

                                                {subscription.tag > 0 && (
                                                    <div className="feature-item">
                                                        <span className="feature-icon">🏷️</span>
                                                        <span>{subscription.tag} {getLabel("Auto Tag Generation")}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="package-timeline">
                                                <div className="timeline-item">
                                                    <span className="timeline-label">{getLabel("Started")}:</span>
                                                    <span className="timeline-date">{formatDate(subscription.start_date)}</span>
                                                </div>
                                                <div className="timeline-item">
                                                    <span className="timeline-label">{getLabel("Expired")}:</span>
                                                    <span className="timeline-date expired-date">{formatDate(subscription.end_date)}</span>
                                                </div>
                                            </div>

                                            <div className="package-cost">
                                                <span className="cost-label">{getLabel("Package Cost")}</span>
                                                <span className="cost-amount">৳ {subscription.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSubscriptions;