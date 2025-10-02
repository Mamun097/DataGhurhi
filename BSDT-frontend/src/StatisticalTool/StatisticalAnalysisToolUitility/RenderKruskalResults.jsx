import React from "react";
const renderKruskalResults = ({
  language,
  results,
  digitMapBn,
  django_base_url,
  user_id,
  testType,
  filename,
  columns,
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
  const handleSaveResult = async () => {
    try {
      const response = await fetch(`${django_base_url}/api/save-results/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_paths: results.image_paths,
          user_id: user_id,
          test_name: testType,
          filename: filename,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Result saved successfully:", data);
      } else {
        console.error("Error saving result:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  return (
    <>
      <div className="relative mb-4">
        <h2 className="text-2xl font-bold">{t.kruskalTitle}</h2>
        <button
          onClick={handleSaveResult}
          className="absolute top-0 right-0 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200"
        >
          {language === "বাংলা" ? "ফলাফল সংরক্ষণ করুন" : "Save Result"}
        </button>
      </div>

      {columns && columns[0] && (
        <p className="mb-3">
          <strong>
            {language === "বাংলা" ? "বিশ্লেষিত কলাম:" : "Columns analyzed:"}
          </strong>{" "}
          {columns[0]}
          {columns[1] &&
            ` ${language === "বাংলা" ? "এবং" : "and"} ${columns[1]}`}
        </p>
      )}

      {results?.statistic !== undefined && (
        <p className="mb-2">
          <strong>{t.testStatistic}:</strong>{" "}
          {mapDigitIfBengali(results.statistic.toFixed(4))}
        </p>
      )}

      {results?.p_value !== undefined && (
        <p className="mb-2">
          <strong>{t.pValue}:</strong>{" "}
          {mapDigitIfBengali(results.p_value.toFixed(6))}
        </p>
      )}

      {results?.p_value !== undefined && (
        <p className="mb-4">
          <strong>{language === "বাংলা" ? "সিদ্ধান্ত:" : "Conclusion"}:</strong>
          {results.p_value < 0.05 ? (
            <span className="text-green-600 font-medium ml-2">
              {t.significant}
            </span>
          ) : (
            <span className="text-red-600 font-medium ml-2">
              {t.notSignificant}
            </span>
          )}
        </p>
      )}

      {results.image_paths && results.image_paths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "বাংলা" ? "ভিজ্যুয়ালাইজেশন" : "Visualizations"}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {results.image_paths.map((path, index) => {
              const handleDownload = async () => {
                try {
                  const response = await fetch(`${django_base_url}/${path}`);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  const filename =
                    path.split("/").pop() ||
                    `${t.kruskalTitle}_visualization_${index + 1}.png`;
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
              };

              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                  <div className="relative">
                    <img
                      src={`${django_base_url}/${path}`}
                      alt={`${t.kruskalTitle} visualization ${index + 1}`}
                      className="w-full h-auto object-contain"
                    />
                    <button
                      onClick={handleDownload}
                      className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 transform hover:scale-105 flex items-center text-sm"
                      title={
                        language === "বাংলা"
                          ? `ছবি ${index + 1} ডাউনলোড করুন`
                          : `Download Image ${index + 1}`
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
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
export default renderKruskalResults;
