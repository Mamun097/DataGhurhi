import React from "react";
const renderCramerVResults = ({
  language,
  results,
  digitMapBn,
  django_base_url,
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
        {language === "bn" ? "ক্র্যামের ভি হিটম্যাপ" : "Cramér's V Heatmap"}
      </h2>

      <p>
        {results.columns.length > 0 && (
          // print first n-1 columns

          <>
            <strong>
              {language === "bn" ? "বিশ্লেষিত কলাম:" : "Columns analyzed:"}
            </strong>{" "}
            {results.columns.map((col, i) => (
              <span key={i}>
                {col}
                {i < results.columns.length - 1
                  ? language === "bn"
                    ? " , "
                    : " , "
                  : ""}
              </span>
            ))}
          </>
        )}
      </p>

      {results.statistic !== undefined && (
        <p className="mb-2">
          <strong>
            {language === "bn" ? "Cramér's V মান:" : "Cramér's V value:"}
          </strong>{" "}
          {mapDigitIfBengali(parseFloat(results.statistic).toFixed(4))}
        </p>
      )}

      {results.image_paths && results.image_paths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn" ? "ভিজ্যুয়ালাইজেশন" : "Visualizations"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.image_paths.map((path, index) => {
              const handleDownload = async () => {
                try {
                  const response = await fetch(`${django_base_url}/${path}`);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  const filename =
                    path.split("/").pop() || `cramer_v_plot_${index + 1}.png`;
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
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded shadow p-2 relative"
                >
                  <img
                    src={`${django_base_url}/${path}`}
                    alt={`cramer-v-plot-${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 text-sm"
                    title={language === "bn" ? "ডাউনলোড করুন" : "Download"}
                  >
                    ⬇ {language === "bn" ? "ডাউনলোড" : "Download"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default renderCramerVResults;
