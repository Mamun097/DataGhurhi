import React from "react";
import { useState } from "react";
import renderKruskalResults from "./RenderKruskalResults";
import renderWilcoxonResults from "./RenderWilcoxonResulsts";
import renderMannWhitneyResults from "./RenderMannWhitneyResults";
import renderShapiroResults from "./RenderShapiroResults";
import renderSpearmanResults from "./RenderSpearmanResults";
import renderPearsonResults from "./RenderPearsonResults";
import renderLinearRegressionResults from "../RenderLinearRegressionResults";
import renderEDAPieResults from "./RenderEDAPieResults";
import renderKolmogorovResults from "./RenderKolmogorovResults";
import renderAnovaResults from "./RenderAnovaResults";
import renderAncovaResults from "./RenderAncovaResults";
import renderEDASwarmResults from "./RenderEDASwarmResults";
import renderAndersonDarlingResults from "./RenderAndersonDarlingResults";
import renderFZTResults from "./RenderFZTResults";
import renderCrossTabulationResults from "./RenderCrossTabulationResults";
import renderEDADistributionResults from "./RenderEDADistributionResults";
import renderEDABasicsResults from "./RenderEDABasicResults";
import renderSimilarityResults from "./RenderSimilarityResults";
import renderChiSquareResults from "./RenderChiSquareResults";
import renderCramerVResults from "./RenderCramerVResults";
import renderNetworkGraphResults from "./RenderNetworkGraphResults";
import renderBarChartResults from "./RenderBarChartResults";

