import React from "react";
const renderEDAPieResults = ({ results, language, django_base_url }) => {
  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {language === "bn" ? "পাই চার্ট ফলাফল" : "Pie Chart Results"}
      </h2>

      {/* Selected column info */}
      {results.columns && results.columns.length > 0 && (
        <p className="mb-3">
          <strong>
            {language === "bn" ? "বিশ্লেষিত কলাম:" : "Analyzed Column:"}
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

      {/* Image output */}
      {results.image_paths && results.image_paths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn" ? "ভিজ্যুয়ালাইজেশন" : "Visualization"}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {results.image_paths.map((path, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={`${django_base_url}/${path}`}
                  alt={`Pie Chart ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${django_base_url}/${path}`
                      );
                      if (!response.ok)
                        throw new Error("Network response was not ok");
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      const filename =
                        path.split("/").pop() || `pie_chart_${index + 1}.png`;
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
export default renderEDAPieResults;
