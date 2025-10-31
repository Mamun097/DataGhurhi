import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CreditCard, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import PremiumPackages from "./PremiumPackages";
import UserSubscriptions from "./PremiumFeatures/UserSubscription";
import PremiumPackagesModal from "./PremiumFeatures/PremiumPackagesModal";
import "./SubscriptionPage.css"; // optional for small custom styling
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

export default function SubscriptionPage() {
  const [openSection, setOpenSection] = useState("history");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userType, setUserType] = useState("normal");
    const [language, setLanguage] = useState(
      localStorage.getItem("language") || "English"
    );
 const loadTranslations = async () => {
    if (language === "English") {
      setTranslatedLabels({});
      return;
    }

    const labelsToTranslate = [
      

       "Manage Your Subscriptions",   
      "Fixed Package Management",
      "Add Package",
      "Manage and customize premium packages for your users",
      "Total Packages",
      "Discounted",
      "Premium",
      "Tags",
      "Questions",
      "Surveys",
      "Choose Your Premium Package",
      "Unlock Powerful AI Features",
      "AI Survey Generation",
      "Create professional surveys in seconds with AI assistance",
      "Smart Question Creation",
      "Generate relevant questions based on your research goals",
      "Automatic Tagging",
      "Organize questions with intelligent tagging system",

      "Most Popular",

      "Build Your Custom Package",
      "Select the items you need and choose validity period",
      "Question Tags",
      "unit",
      "Questions",
      "Surveys",
      "Choose Validity Period",
      "Standard",
      "Validity",
      "Total",
      "Fixed Packages",
      "Custom Package",
      "Automatic Question Tag Generation",
      "Automatic Question Generation",
      "Automatic Survey Template Generation",
      "Basic Survey Templates",
      "Advanced Survey Templates",
      "Premium Survey Templates",
      "Package Summary",

      "Unlock Premium Features",
      "Take your surveys to the next level with AI-powered tools",
      "AI Survey Template Generation",
      "Smart Question Generation",
      "Automatic Question Tagging",

      "Survey",
      "Question",
      "Tag",
      "Custom Package Management",
      "Configure unit prices and validity periods for custom packages",
      "Unit Prices",
      "Set base price per unit for each package item",
      "per unit",
      "Edit Price",
      "Validity Periods",
      "Configure validity periods and their price multipliers",
      "Add Validity",
      "Delete Validity",
      "Edit Validity",
      "Price Multiplier",
      "Edit Unit Price",
      "Base Price Per Unit",

      
    ];

    const translations = await translateText(labelsToTranslate, "bn");

    const translated = {};
    labelsToTranslate.forEach((key, idx) => {
      translated[key] = translations[idx];
    });

    setTranslatedLabels(translated);
  };

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const getLabel = (text) =>
    language === "English" ? text : translatedLabels[text] || text;
  useEffect(() => {
    setUserType(localStorage.getItem("userType") || "normal");
  }, []);
  const handleCheckoutClick = () => {
    setShowAdBanner(false);
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="background-container">
      <div className="profile-wrapper">
        <h1 className="edit-page-title">Manage Your Subscriptions</h1>
        <div className="subscription-cards-grid">
          {/* Premium Packages Section */}
          <div className="card subscription-card">
            <div
              className="card-header collapsible-header"
              onClick={() => handleToggle("packages")}
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard size={20} /> Premium Packages
              </h2>
              {openSection === "packages" ? <ChevronUp />  : <ChevronDown />}
            </div>
            {openSection !== "packages" ? 
            <p> Explore and upgrade to premium plans</p>:
             null}

            <AnimatePresence>
              {openSection === "packages" && (
                
                <motion.div
                  key="packages-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-content"
                >
                  
                 <button className="premium-btn"
                 onClick={() => setShowPremiumModal(true)}
                 >
                  Go Premium
                 </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subscription History Section */}
          <div className="card subscription-card">
            <div
              className="card-header collapsible-header"
              onClick={() => handleToggle("history")}
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <History size={20} /> Subscription History
              </h2>
              {openSection === "history" ? <ChevronUp /> : <ChevronDown />}
            </div>
          {openSection !== "history" ? 
          <p> View your current plan and Usage history</p>:
           null}
            
            <AnimatePresence>
              {openSection === "history" && (
                <motion.div
                  key="history-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-content"
                >
                   <UserSubscriptions userType={userType} language={language} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {showPremiumModal && (
          <PremiumPackagesModal
          isOpen={showPremiumModal}
          onClose={handleClosePremiumModal}
          getLabel={getLabel}
          />
        )}

      </div>
    </div>
  );
}
