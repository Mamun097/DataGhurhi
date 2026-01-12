import React from 'react';
import './TestSuggestionsModal.css';

const TestSuggestionsModal = ({ 
  isOpen, 
  onClose, 
  categoricalColumns, 
  numericColumns, 
  language,
  isLoading = false,
  error = null
}) => {
  if (!isOpen) return null;

  const t = {
    English: {
      title: "Test Suggestions for Your Data",
      back: "Back to Analysis Tool",
      categoricalTitle: "Categorical Columns",
      numericTitle: "Numerical Columns",
      total: "Total",
      columns: "Columns",
      noCategorical: "No categorical columns available",
      noNumeric: "No numerical columns available",
      suggestionTitle: "Recommended Tests for Your Data",
      suggestionIntro: "Based on your data structure, you can run these tests:",
      bothTypes: "Tests for Mixed Data (Categorical & Numerical)",
      categoricalOnly: "Tests for Categorical Data Only",
      numericOnly: "Tests for Numerical Data Only",
      alwaysAvailable: "Tests Always Available",
      loading: "Analyzing your data columns...",
      error: "Unable to analyze column types. Please try again.",
      tests: {
        bar_chart: "Bar Chart",
        pie_chart: "Pie Chart",
        similarity: "Similarity & Distance",
        wilcoxon: "Wilcoxon Signed-Rank Test",
        linear_regression: "Linear Regression",
        shapiro: "Shapiro-Wilk Normality Test",
        kolmogorov: "Kolmogorov-Smirnov Test",
        anderson: "Anderson-Darling Test",
        distribution: "Distribution Plot",
        swarm: "Swarm Plot",
        kruskal: "Kruskal-Wallis H-test",
        mannwhitney: "Mann-Whitney U Test",
        f_test: "F-Test",
        z_test: "Z-Test",
        t_test: "T-Test",
        fzt_combined: "F/Z/T Combined Visualization",
        anova: "ANOVA",
        ancova: "ANCOVA",
        basic_eda: "Basic EDA Summary",
        pearson: "Pearson Correlation",
        spearman: "Spearman Rank Correlation",
        cross_tabulation: "Cross Tabulation",
        chi_square: "Chi-Square Test",
        network_graph: "Network Graph"
      }
    },
    "বাংলা": {
      title: "আপনার ডেটার জন্য পরীক্ষার পরামর্শ",
      back: "বিশ্লেষণ টুলে ফিরে যান",
      categoricalTitle: "শ্রেণীবদ্ধ কলামসমূহ",
      numericTitle: "সংখ্যাগত কলামসমূহ",
      total: "মোট",
      columns: "টি কলাম",
      noCategorical: "কোন শ্রেণীবদ্ধ কলাম নেই",
      noNumeric: "কোন সংখ্যাগত কলাম নেই",
      suggestionTitle: "আপনার ডেটার জন্য সুপারিশকৃত পরীক্ষা",
      suggestionIntro: "আপনার ডেটা কাঠামো অনুযায়ী, আপনি নিম্নলিখিত পরীক্ষাগুলি চালাতে পারেন:",
      bothTypes: "মিশ্র ডেটার জন্য পরীক্ষা (শ্রেণীবদ্ধ ও সংখ্যাগত)",
      categoricalOnly: "শুধুমাত্র শ্রেণীবদ্ধ ডেটার জন্য পরীক্ষা",
      numericOnly: "শুধুমাত্র সংখ্যাগত ডেটার জন্য পরীক্ষা",
      alwaysAvailable: "সর্বদা উপলব্ধ পরীক্ষা",
      loading: "আপনার ডেটার কলাম বিশ্লেষণ করা হচ্ছে...",
      error: "কলামের ধরন বিশ্লেষণ করতে পারিনি। আবার চেষ্টা করুন।",
      tests: {
        bar_chart: "বার চার্ট",
        pie_chart: "পাই চার্ট",
        similarity: "সাদৃশ্য ও দূরত্ব",
        wilcoxon: "উইলকক্সন সাইনড-র্যাঙ্ক টেস্ট",
        linear_regression: "রৈখিক রিগ্রেশন",
        shapiro: "শাপিরো-উইলক নর্মালিটি পরীক্ষা",
        kolmogorov: "কোলমোগোরভ-স্মিরনভ পরীক্ষা",
        anderson: "অ্যান্ডারসন-ডার্লিং টেস্ট",
        distribution: "বন্টন প্লট",
        swarm: "সোয়ার্ম প্লট",
        kruskal: "ক্রুসকাল-ওয়ালিস এইচ-টেস্ট",
        mannwhitney: "ম্যান-হুইটনি ইউ টেস্ট",
        f_test: "এফ-টেস্ট",
        z_test: "জেড-টেস্ট",
        t_test: "টি-টেস্ট",
        fzt_combined: "এফ/জেড/টি সম্মিলিত ভিজ্যুয়ালাইজেশন",
        anova: "এনোভা",
        ancova: "এনকোভা",
        basic_eda: "মৌলিক ইডিএ সারসংক্ষেপ",
        pearson: "পিয়ারসন করেলেশন",
        spearman: "স্পিয়ারম্যান র্যাঙ্ক করেলেশন",
        cross_tabulation: "ক্রস ট্যাবুলেশন",
        chi_square: "কাই-স্কয়ার টেস্ট",
        network_graph: "নেটওয়ার্ক গ্রাফ"
      }
    }
  }[language];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="suggestion-modal-overlay">
        <div className="suggestion-modal">
          <div className="suggestion-modal-header">
            <h2>{t.title}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="suggestion-modal-overlay">
        <div className="suggestion-modal">
          <div className="suggestion-modal-header">
            <h2>{t.title}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{t.error}</p>
            <button className="retry-btn" onClick={onClose}>
              {language === "বাংলা" ? "পিছনে যান" : "Go Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasCategorical = categoricalColumns && categoricalColumns.length > 0;
  const hasNumeric = numericColumns && numericColumns.length > 0;
  const hasBothTypes = hasCategorical && hasNumeric;
  
  // Digit mapping for Bengali
  const digitMapBn = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  
  const mapDigits = (text) => {
    if (language !== 'বাংলা') return text;
    return text.toString().split('').map(char => digitMapBn[char] || char).join('');
  };

  return (
    <div className="suggestion-modal-overlay">
      <div className="suggestion-modal">
        <div className="suggestion-modal-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="suggestion-modal-content">
          {/* Column Summary Table */}
          <div className="columns-summary">
            <div className="summary-column">
              <div className="summary-header">
                <h3>{t.categoricalTitle}</h3>
                <span className="count-badge">
                  {hasCategorical ? `${t.total}: ${mapDigits(categoricalColumns.length)} ${t.columns}` : t.noCategorical}
                </span>
              </div>
              {hasCategorical ? (
                <div className="columns-list">
                  {categoricalColumns.map((col, index) => (
                    <div key={index} className="column-item">
                      {col}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message">
                  {t.noCategorical}
                </div>
              )}
            </div>
            
            <div className="summary-column">
              <div className="summary-header">
                <h3>{t.numericTitle}</h3>
                <span className="count-badge">
                  {hasNumeric ? `${t.total}: ${mapDigits(numericColumns.length)} ${t.columns}` : t.noNumeric}
                </span>
              </div>
              {hasNumeric ? (
                <div className="columns-list">
                  {numericColumns.map((col, index) => (
                    <div key={index} className="column-item">
                      {col}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message">
                  {t.noNumeric}
                </div>
              )}
            </div>
          </div>
          
          {/* Test Suggestions */}
          <div className="test-suggestions">
            <h3>{t.suggestionTitle}</h3>
            <p className="suggestion-intro">{t.suggestionIntro}</p>
            
            <div className="suggestions-grid">
              {/* When we have BOTH types, show all categories */}
              {hasBothTypes ? (
                <>
                  {/* Tests for both categorical and numerical */}
                  <div className="suggestion-category">
                    <h4>{t.bothTypes}</h4>
                    <ul>
                      <li>{t.tests.distribution}</li>
                      <li>{t.tests.swarm}</li>
                      <li>{t.tests.kruskal}</li>
                      <li>{t.tests.mannwhitney}</li>
                      <li>{t.tests.f_test}</li>
                      <li>{t.tests.z_test}</li>
                      <li>{t.tests.t_test}</li>
                      <li>{t.tests.fzt_combined}</li>
                      <li>{t.tests.anova}</li>
                      <li>{t.tests.ancova}</li>
                    </ul>
                  </div>
                  
                  {/* Tests for categorical only */}
                  <div className="suggestion-category">
                    <h4>{t.categoricalOnly}</h4>
                    <ul>
                      <li>{t.tests.bar_chart}</li>
                      <li>{t.tests.pie_chart}</li>
                    </ul>
                  </div>
                  
                  {/* Tests for numerical only */}
                  <div className="suggestion-category">
                    <h4>{t.numericOnly}</h4>
                    <ul>
                      <li>{t.tests.similarity}</li>
                      <li>{t.tests.wilcoxon}</li>
                      <li>{t.tests.linear_regression}</li>
                      <li>{t.tests.shapiro}</li>
                      <li>{t.tests.kolmogorov}</li>
                      <li>{t.tests.anderson}</li>
                    </ul>
                  </div>
                </>
              ) : (
                /* When we have only one type, show only relevant categories */
                <>
                  {/* Tests for categorical only */}
                  {hasCategorical && !hasNumeric && (
                    <div className="suggestion-category">
                      <h4>{t.categoricalOnly}</h4>
                      <ul>
                        <li>{t.tests.bar_chart}</li>
                        <li>{t.tests.pie_chart}</li>
                      </ul>
                    </div>
                  )}
                  
                  {/* Tests for numerical only */}
                  {!hasCategorical && hasNumeric && (
                    <div className="suggestion-category">
                      <h4>{t.numericOnly}</h4>
                      <ul>
                        <li>{t.tests.similarity}</li>
                        <li>{t.tests.wilcoxon}</li>
                        <li>{t.tests.linear_regression}</li>
                        <li>{t.tests.shapiro}</li>
                        <li>{t.tests.kolmogorov}</li>
                        <li>{t.tests.anderson}</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
              
              {/* Tests always available - Show this last and make it full width */}
              <div className="suggestion-category always-available">
                <h4>{t.alwaysAvailable}</h4>
                <ul>
                  <li>{t.tests.basic_eda}</li>
                  <li>{t.tests.pearson}</li>
                  <li>{t.tests.spearman}</li>
                  <li>{t.tests.cross_tabulation}</li>
                  <li>{t.tests.chi_square}</li>
                  <li>{t.tests.network_graph}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="suggestion-footer">
            <button className="back-btn" onClick={onClose}>
              {t.back}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuggestionsModal;