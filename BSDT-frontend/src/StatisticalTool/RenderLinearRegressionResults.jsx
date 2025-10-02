import React from "react";
const renderLinearRegressionResults = ({
    language,
    results,
    columns,
    django_base_url,
    digitMapBn,
    t,
}) => {
  const mapDigitIfBengali = (text) => {
    if (language !== "bn") return text;
    return text
      .toString()
      .split("")
      .map((char) => digitMapBn[char] || char)
      .join("");
  };

  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {t.tests.linear_regression || "Linear Regression"}
      </h2>

      {columns?.length > 0 && (
        <p className="mb-3">
          <strong>
            {language === "bn" ? "বিশ্লেষণকৃত কলাম:" : "Columns analyzed:"}
          </strong>{" "}
          {columns.filter(Boolean).join(language === "bn" ? " এবং " : " and ")}
        </p>
      )}

      <p className="mb-3">
        <strong>{language === "bn" ? "ইন্টারসেপ্ট:" : "Intercept:"}</strong>{" "}
        {results.intercept !== undefined
          ? mapDigitIfBengali(results.intercept)
          : "—"}
      </p>

      <p className="mb-3">
        <strong>{language === "bn" ? "কোইফিশিয়েন্ট:" : "Coefficient:"}</strong>{" "}
        {results.coefficient !== undefined
          ? mapDigitIfBengali(results.coefficient)
          : "—"}
      </p>

      <p className="mb-3">
        <strong>
          {language === "bn" ? "আর-স্কোয়ারড মান (R²):" : "R-squared (R²):"}
        </strong>{" "}
        {results.r2_score !== undefined
          ? mapDigitIfBengali(results.r2_score)
          : "—"}
      </p>

      <p className="mb-3">
        <strong>
          {language === "bn"
            ? "গড় স্কোয়ার্ড ত্রুটি (MSE):"
            : "Mean Squared Error (MSE):"}
        </strong>{" "}
        {results.mse !== undefined ? mapDigitIfBengali(results.mse) : "—"}
      </p>

      {results.image_paths?.[0] && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn" ? "ভিজ্যুয়ালাইজেশন" : "Visualization"}
          </h3>
          <div className="bg-white rounded-lg shadow-md p-4">
            <img
              src={`${django_base_url}/${results.image_paths[0]}`}
              alt="Linear Regression Plot"
              className="w-full h-auto object-contain"
            />
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${django_base_url}/${results.image_paths[0]}`
                  );
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  const filename =
                    results.image_paths[0].split("/").pop() ||
                    "linear_regression_plot.png";
                  link.href = url;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Download failed:", error);
                  alert(
                    language === "bn"
                      ? "ডাউনলোড ব্যর্থ হয়েছে"
                      : "Download failed"
                  );
                }
              }}
              className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
              title={language === "bn" ? "ছবি ডাউনলোড করুন" : "Download Image"}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {language === "bn" ? "ডাউনলোড" : "Download"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default renderLinearRegressionResults;
