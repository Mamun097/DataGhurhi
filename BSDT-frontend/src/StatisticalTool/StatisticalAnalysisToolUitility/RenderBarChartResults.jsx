import React from "react";
const renderBarChartResults = ({
    results,
    columns,
    language,
    barChartType,
    django_base_url,
}) => {
  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {language === "bn" ? "বার চার্ট" : "Bar Chart"}
      </h2>

      {columns && columns[0] && (
        <p className="mb-3">
          <strong>
            {language === "bn" ? "বিশ্লেষিত কলাম:" : "Column analyzed:"}
          </strong>{" "}
          {columns[0]}
        </p>
      )}

      <p className="mb-2">
        <strong>
          {language === "bn" ? "বার চার্ট টাইপ:" : "Bar chart type:"}
        </strong>{" "}
        {barChartType === "vertical"
          ? language === "bn"
            ? "উল্লম্ব"
            : "Vertical"
          : language === "bn"
          ? "অনুভূমিক"
          : "Horizontal"}
      </p>

      {results.image_paths && results.image_paths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn" ? "ভিজ্যুয়ালাইজেশন" : "Visualizations"}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {results.image_paths.map((path, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={`${django_base_url}${path}`}
                  alt={`Bar chart visualization ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
export default renderBarChartResults;
