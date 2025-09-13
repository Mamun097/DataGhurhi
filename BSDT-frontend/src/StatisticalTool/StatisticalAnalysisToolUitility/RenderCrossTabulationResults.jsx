import React from "react";
const renderCrossTabulationResults = ({
    results,
    language,
    columns,django_base_url,    
}) => {
  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {language === "bn"
          ? "ক্রস ট্যাবুলেশন বিশ্লেষণ"
          : "Cross Tabulation Analysis"}
      </h2>

      {/* Columns Analyzed */}
      {columns && columns.length >= 2 && (
        <p className="mb-4">
          <strong>
            {language === "bn" ? "বিশ্লেষিত কলাম:" : "Columns analyzed:"}
          </strong>{" "}
          {columns.map((col, idx) => (
            <span key={idx}>
              {col}
              {idx < columns.length - 1
                ? language === "bn"
                  ? " এবং "
                  : " and "
                : ""}
            </span>
          ))}
        </p>
      )}

      {/* Translated Table */}
      {results.translated_table && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-center">
            {language === "bn" ? "অনুবাদিত টেবিল" : "Translated Table"}
          </h3>
          <div className="flex justify-center">
            <div className="overflow-auto">
              <table className="min-w-max border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 bg-gray-100">
                      {language === "bn" ? "ইন্ডেক্স" : "Index"}
                    </th>
                    {Object.keys(
                      results.translated_table[
                        Object.keys(results.translated_table)[0]
                      ]
                    ).map((col, idx) => (
                      <th
                        key={idx}
                        className="border border-gray-300 px-3 py-2 bg-gray-100"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.translated_table).map(
                    ([rowLabel, rowData], idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                          {rowLabel}
                        </td>
                        {Object.values(rowData).map((val, i) => (
                          <td
                            key={i}
                            className="border border-gray-300 px-3 py-2 text-center"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {results.heatmap_path && (
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">
              {language === "bn" ? "হিটম্যাপ" : "Heatmap"}
            </h4>
            <img
              src={`${django_base_url}/${results.heatmap_path}`}
              alt="Heatmap"
              className="w-full h-auto object-contain border rounded shadow"
            />
          </div>
        )}

        {results.barplot_path && (
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">
              {language === "bn" ? "বারপ্লট" : "Bar Plot"}
            </h4>
            <img
              src={`${django_base_url}/${results.barplot_path}`}
              alt="Bar Plot"
              className="w-full h-auto object-contain border rounded shadow"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {results.summary && (
        <div className="mb-6 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">
            {language === "bn" ? "সারাংশ" : "Summary"}
          </h3>
          <ul className="list-disc list-inside text-gray-800">
            <li>{results.summary.total_observations}</li>
            <li>{results.summary.most_frequent}</li>
            <li>{results.summary.least_frequent}</li>
          </ul>
        </div>
      )}
    </>
  );
};

export default renderCrossTabulationResults;
