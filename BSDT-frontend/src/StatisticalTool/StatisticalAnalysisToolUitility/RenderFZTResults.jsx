import React from "react";
const renderFZTResults = ({
    language,
    columns,
    results,
    django_base_url,
    digitMapBn,
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
        {language === "bn"
          ? "F / Z / T পরীক্ষার ফলাফল"
          : "F / Z / T Test Results"}
      </h2>

      {columns && columns.length === 2 && (
        <p className="mb-3">
          <strong>
            {language === "bn" ? "বিশ্লেষিত কলাম:" : "Columns analyzed:"}
          </strong>{" "}
          {columns[0]} {language === "bn" ? "এবং" : "and"} {columns[1]}
        </p>
      )}

      {results?.statistic && (
        <>
          {results.statistic.F !== undefined && (
            <p className="mb-2">
              <strong>F:</strong>{" "}
              {mapDigitIfBengali(results.statistic.F.toFixed(4))}{" "}
              &nbsp;&nbsp;&nbsp;
              <strong>p(F):</strong>{" "}
              {mapDigitIfBengali(results.statistic.F_p?.toFixed(6))}
            </p>
          )}

          {results.statistic.Z !== undefined && (
            <p className="mb-2">
              <strong>Z:</strong>{" "}
              {mapDigitIfBengali(results.statistic.Z.toFixed(4))}{" "}
              &nbsp;&nbsp;&nbsp;
              <strong>p(Z):</strong>{" "}
              {mapDigitIfBengali(results.statistic.Z_p?.toFixed(6))}
            </p>
          )}

          {results.statistic.T !== undefined && (
            <p className="mb-2">
              <strong>T:</strong>{" "}
              {mapDigitIfBengali(results.statistic.T.toFixed(4))}{" "}
              &nbsp;&nbsp;&nbsp;
              <strong>p(T):</strong>{" "}
              {mapDigitIfBengali(results.statistic.T_p?.toFixed(6))}
              {results.statistic.T_df !== undefined && (
                <>
                  {" "}
                  &nbsp;&nbsp;&nbsp;
                  <strong>df:</strong>{" "}
                  {mapDigitIfBengali(results.statistic.T_df?.toFixed(1))}
                </>
              )}
            </p>
          )}
        </>
      )}

      {results?.p_value !== undefined && (
        <p className="mb-4">
          <strong>{language === "bn" ? "সিদ্ধান্ত:" : "Conclusion"}:</strong>
          {results.p_value < 0.05 ? (
            <span className="text-green-600 font-medium ml-2">
              {language === "bn"
                ? "গুরুত্বপূর্ণ পার্থক্য পাওয়া গেছে"
                : "Significant difference found"}
            </span>
          ) : (
            <span className="text-red-600 font-medium ml-2">
              {language === "bn"
                ? "গুরুত্বপূর্ণ পার্থক্য পাওয়া যায়নি"
                : "No significant difference found"}
            </span>
          )}
        </p>
      )}

      {results.image_paths && results.image_paths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn" ? "ভিজ্যুয়ালাইজেশন" : "Visualizations"}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {results.image_paths.map((path, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={`${django_base_url}/${path}`}
                  alt={`FZT visualization ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${django_base_url}/${path}`
                      );
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      const filename =
                        path.split("/").pop() ||
                        `fzt_visualization_${index + 1}.png`;
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
                  title={
                    language === "bn" ? "ছবি ডাউনলোড করুন" : "Download Image"
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
                  {language === "bn" ? "ডাউনলোড" : "Download"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default renderFZTResults;
