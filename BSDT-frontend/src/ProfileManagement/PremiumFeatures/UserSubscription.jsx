import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserSubscription.css";
import apiClient from "../../api";

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
      "Premium",

      // Main section labels
      "Subscription Plans",
      "Manage your active subscriptions and view usage history",
      "Loading subscriptions...",
      "Failed to load subscriptions",
      "Try Again",

      // Package section labels
      "Active Subscriptions",
      "Subscription History",
      "No Active Subscriptions",
      "You don't have any active subscriptions. Upgrade to unlock premium features.",
      "Hide History",
      "Show History",
      "Get Premium",

      // Feature labels
      "AI Survey Generation",
      "AI Question Generation",
      "AI Tag Generation",
      "Advanced Analytics",
      "Extended Participants",
      "Unlimited",

      // Timeline labels
      "Valid Until",
      "Activated",
      "Days Left",
      "days",

      // Cost labels
      "Total",
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
    if (userType !== "admin") {
      fetchUserPackages();
    }
  }, [userType]);

  const fetchUserPackages = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await apiClient.get("/api/get-user-packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSubscriptions(response.data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch user packages:", error);
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const isPackageActive = (endDate) => {
    return new Date(endDate) > new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getStatusInfo = (subscription) => {
    const isActive = isPackageActive(subscription.end_date);
    const daysRemaining = getDaysRemaining(subscription.end_date);

    if (!isActive) {
      return { status: "expired", label: getLabel("Expired"), color: "red" };
    } else if (daysRemaining <= 7) {
      return { status: "expiring", label: getLabel("Expiring Soon"), color: "orange" };
    } else {
      return { status: "active", label: getLabel("Active"), color: "green" };
    }
  };

  const getFeatureList = (subscription) => {
    const features = [];

    if (subscription.survey > 0) {
      features.push({
        icon: "📊",
        name: getLabel("AI Survey Generation"),
        value: subscription.survey
      });
    }

    if (subscription.question > 0) {
      features.push({
        icon: "❓",
        name: getLabel("AI Question Generation"),
        value: subscription.question
      });
    }

    if (subscription.tag > 0) {
      features.push({
        icon: "🏷️",
        name: getLabel("AI Tag Generation"),
        value: subscription.tag
      });
    }

    if (subscription.advanced_analysis) {
      features.push({
        icon: "📈",
        name: getLabel("Advanced Analytics"),
        value: getLabel("Unlimited")
      });
    }

    if (subscription.participant_count > 0) {
      features.push({
        icon: "👥",
        name: getLabel("Extended Participants"),
        value: `+${subscription.participant_count}`
      });
    }

    return features;
  };

  const activePackages = subscriptions.filter((sub) =>
    isPackageActive(sub.end_date)
  );
  const expiredPackages = subscriptions.filter(
    (sub) => !isPackageActive(sub.end_date)
  );

  if (userType === "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="subscription-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{getLabel("Loading subscriptions...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>{getLabel("Failed to load subscriptions")}</h3>
          <button onClick={fetchUserPackages} className="btn-retry">
            {getLabel("Try Again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      {/* Header */}
      <div className="subscription-header">
        <div className="header-content">
          <h2>{getLabel("Subscription Plans")}</h2>
          <p>{getLabel("Manage your active subscriptions and view usage history")}</p>
        </div>
      </div>

      {/* Active Subscriptions */}
      {activePackages.length > 0 && (
        <div className="subscriptions-section">
          <div className="section-header">
            <h3>{getLabel("Active Subscriptions")}</h3>
            <span className="count-badge">{activePackages.length}</span>
          </div>

          <div className="subscription-grid">
            {activePackages.map((subscription) => {
              const statusInfo = getStatusInfo(subscription);
              const features = getFeatureList(subscription);
              const daysLeft = getDaysRemaining(subscription.end_date);

              return (
                <div key={subscription.subscription_id} className="subscription-card active">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="header-left">
                      <div className="plan-title">
                        <h4>{getLabel("Premium")} {getLabel("Subscription Plans").split(' ')[0]}</h4>
                        <div className={`status-badge ${statusInfo.status}`}>
                          <div className="status-dot"></div>
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="header-right">
                      <div className="price-display">
                        <span className="price-amount">৳{subscription.cost}</span>
                        <span className="price-label">{getLabel("Total")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    {/* Features Section */}
                    <div className="features-section">
                      <div className="features-grid-compact">
                        {features.map((feature, idx) => (
                          <div key={idx} className="feature-item-compact">
                            <span className="feature-icon">{feature.icon}</span>
                            <span className="feature-name">{feature.name}</span>
                            <span className="feature-value">{feature.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="timeline-section">
                      <div className="timeline-row">
                        <div className="timeline-col">
                          <span className="timeline-label">{getLabel("Activated")}</span>
                          <span className="timeline-value">{formatDate(subscription.start_date)}</span>
                        </div>
                        <div className="timeline-col">
                          <span className="timeline-label">{getLabel("Valid Until")}</span>
                          <span className="timeline-value">{formatDate(subscription.end_date)}</span>
                        </div>
                        {daysLeft > 0 && (
                          <div className="timeline-col">
                            <span className="timeline-label">
                              {daysLeft <= 7 ? '⚠️ Expiring in' : '📅 Valid for'}
                            </span>
                            <span className={`timeline-value ${daysLeft <= 7 ? 'urgent' : ''}`}>
                              <strong>{daysLeft}</strong> {getLabel("days")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer - only show if subscription is expired */}
                  {daysLeft <= 0 && (
                    <div className="card-footer">
                      <div className="expiry-notice expired">
                        <div className="expiry-content">
                          <span className="expiry-text">🔴 Subscription Expired</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activePackages.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>{getLabel("No Active Subscriptions")}</h3>
          <p>{getLabel("You don't have any active subscriptions. Upgrade to unlock premium features.")}</p>
          <button className="btn-primary">{getLabel("Get Premium")}</button>
        </div>
      )}

      {/* History Toggle */}
      {expiredPackages.length > 0 && (
        <div className="history-section">
          <button
            className="history-toggle"
            onClick={() => setShowExpired(!showExpired)}
          >
            <span>{showExpired ? getLabel("Hide History") : getLabel("Show History")}</span>
            <span className="history-count">({expiredPackages.length})</span>
            <span className={`chevron ${showExpired ? 'up' : 'down'}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {showExpired && (
            <div className="expired-subscriptions">
              <div className="section-header">
                <h3>{getLabel("Subscription History")}</h3>
              </div>

              <div className="subscription-list">
                {expiredPackages.map((subscription) => {
                  const features = getFeatureList(subscription);

                  return (
                    <div key={subscription.subscription_id} className="subscription-item expired">
                      <div className="item-left">
                        <div className="plan-badge expired">{getLabel("Expired")}</div>
                        <div className="period-info">
                          <span>{formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}</span>
                        </div>
                      </div>

                      <div className="item-center">
                        <div className="features-summary">
                          {features.map((feature, idx) => (
                            <span key={idx} className="feature-tag">
                              {feature.icon} {feature.value} {feature.name.split(' ').pop()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="item-right">
                        <span className="cost">৳{subscription.cost}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptions;