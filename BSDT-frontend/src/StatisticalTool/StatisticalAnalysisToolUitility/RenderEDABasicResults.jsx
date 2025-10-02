import React from "react";
const renderEDABasicsResults = ({ language, digitMapBn, results }) => {
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

  //   const renderSimpleTable = (title, data) => (
  //     <div className="mb-6">
  //       <h4 className="text-xl font-semibold mb-2">{title}</h4>
  //       <table className="min-w-full table-auto border border-collapse border-gray-300 text-sm">
  //         <thead>
  //           <tr>
  //             <th className="border px-2 py-1 bg-gray-100">
  //               {language === "bn" ? "কলাম" : "Column"}
  //             </th>
  //             <th className="border px-2 py-1 bg-gray-100">
  //               {language === "bn" ? "মান (%)" : "Value (%)"}
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {Object.entries(data).map(([key, value], i) => (
  //             <tr key={i}>
  //               <td className="border px-2 py-1">{key}</td>
  //               <td className="border px-2 py-1">{value}</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   );

  const renderWideTable = (title, statKeys) => {
    const columns = Object.keys(results[statKeys[0]] || {});
    if (columns.length === 0) return null;

    return (
      <div className="mb-6 overflow-x-auto">
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <table className="min-w-full table-auto border border-collapse border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-100">
                {language === "bn" ? "কলাম" : "Column"}
              </th>
              {statKeys.map((statKey, idx) => (
                <th key={idx} className="border px-2 py-1 bg-gray-100">
                  {renderTitle(statKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((col, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{col}</td>
                {statKeys.map((statKey, idx) => (
                  <td key={idx} className="border px-2 py-1">
                    {results[statKey]?.[col] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTitle = (key) => {
    const titles = {
      count: language === "bn" ? "গণনা" : "Count",
      min: language === "bn" ? "সর্বনিম্ন" : "Min",
      max: language === "bn" ? "সর্বোচ্চ" : "Max",
      range: language === "bn" ? "পরিসর" : "Range",
      iqr: language === "bn" ? "IQR" : "IQR",
      outliers: language === "bn" ? "আউটলাইয়ার সংখ্যা" : "Outliers",
      mean: language === "bn" ? "গড়" : "Mean",
      median: language === "bn" ? "মিডিয়ান" : "Median",
      mode: language === "bn" ? "মোড" : "Mode",
      variance: language === "bn" ? "চর বৈচিত্র্য" : "Variance",
      std: language === "bn" ? "স্ট্যান্ডার্ড ডেভিয়েশন" : "Std Dev",
      mad: language === "bn" ? "ম্যাড" : "MAD",
      skew: language === "bn" ? "স্কিউনেস" : "Skewness",
      kurt: language === "bn" ? "কার্টোসিস" : "Kurtosis",
      cv: language === "bn" ? "CV" : "Coeff. of Variation",
    };
    return titles[key] || key;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {language === "bn" ? "মৌলিক EDA বিশ্লেষণ" : "Basic EDA Summary"}
      </h2>

      {/* Dataset Info */}
      {results.info && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {language === "bn" ? "ডেটাসেট তথ্য" : "Dataset Info"}
          </h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              {language === "bn"
                ? `মোট সারি: ${mapDigitIfBengali(results.info.rows)}`
                : `Total Rows: ${results.info.rows}`}
            </li>
            <li>
              {language === "bn"
                ? `মোট কলাম: ${mapDigitIfBengali(results.info.columns)}`
                : `Total Columns: ${results.info.columns}`}
            </li>
            <li>
              {language === "bn"
                ? `পুনরাবৃত্ত সারি: ${mapDigitIfBengali(
                    results.info.duplicates
                  )}`
                : `Duplicate Rows: ${results.info.duplicates}`}
            </li>
            <li>
              {language === "bn"
                ? `মেমোরি ব্যবহার: ${mapDigitIfBengali(
                    results.info.memory
                  )} কিলোবাইট`
                : `Memory Usage: ${results.info.memory} KB`}
            </li>
          </ul>
        </div>
      )}

      {/* Table 1 */}
      {renderWideTable(
        language === "bn"
          ? "টেবিল ১: পরিসংখ্যান এবং বিস্তার"
          : "Table 1: Count, Min, Max, Range, IQR, Outliers",
        ["count", "min", "max", "range", "iqr", "outliers"]
      )}

      {/* Table 2 */}
      {renderWideTable(
        language === "bn"
          ? "টেবিল ২: কেন্দ্রীয় প্রবণতা এবং বিক্ষিপ্ততা"
          : "Table 2: Central Tendency & Dispersion",
        ["mean", "median", "mode", "variance", "std"]
      )}

      {/* Table 3 */}
      {renderWideTable(
        language === "bn"
          ? "টেবিল ৩: ম্যাড, স্কিউনেস, কার্টোসিস, সিভি"
          : "Table 3: MAD, Skewness, Kurtosis, CV",
        ["mad", "skew", "kurt", "cv"]
      )}
    </>
  );
};

export default renderEDABasicsResults;
