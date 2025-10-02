import React from "react";
const renderSimilarityResults = ({ results, language }) => {
  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {language === "bn"
          ? "সাদৃশ্য এবং দূরত্ব বিশ্লেষণ"
          : "Similarity and Distance Analysis"}
      </h2>

      {results.heading && (
        <p className="mb-3 font-medium text-gray-700 dark:text-gray-300">
          {results.heading}
        </p>
      )}

      {results.columns && results.columns.length > 0 && (
        <p className="mb-3">
          <strong>
            {language === "bn" ? "বিশ্লেষিত কলাম:" : "Columns analyzed:"}
          </strong>{" "}
          {results.columns.map((col, i) => (
            <span key={i}>
              {col}
              {i < results.columns.length - 1
                ? language === "bn"
                  ? " এবং "
                  : " and "
                : ""}
            </span>
          ))}
        </p>
      )}

      {results.results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <StatRow
            label={language === "bn" ? "কসাইন সাদৃশ্য" : "Cosine Similarity"}
            value={results.results.cosine_similarity}
          />
          <StatRow
            label={
              language === "bn" ? "ইউক্লিডীয় দূরত্ব" : "Euclidean Distance"
            }
            value={results.results.euclidean_distance}
          />
          <StatRow
            label={
              language === "bn"
                ? "ম্যানহাটন (L1) দূরত্ব"
                : "Manhattan (L1) Distance"
            }
            value={results.results.manhattan_distance}
          />
          <StatRow
            label={
              language === "bn"
                ? "চেবিশেভ (L∞) দূরত্ব"
                : "Chebyshev (L∞) Distance"
            }
            value={results.results.chebyshev_distance}
          />
          <StatRow
            label={
              language === "bn"
                ? `মিনকোর্সকি (p=${results.results.p}) দূরত্ব`
                : `Minkowski (p=${results.results.p}) Distance`
            }
            value={results.results.minkowski_distance}
          />
          <StatRow
            label={language === "bn" ? "পিয়ারসন সহগ" : "Pearson Correlation"}
            value={results.results.pearson_correlation}
          />
          <StatRow
            label={
              language === "bn" ? "স্পিয়ারম্যান সহগ" : "Spearman Correlation"
            }
            value={results.results.spearman_correlation}
          />
        </div>
      )}
    </>
  );
};
export default renderSimilarityResults;
