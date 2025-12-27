import React from "react";
import { useState, useEffect } from "react";
import AISurveyChatbot from "../SurveyTemplate/Components/LLL-Generated-Question/AISurveyChatbot";
import PremiumPackagesModal from "../ProfileManagement/PremiumFeatures/PremiumPackagesModal";
import LoadingOverlay from "./LoadingOverlay";
import "./AutoSurveyGeneration.css";
import apiClient from "../api";

const AutoSurveyGeneration = ({ onGenerateSurvey, getLabel, canEdit }) => {
  const [showSurveyChatbot, setShowSurveyChatbot] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [allValidPackages, setAllValidPackages] = useState([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("initial");

  // Check user subscription on component mount
  useEffect(() => {
    checkUserSubscription();
  }, []);

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const checkUserSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      // console.log("Fetching user packages for survey generation...");

      const response = await apiClient.get("/api/get-user-packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const packages = response.data.packages;
      // console.log("All packages:", packages);
      
      const packagesWithSurveys = packages.filter(pkg => {
        // console.log(`Package: ${JSON.stringify(pkg)}`);
        return pkg.survey && pkg.survey > 0;
      });
      
      // console.log("Packages with surveys:", packagesWithSurveys);
      
      const validPackages = packagesWithSurveys.filter(pkg => {
        const endDate = new Date(pkg.end_date);
        const today = new Date();
        // console.log(`Package ID: ${pkg.subscription_id}, Survey count: ${pkg.survey}, End date: ${endDate}, Today: ${today}, Valid: ${endDate > today}`);
        return endDate > today;
      });
      
      // console.log("Valid packages with surveys:", validPackages);
      
      setAllValidPackages(validPackages);
      
      const eligiblePackage = validPackages.length > 0 ? 
        validPackages.reduce((prev, current) => {
          if (current.survey > prev.survey) return current;
          if (current.survey === prev.survey && new Date(current.end_date) > new Date(prev.end_date)) return current;
          return prev;
        }) : null;
      
      // console.log("Selected eligible package:", eligiblePackage);

      if (eligiblePackage) {
        setSubscriptionData(eligiblePackage);
        setIsEligible(true);
        // console.log("User is eligible for survey generation");
      } else {
        setIsEligible(false);
        // console.log("User is not eligible for survey generation");
        
        if (packagesWithSurveys.length > 0) {
          // console.log("Packages with surveys exist but all expired");
        } else {
          // console.log("No packages with remaining surveys found");
        }
      }
    } catch (error) {
      console.error("Error fetching user packages:", error);
      console.error("Error details:", error.response?.data);
      setIsEligible(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!canEdit) {
      return; // Do nothing if user can't edit
    }
    
    if (!isEligible) {
      setShowUpgradeModal(true);
    } else {
      setShowSurveyChatbot(true);
    }
  };

  const handleGenerateSurvey = async (surveyMeta) => {
    setShowSurveyChatbot(false);
    setIsLoading(true);
    setLoadingPhase("initial");
    
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show the "almost there" message
      setLoadingPhase("almost-there");
      await new Promise((resolve) => setTimeout(resolve, 4000));
      
      // Call the actual survey generation
      await onGenerateSurvey(surveyMeta);
      
      // Refresh subscription data after successful generation
      await checkUserSubscription();
    } catch (error) {
      console.error("Error generating survey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTooltipContent = () => {
    if (subscriptionLoading) return "Loading subscription details...";
    
    if (!canEdit) return "Editor or Owner access required";
    
    if (isEligible && allValidPackages.length > 0) {
      const totalSurveys = allValidPackages.reduce((sum, pkg) => sum + pkg.survey, 0);
      
      if (allValidPackages.length === 1) {
        const pkg = allValidPackages[0];
        return `${pkg.survey} Survey Auto Generation remaining.\nValid till: ${formatDate(pkg.end_date)}`;
      } else {
        let tooltip = `Total: ${totalSurveys} Survey Auto Generation remaining.\n\nBreakdown:\n`;
        allValidPackages
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
          .forEach((pkg, index) => {
            const packageName = pkg.package_name || `Package ${index + 1}`;
            tooltip += `• ${packageName}: ${pkg.survey} surveys (expires ${formatDate(pkg.end_date)})\n`;
          });
        return tooltip.trim();
      }
    } else {
      return "Premium feature - Subscription required";
    }
  };

  const getTotalSurveys = () => {
    if (allValidPackages.length === 0) return 0;
    return allValidPackages.reduce((sum, pkg) => sum + pkg.survey, 0);
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    setShowPremiumModal(true);
  };

  return (
    <>
      <div className="autosurvey-container">
        <button
          className={`autosurvey-button btn-survey-action ${isEligible && canEdit ? 'eligible' : 'not-eligible'} ${!canEdit ? 'disabled' : ''}`}
          onClick={handleButtonClick}
          disabled={subscriptionLoading || !canEdit}
          title={getTooltipContent()}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
        >
          <i className="bi bi-robot autosurvey-icon" />
          {subscriptionLoading ? 'Loading...' : getLabel("AI Generate")}
          {/* {(!isEligible || !canEdit) && !subscriptionLoading && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              fill="currentColor" 
              className="lock-icon" 
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            </svg>
          )} */}
        </button>
      </div>
      
      {showSurveyChatbot && (
        <AISurveyChatbot 
          onClose={() => setShowSurveyChatbot(false)} 
          onGenerateSurvey={handleGenerateSurvey}
          getLabel={getLabel}
        />
      )}
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <>
          <div className="upgrade-modal">
            <div className="modal-content-custom">
              <div className="modal-header-custom">
                <div className="modal-title-container">
                  <div className="premium-icon">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      fill="#6c757d" 
                      className="bi bi-gem" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.118a.5.5 0 0 1 .01-.644L3.1.7zm11.386 3.785-1.806-2.41-.776 2.413 2.582-.003zm-3.633.004.961-2.989H4.186l.963 2.995 5.704-.006zM5.47 5.495 8 13.366l2.532-7.876-5.062.005zm-1.371-.999-.78-2.422-1.818 2.425 2.598-.003zM1.499 5.5l5.113 6.817-2.192-6.82L1.5 5.5zm7.889 6.817 5.123-6.83-2.928.002L8.388 12.317z"/>
                    </svg>
                  </div>
                  <h5 className="modal-title">Premium Feature</h5>
                </div>
                <button 
                  type="button" 
                  className="close-button" 
                  onClick={() => setShowUpgradeModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body-custom">
                <p className="modal-description">
                  You've reached your limit for LLM-generated surveys. Upgrade your plan to continue using this premium feature.
                </p>
                <div className="feature-highlight">
                  <strong>✨ Automated Survey Generation with LLM</strong>
                  <br />
                  <small className="feature-description">
                    Let our LLM create complete professional surveys with multiple questions tailored to your needs
                  </small>
                </div>
              </div>
              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-custom" 
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </button>
                <button 
                  type="button" 
                  className="btn-primary-custom"
                  onClick={handleUpgradeClick}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop-custom" onClick={() => setShowUpgradeModal(false)}></div>
        </>
      )}
      
      {/* Premium Packages Modal */}
      {showPremiumModal && (
        <PremiumPackagesModal
          isOpen={showPremiumModal}
          onClose={handleClosePremiumModal}
          getLabel={getLabel}
        />
      )}
      
      {isLoading && <LoadingOverlay phase={loadingPhase} />}
    </>
  );
};

export default AutoSurveyGeneration;