const AnalysisResults = ({
  user_id,
  results,
  testType,
  columns,
  language = "English",
  t,
  filename,
}) => {
  const [barChartType] = useState("vertical");
  const django_base_url = import.meta.env.VITE_DJANGO_BASE_URL;
  const digitMapBn = {
    0: "০",
    1: "১",
    2: "২",
    3: "৩",
    4: "৪",
    5: "৫",
    6: "৬",
    7: "৭",
    8: "৮",
    9: "৯",
    ".": ".",
  };
  const renderResults = () => {
    if (testType === "kruskal") {
      return renderKruskalResults({
        language,
        results,
        digitMapBn,
        django_base_url,
        user_id,
        testType,
        filename,
        columns,
        t,
      });
    } else if (testType === "wilcoxon") {
      return renderWilcoxonResults({
        results,
        columns,
        language,
        digitMapBn,
        django_base_url,
        t,
      });
    } else if (testType === "mannwhitney") {
      return renderMannWhitneyResults({
        results,
        columns,
        language,
        digitMapBn,
        django_base_url,
        t,
      });
    } else if (testType === "shapiro") {
      return renderShapiroResults({
        results,
        columns,
        language,
        digitMapBn,
        django_base_url,
        t,
      });
    } else if (testType === "spearman") {
      return renderSpearmanResults({ language, results, django_base_url, t });
    } else if (testType === "pearson") {
      return renderPearsonResults({
        results,
        language,
        django_base_url,
        t,
      });
    } else if (testType === "linear_regression") {
      return renderLinearRegressionResults({
        language,
        results,
        columns,
        django_base_url,
        digitMapBn,
        t,
      });
    } else if (testType === "anova") {
      return renderAnovaResults({
        results,
        language,
        columns,
        django_base_url,
        t,
      });
    } else if (testType === "ancova") {
      return renderAncovaResults({
        results,
        language,
        columns,
        django_base_url,
        t,
      });
    } else if (testType === "kolmogorov") {
      return renderKolmogorovResults({
        results,
        columns,
        language,
        django_base_url,
        t,
      });
    } else if (testType === "anderson") {
      return renderAndersonDarlingResults({
        results,
        language,
        columns,
        django_base_url,
        t,
      });
    } else if (testType === "fzt") {
      return renderFZTResults({
        language,
        columns,
        results,
        django_base_url,
        digitMapBn,
      });
    } else if (testType === "cross_tabulation") {
      return renderCrossTabulationResults({
        results,
        language,
        columns,
        django_base_url,
      });
    } else if (testType === "eda_distribution") {
      return renderEDADistributionResults({
        results,
        columns,
        language,
        django_base_url,
      });
    } else if (testType === "eda_swarm") {
      return renderEDASwarmResults({
        language,
        results,
        columns,
        django_base_url,
        digitMapBn,
      });
    } else if (testType === "eda_pie") {
      return renderEDAPieResults({ results, language, django_base_url });
    } else if (testType === "eda_basics") {
      return renderEDABasicsResults({ language, digitMapBn, results });
    } else if (testType === "similarity") {
      return renderSimilarityResults({ results, language });
    } else if (testType === "chi_square") {
      return renderChiSquareResults({
        results,
        django_base_url,
        language,
        digitMapBn,
      });
    } else if (testType === "cramers_heatmap") {
      return renderCramerVResults({
        language,
        results,
        digitMapBn,
        django_base_url,
      });
    } else if (testType === "network_graph") {
      return renderNetworkGraphResults({ language, results, django_base_url });
    } else if (testType === "bar_chart") {
      return renderBarChartResults({
        results,
        columns,
        language,
        barChartType,
        django_base_url,
      });
    }

    switch (testType) {
      case "pearson":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Pearson Correlation Analysis
            </h2>
          </>
        );
      default:
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{results.test}</h2>
            <p className="mb-3">
              <strong>Analysis complete.</strong> The test results are displayed
              below.
            </p>
          </>
        );
    }
  };

  // Helper component for consistent layout
  const StatRow = ({ label, value }) => (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
      <p className="font-medium text-gray-800 dark:text-gray-100">{label}</p>
      <p className="text-blue-700 dark:text-blue-300 text-xl mt-1">{value}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <div className="bg-gray-700 text-white p-4 font-semibold">
        <p className="text-black inline">
          {language === "bn"
            ? "পরিসংখ্যানগত বিশ্লেষণ ফলাফল"
            : "Statistical Analysis Results"}
        </p>
      </div>
      <div className="p-6">
        <div className="analysis-container">{renderResults()}</div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              if (!results || !columns || !testType) {
                alert(
                  language === "বাংলা"
                    ? "রিপোর্ট যুক্ত করার জন্য সম্পূর্ণ বিশ্লেষণ প্রয়োজন"
                    : "Analysis must be completed before adding to report"
                );
                return;
              }

              try {
                // Dynamically find image sources from the page
                const imagePaths = Array.from(
                  document.querySelectorAll(".analysis-container img")
                )
                  .map((img) => img.getAttribute("src"))
                  .filter((src) => src?.includes("/media/"))
                  .map((fullSrc) => {
                    try {
                      const url = new URL(fullSrc, window.location.origin);
                      return url.pathname;
                    } catch {
                      return fullSrc;
                    }
                  });

                const enrichedResults = {
                  ...results,
                  image_paths: imagePaths,
                };

                const existingReports = JSON.parse(
                  localStorage.getItem("analysisReports") || "[]"
                );
                const updatedReports = [
                  ...existingReports,
                  {
                    results: enrichedResults,
                    columns,
                    type: testType,
                    timestamp: new Date().toISOString(),
                  },
                ];

                localStorage.setItem(
                  "analysisReports",
                  JSON.stringify(updatedReports)
                );
                alert(
                  language === "বাংলা"
                    ? "রিপোর্টে যুক্ত হয়েছে"
                    : "Results and visulaizations are added to the report"
                );
              } catch (error) {
                console.error("Add to Report Failed:", error);
                alert(
                  language === "বাংলা"
                    ? "রিপোর্ট যুক্ত করা যায়নি"
                    : "Failed to add to report"
                );
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-black font-medium py-2 px-4 rounded-lg shadow transition duration-200 transform hover:-translate-y-1 ml-4"
          >
            {language === "বাংলা" ? "রিপোর্টে যুক্ত করুন" : "Add to Report"}
          </button>
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => {
              //reload analysis
              window.location.reload();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200 transform hover:-translate-y-1"
          >
            {language === "bn"
              ? "আরেকটি বিশ্লেষণ করুন"
              : "Perform Another Analysis"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
