import React from "react";
import { useState, useEffect } from "react";
import AIChatbot from "./AIChatbot";
import LoadingOverlay from "./LoadingOverlay";
import PremiumPackagesModal from "../../../ProfileManagement/PremiumFeatures/PremiumPackagesModal";
import "./ChatbotLoading.css";
//import "./AutoGeneration.css";
import mockQuestionGenerator from "./mockApiService";
import axios from "axios";

const AutoGeneration = ({ addGeneratedQuestion, questionInfo, getLabel}) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("initial");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [allValidPackages, setAllValidPackages] = useState([]); // Store all valid packages

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Check user subscription on component mount
  useEffect(() => {
    checkUserSubscription();
  }, []);

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const checkUserSubscription = async () => {
    try {
      const token = localStorage.getItem("token"); // Adjust based on your token storage method
      //console.log("Fetching user packages..."); // Debug log
      
      const response = await axios.get("http://103.94.135.115:2000/api/get-user-packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const packages = response.data.packages;
      // console.log("All packages:", packages); // Debug log
      
      // Find packages that have question generation capability
      // Filter packages that have the 'question' column > 0 (regardless of tag)
      const packagesWithQuestions = packages.filter(pkg => {
        // console.log(`Package: ${JSON.stringify(pkg)}`); // Debug each package
        return pkg.question && pkg.question > 0; // Has remaining questions
      });
      
      // console.log("Packages with questions:", packagesWithQuestions); // Debug log
      
      // Filter valid (non-expired) packages
      const validPackages = packagesWithQuestions.filter(pkg => {
        const endDate = new Date(pkg.end_date);
        const today = new Date();
        //console.log(`Package ID: ${pkg.subscription_id}, Question count: ${pkg.question}, End date: ${endDate}, Today: ${today}, Valid: ${endDate > today}`); // Debug log
        return endDate > today;
      });
      
      //console.log("Valid packages with questions:", validPackages); // Debug log
      
      // Store all valid packages for tooltip display
      setAllValidPackages(validPackages);
      
      // Get the package with the most questions or the latest end_date
      const eligiblePackage = validPackages.length > 0 ? 
        validPackages.reduce((prev, current) => {
          // Prefer package with more questions, or if equal, the one with later end_date
          if (current.question > prev.question) return current;
          if (current.question === prev.question && new Date(current.end_date) > new Date(prev.end_date)) return current;
          return prev;
        }) : null;
      
      //console.log("Selected eligible package:", eligiblePackage); // Debug log

      if (eligiblePackage) {
        setSubscriptionData(eligiblePackage);
        setIsEligible(true);
        //console.log("User is eligible for question generation"); // Debug log
      } else {
        setIsEligible(false);
        //console.log("User is not eligible for question generation"); // Debug log
        
        // Additional debugging
        if (packagesWithQuestions.length > 0) {
          //console.log("Packages with questions exist but all expired");
        } else {
          //console.log("No packages with remaining questions found");
        }
      }
    } catch (error) {
      //console.error("Error fetching user packages:", error);
      //console.error("Error details:", error.response?.data); // More detailed error logging
      setIsEligible(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isEligible) {
      setShowUpgradeModal(true);
    } else {
      setShowChatbot(true);
    }
  };

  const handleGenerateQuestion = async (questionData) => {
    setShowChatbot(false);
    setIsLoading(true);
    setLoadingPhase("initial");
    
    try {
      //console.log("Question Data:", questionData);
      //console.log("Question Info:", questionInfo);

      const response = await fetch('http://103.94.135.115:2000/api/generate-question-with-llm/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionData, questionInfo }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const generatedQuestion = await response.json();
      //console.log(generatedQuestion);
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show the "almost there" message
      setLoadingPhase("almost-there");
      await new Promise((resolve) => setTimeout(resolve, 4000));
      
      // Add the generated question to the survey
      addGeneratedQuestion(generatedQuestion);
      //console.log("Generated question added:", generatedQuestion);
      
      // Refresh subscription data after successful generation
      checkUserSubscription();
      
    } catch (error) {
      //console.error("Error generating question:", error);
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
    
    if (isEligible && allValidPackages.length > 0) {
      const totalQuestions = allValidPackages.reduce((sum, pkg) => sum + pkg.question, 0);
      
      if (allValidPackages.length === 1) {
        const pkg = allValidPackages[0];
        return `${pkg.question} Questions Auto Generation remaining.\nValid till: ${formatDate(pkg.end_date)}`;
      } else {
        // Multiple packages - show detailed breakdown
        let tooltip = `Total: ${totalQuestions} Questions Auto Generation remaining.\n\nBreakdown:\n`;
        allValidPackages
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date)) // Sort by end date (latest first)
          .forEach((pkg, index) => {
            const packageName = pkg.package_name || `Package ${index + 1}`;
            tooltip += `• ${packageName}: ${pkg.question} questions (expires ${formatDate(pkg.end_date)})\n`;
          });
        return tooltip.trim();
      }
    } else {
      return "Premium feature - Subscription required";
    }
  };

  const getTotalQuestions = () => {
    if (allValidPackages.length === 0) return 0;
    return allValidPackages.reduce((sum, pkg) => sum + pkg.question, 0);
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    setShowPremiumModal(true);
  };

  return (
    <>
      <div className="autogen-container">
        <button
          className={`autogen-button ${isEligible ? 'eligible' : 'not-eligible'}`}
          onClick={handleButtonClick}
          disabled={subscriptionLoading}
          title={getTooltipContent()}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            fill="currentColor" 
            className="autogen-icon" 
            viewBox="0 0 16 16"
          >
            <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>
          </svg>
          {subscriptionLoading ? 'Loading...' : getLabel("Generate Question using LLM")}
          {!isEligible && !subscriptionLoading && (
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
          )}
        </button>
        
        {/* {isEligible && allValidPackages.length > 0 && (
          <small className="remaining-count">
            {getTotalQuestions()} questions remaining
            {allValidPackages.length > 1 && (
              <span className="package-count"> ({allValidPackages.length} packages)</span>
            )}
          </small>
        )} */}
      </div>
      
      {showChatbot && (
        <AIChatbot 
          onClose={() => setShowChatbot(false)} 
          onGenerate={handleGenerateQuestion}
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
                  You've reached your limit for LLM-generated questions. Upgrade your plan to continue using this premium feature.
                </p>
                <div className="feature-highlight">
                  <strong>✨ Automated Question Generation with LLM</strong>
                  <br />
                  <small className="feature-description">
                    Let our LLM create professional survey questions tailored to your needs
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

export default AutoGeneration;