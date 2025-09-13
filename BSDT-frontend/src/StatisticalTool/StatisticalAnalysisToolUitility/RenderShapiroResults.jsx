import React from "react";
const renderShapiroResults = ({
  results,
  columns,
  language,
  digitMapBn,
  django_base_url,
  t,
}) => {
  const mapDigitIfBengali = (text) => {
    if (language !== "বাংলা") return text;
    return text
      .toString()
      .split("")
      .map((char) => digitMapBn[char] || char)
      .join("");
  };

  if (!results) {
    return (
      <p>
        {language === "বাংলা" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}
      </p>
    );
  }
  if (results.success === false && results.error) {
    return <p className="text-red-600 font-semibold">{results.error}</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {t.tests.shapiro || "Shapiro-Wilk Normality Test"}
      </h2>

      {columns?.length > 0 && (
        <p className="mb-3">
          <strong>
            {language === "বাংলা" ? "বিশ্লেষণকৃত কলাম:" : "Column analyzed:"}
          </strong>{" "}
          {columns[0]}
        </p>
      )}

      {results.interpretation && (
        <p className="mb-3">
          <strong>
            {language === "বাংলা" ? "মূল্যায়ন:" : "Interpretation:"}
          </strong>{" "}
          {results.interpretation}
        </p>
      )}

      <p className="mb-3">
        <strong>{language === "বাংলা" ? "p-মান:" : "p-value:"}</strong>{" "}
        {mapDigitIfBengali(results.p_value?.toFixed(4))}
      </p>

      <p className="mb-3">
        <strong>
          {language === "বাংলা" ? "পরিসংখ্যান মান:" : "Test statistic:"}
        </strong>{" "}
        {mapDigitIfBengali(results.statistic?.toFixed(4))}
      </p>

      {results.image_path && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "বাংলা" ? "ভিজ্যুয়ালাইজেশন" : "Visualization"}
          </h3>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="relative">
              <img
                src={`${django_base_url}/${results.image_path}`}
                alt="Shapiro-Wilk visualization"
                className="w-full h-auto object-contain"
              />
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `${django_base_url}/${results.image_path}`
                    );
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    const filename =
                      results.image_path.split("/").pop() ||
                      "shapiro_visualization.png";
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Download failed:", error);
                    alert(
                      language === "বাংলা"
                        ? "ডাউনলোড ব্যর্থ হয়েছে"
                        : "Download failed"
                    );
                  }
                }}
                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                title={
                  language === "বাংলা" ? "ছবি ডাউনলোড করুন" : "Download Image"
                }
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
                {language === "বাংলা" ? "ডাউনলোড" : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default renderShapiroResults;
