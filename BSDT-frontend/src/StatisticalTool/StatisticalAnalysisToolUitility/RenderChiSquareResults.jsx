import React from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const renderChiSquareResults = ({
  results,
  django_base_url,
  language,
  digitMapBn,
}) => {
  const blockRefs = useRef({});

  const downloadBlockPNG = async (anchor) => {
    const el = blockRefs.current[anchor];
    if (!el) return;
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
    });
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${anchor.replace(/\s+/g, "_")}_chi2_table.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const downloadBlockPDF = async (anchor) => {
    const el = blockRefs.current[anchor];
    if (!el) return;
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 40; // side margins
    const imgH = (canvas.height * imgW) / canvas.width;
    const marginX = 20;
    const marginY = 20;
    const scale = Math.min(imgW / imgW, (pageH - 40) / imgH);
    const finalW = imgW * scale;
    const finalH = imgH * scale;

    pdf.addImage(imgData, "PNG", marginX, marginY, finalW, finalH);
    pdf.save(`${anchor.replace(/\s+/g, "_")}_chi2_table.pdf`);
  };
  const downloadAllBlocksPDF = async () => {
    if (!results?.blocks?.length) return;
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let first = true;
    for (const { anchor } of results.blocks) {
      const el = blockRefs.current[anchor];
      if (!el) continue;

      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
      });
      const imgData = canvas.toDataURL("image/png");

      const imgW = pageW - 40;
      const imgH = (canvas.height * imgW) / canvas.width;
      const scale = Math.min(1, (pageH - 40) / imgH);
      const finalW = imgW * scale;
      const finalH = imgH * scale;

      if (!first) pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, 20, finalW, finalH);
      first = false;
    }

    pdf.save("chi2_anchor_tables.pdf");
  };

  const mapDigitIfBengali = (text) => {
    if (language !== "bn" || text === null || text === undefined)
      return text ?? "";
    const s = String(text);
    return s
      .split("")
      .map((ch) => digitMapBn[ch] ?? ch)
      .join("");
  };

  const fmt = (v, digits = 6) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "–";
    const s = typeof v === "number" ? v.toFixed(digits) : String(v);
    return mapDigitIfBengali(s);
  };

  if (!results) {
    return (
      <p>{language === "bn" ? "ফলাফল লোড হচ্ছে..." : "Loading results..."}</p>
    );
  }

  const t = (en, bn) => (language === "bn" ? bn : en);

  const renderHeader = (cols) => (
    <thead className="bg-gray-50">
      <tr>
        {cols.map((c) => (
          <th
            key={c.key}
            className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border-b"
          >
            {mapDigitIfBengali(c.label)}
          </th>
        ))}
      </tr>
    </thead>
  );

  const baseColumns = results.table_columns ?? [
    { key: "variable1", label: t("Variable 1", "ভেরিয়েবল ১") },
    { key: "variable2", label: t("Variable 2", "ভেরিয়েবল ২") },
    {
      key: "chi2",
      label: t("Chi-square statistic", "কাই-স্কয়ার পরিসংখ্যান"),
    },
    { key: "p_value", label: t("P-value", "পি-মান") },
    { key: "dof", label: t("DoF", "স্বাধীনতার মাত্রা") },
    { key: "n", label: t("N", "নমুনা") },
  ];
  const renderBlocks = () => {
    if (!results.blocks || results.blocks.length === 0) return null;
    return (
      <div className="space-y-8 ">
        <div className="flex justify-end">
          <button
            onClick={downloadAllBlocksPDF}
            className="px-3 py-2 mb-2 text-sm bg-slate-800 text-white rounded hover:bg-slate-700"
            title={t(
              "Export all blocks as PDF",
              "সব ব্লক PDF হিসেবে ডাউনলোড করুন"
            )}
          >
            {t("Download all (PDF)", "সব ডাউনলোড (PDF)")}
          </button>
        </div>

        {results.blocks.map((block, i) => (
          <>
            <div
              key={i}
              ref={(el) => {
                blockRefs.current[block.anchor] = el;
              }}
              className="bg-white shadow border rounded"
            >
              <div className="px-4 py-3 border-b bg-gray-100 rounded-t flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("Variable 1: ", "ভেরিয়েবল ১: ")}
                    <span className="font-bold">
                      {mapDigitIfBengali(block.anchor)}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t(
                      "Compared against all other variables below.",
                      "নীচে অন্যান্য সব ভেরিয়েবলের সাথে তুলনা করা হয়েছে।"
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  {renderHeader(
                    baseColumns.filter((c) => c.key !== "variable1")
                  )}
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="odd:bg-white even:bg-gray-50">
                        {/* anchor implied, don’t show col 1 */}
                        <td className="px-3 py-2 text-sm border-b">
                          {mapDigitIfBengali(row.variable2)}
                        </td>
                        <td className="px-3 py-2 text-sm border-b">
                          {fmt(row.chi2)}
                        </td>
                        <td className="px-3 py-2 text-sm border-b">
                          {fmt(row.p_value)}
                        </td>
                        <td className="px-3 py-2 text-sm border-b">
                          {fmt(row.dof, 0)}
                        </td>
                        <td className="px-3 py-2 text-sm border-b">
                          {fmt(row.n, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-2 mt-2 mb-2 justify-end">
              <button
                onClick={() => downloadBlockPNG(block.anchor)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                title={t(
                  "Download PNG of this table",
                  "এই টেবিল PNG ডাউনলোড করুন"
                )}
              >
                PNG ⬇
              </button>
              <button
                onClick={() => downloadBlockPDF(block.anchor)}
                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                title={t(
                  "Download PDF of this table",
                  "এই টেবিল PDF ডাউনলোড করুন"
                )}
              >
                PDF ⬇
              </button>
            </div>
          </>
        ))}
      </div>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {t("Chi-Square Results", "কাই-স্কয়ার ফলাফল")}
      </h2>
      {results.variables && results.variables.length > 0 && (
        <p className="mb-4 text-sm text-gray-700">
          <strong>{t("Variables:", "ভেরিয়েবলসমূহ:")}</strong>{" "}
          {results.variables.map((v, i) => (
            <span key={i}>
              {mapDigitIfBengali(v)}
              {i < results.variables.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}
      <div className="mb-8">{renderBlocks()}</div>
      {results.image_path && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {language === "bn"
              ? "হিটম্যাপ ভিজ্যুয়ালাইজেশন"
              : "Heatmap Visualization"}
          </h3>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="relative">
              <img
                src={`${django_base_url}/${results.image_path}`}
                alt="Heatmap"
                className="w-full h-auto"
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
                      results.image_path.split("/").pop() || "heatmap.png";
                    link.href = url;
                    link.download = filename;
                    link.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Error downloading heatmap:", error);
                  }
                }}
                className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md shadow-lg transition duration-200 text-sm"
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
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default renderChiSquareResults;
