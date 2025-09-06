import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./StatisticalAnalysisTool.css";
import PreviewTable from "./previewTable";
import { useLocation } from "react-router-dom"; // Import useLocation to access state

const PreprocessDataPage = () => {
  const [data, setData] = useState([]);
  const filename =
    sessionStorage.getItem("file_name") || "latest_uploaded.xlsx"; // Get filename from sessionStorage or default to 'latest_uploaded.xlsx'
  console.log("Filename:", filename); // Log the filename for debugging
  const [columns, setColumns] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [columnsToDelete, setColumnsToDelete] = useState([]);

  const [missingColumn, setMissingColumn] = useState("");
  const [missingMethod, setMissingMethod] = useState("");

  const [outlierColumn, setOutlierColumn] = useState("");
  const [outlierMethod, setOutlierMethod] = useState("");

  const [rankColumn, setRankColumn] = useState("");
  const [rankMapping, setRankMapping] = useState({}); // { "High": 1, "Medium": 2, ... }

  const [splitTargetColumn, setSplitTargetColumn] = useState("");
  const [splitMethod, setSplitMethod] = useState("");
  const [customPhrases, setCustomPhrases] = useState([]);
  const [customPhraseInput, setCustomPhraseInput] = useState("");

  const [groupCategoricalCol, setGroupCategoricalCol] = useState("");
  const [groupNumericalCol, setGroupNumericalCol] = useState("");
  const [groupingPairs, setGroupingPairs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [missingValues, setMissingValues] = useState({});
  const [numericColumns, setNumericColumns] = useState([]);
  const [outliersSummary, setOutliersSummary] = useState({});
  const [outlierCells, setOutlierCells] = useState([]);

  const [duplicateColumns, setDuplicateColumns] = useState([]);
  const [missingSpec, setMissingSpec] = useState("");
  const [duplicateIndices, setDuplicateIndices] = useState([]); // New state for duplicate row indices
  const [fileURL, setFileURL] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.userId) {
      setUserId(location.state.userId);
      console.log("User ID from location.state:", location.state.userId);
    }
  }, [location.state]);

  useEffect(() => {
    if (!userId) return;

    // Now fetch only when userId is set
    fetch("http://127.0.0.1:8000/api/preview-data/", {
      method: "GET",
      headers: {
        userID: userId,
        filename: filename, // Include filename in headers
        sheet: sessionStorage.getItem("activesheetname") || "",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        console.log("Data fetched successfully");
        setColumns(result.columns);
        setData(result.rows);
        setAvailableColumns(result.columns);
        setMissingValues(result.missing_values || {});
        setFileURL(result.fileURL || "");
        // setNumericColumns(result.num_columns || [])
      })
      .catch((err) => {
        console.error(" Failed to load preview data:", err.message);
      });
  }, [userId, sessionStorage.getItem("activesheetname")]);
  useEffect(() => {
    if (selectedOption === "handle_outliers") {
      console.log("entered");
      fetch("http://127.0.0.1:8000/api/outliers-summary/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userID: userId,
          filename: filename,
        },
      })
        .then((res) => res.json())
        .then((summaryData) => {
          if (!summaryData.success) {
            alert(summaryData.error || "Failed to fetch outlier summary.");
            return;
          }

          setNumericColumns(summaryData.numeric_columns || []);
          setOutliersSummary(summaryData.outliers_summary);
          setOutlierCells(summaryData.outlier_cells || []);
          console.log("Fetched Outlier Summary:", summaryData);
        })
        .catch((err) => {
          console.error("Outlier summary fetch failed:", err);
          alert("Server error while fetching outliers.");
        });
    }
  }, [selectedOption]);

  useEffect(() => {
    console.log("Columns updated:", columns);
  }, [columns]);

  function downloadAsExcel(data, filename) {
    console.log("Downloading data as Excel:", data);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, filename);
  }

  function downloadAsPDF(data, filename = "data.pdf") {
    const doc = new jsPDF();
    if (data.length === 0) {
      doc.text("No data available", 10, 10);
    } else {
      const columns = Object.keys(data[0]);
      const rows = data.map((row) => columns.map((col) => row[col]));

      autoTable(doc, {
        head: [columns],
        body: rows,
      });
    }
    doc.save(filename);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        {" "}
        Data Preprocessing
      </h1>

      <div className="flex justify-between items-start mb-6 px-2 flex-wrap gap-4">
        {/* Preprocessing Menu + Analyze Button */}
        <div className="flex flex-col gap-2">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-fit"
          >
            <option value="">Preprocessing Menu</option>
            <option value="delete_column">1. Delete an existing column</option>
            <option value="remove_duplicates">2. Remove duplicate rows</option>
            <option value="handle_missing">3. Handle missing values</option>
            <option value="handle_outliers">4. Handle outliers</option>
            <option value="rank_column">
              5. Map or rank a categorical column
            </option>
            <option value="split_column">6. Column Split</option>
            <option value="grouping">7. Grouping</option>
            <option value="generate_id">8. Generate Unique ID column</option>
          </select>

          <button
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow"
            onClick={() => {
              if (!selectedOption) {
                alert("Please select a preprocessing option first.");
                return;
              }

              // Option 1: Delete Column
              if (selectedOption === "delete_column") {
                if (columnsToDelete.length === 0) {
                  alert("Please select at least one column to delete.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/delete-columns/", {
                  method: "POST",
                  headers: {
                    userID: userId, // Include user ID in headers
                    filename: filename, // Include filename in headers
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ columns: columnsToDelete }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      setColumnsToDelete([]);
                      alert("Selected column(s) deleted successfully.");
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              }

              // Option 2: Remove Duplicate Rows
              else if (selectedOption === "remove_duplicates") {
                fetch("http://127.0.0.1:8000/api/find-duplicates/", {
                  method: "POST",
                  headers: {
                    userID: userId,
                    filename: filename,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ columns: duplicateColumns }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      setDuplicateIndices(result.duplicate_indices);
                      alert(result.message);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              }

              // 3. Handle missing values
              else if (selectedOption === "handle_missing") {
                if (!missingColumn || !missingMethod) {
                  alert("Please select both column and method.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/handle-missing/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    userID: userId, // Include user ID in headers
                    filename: filename, // Include filename in headers
                  },
                  body: JSON.stringify({
                    column: missingColumn,
                    method: missingMethod,
                    missing_spec: missingSpec,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      alert(result.message);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              }

              // 4. Handle outliers
              else if (selectedOption === "handle_outliers") {
                if (!outlierColumn || !outlierMethod) {
                  alert("Please select both column and method.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/handle-outliers/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    userID: userId, // Include user ID in headers
                  },
                  body: JSON.stringify({
                    column: outlierColumn,
                    method: outlierMethod,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      alert(result.message);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              }

              // 5. Map or rank column
              else if (selectedOption === "rank_column") {
                if (!rankColumn || Object.keys(rankMapping).length === 0) {
                  alert("Please select a column and assign ranks.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/rank-column/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    userID: userId, // Include user ID in headers
                    filename: filename, // Include filename in headers
                  },
                  body: JSON.stringify({
                    column: rankColumn,
                    mapping: rankMapping,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      alert(result.message);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              } else if (selectedOption === "split_column") {
                if (!splitTargetColumn) {
                  alert("Please select a target column for splitting.");
                  return;
                }
                if (!splitMethod) {
                  alert("Please select a split method.");
                  return;
                }
                if (splitMethod === "4" && customPhrases.length === 0) {
                  alert("Please add at least one custom phrase.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/split-column/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    userID: userId,
                    filename: filename,
                  },
                  body: JSON.stringify({
                    column: splitTargetColumn,
                    method: splitMethod,
                    phrases: splitMethod === "custom" ? customPhrases : [],
                    delete_original: true,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      alert("Column split successful!");
                      setSplitTargetColumn("");
                      setSplitMethod("");
                      setCustomPhraseInput("");
                      setCustomPhrases([]);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              } else if (selectedOption === "grouping") {
                if (groupingPairs.length === 0) {
                  alert("Please add at least one grouping pair.");
                  return;
                }

                fetch("http://127.0.0.1:8000/api/group-data/", {
                  method: "POST",
                  headers: {
                    userID: userId, // Include user ID in headers
                    filename: filename, // Include filename in headers
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ groupingPairs }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      alert("Grouped data saved successfully!");
                      const link = document.createElement("a");
                      link.href = `http://103.94.135.115:8001${result.download_url}`;
                      link.setAttribute("download", "");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              } else if (selectedOption === "generate_id") {
                fetch("http://127.0.0.1:8000/api/generate-unique-id/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    userID: userId, // Include user ID in headers
                    filename: filename, // Include filename in headers
                  },
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.success) {
                      setColumns(result.columns);
                      setData(result.rows);
                      setAvailableColumns(result.columns);
                      alert(result.message || "Unique ID column added.");
                    } else {
                      alert(result.error || "Something went wrong.");
                    }
                  });
              }
            }}
          >
            Preprocess
          </button>
        </div>

        {/* Download Button on the Right */}
        <div className="ml-auto gap-4 flex flex-wrap items-center">
          <button
            className="bg-green-500 hover:bg-green-600 text-white  font-medium py-2 px-4 rounded-lg shadow"
            onClick={() => {
              if (data.length === 0) {
                alert("No data available to download.");
                return;
              }

              downloadAsExcel(data, filename);
            }}
          >
            Download Data as Excel
          </button>

          <button
            className="bg-green-500 hover:bg-green-600 text-white font-medium  py-2 px-4 rounded-lg shadow"
            onClick={async () => {
              if (data.length === 0) {
                alert("No preprocessed data available to analyze.");
                return;
              }

              // 1. Convert JSON data to Excel Blob
              const worksheet = XLSX.utils.json_to_sheet(data);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

              const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
              });
              const file = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });

              // 2. Upload to backend as FormData
              const formData = new FormData();
              formData.append("file", file, `preprocessed_${filename}`);
              formData.append("file_type", "preprocessed");

              try {
                const response = await fetch(
                  "http://127.0.0.1:8000/api/upload-preprocessed/",
                  {
                    method: "POST",
                    body: formData,
                    headers: {
                      userID: userId, // Include user ID in headers
                    },
                  }
                );

                const result = await response.json();

                if (result.success) {
                  // 3. Store session flag and redirect
                  sessionStorage.setItem("preprocessed", "true");
                  window.location.href = "/analysis";
                } else {
                  alert("Failed to upload Excel: " + result.error);
                }
              } catch (err) {
                console.error("Upload error:", err);
                alert("Failed to upload preprocessed data.");
              }
            }}
          >
            Analyze Data
          </button>
        </div>
      </div>

      {/*Conditional delete column selector goes here */}
      {selectedOption === "delete_column" && (
        <div className="mb-6">
          {/* Column(s) Big Box Display */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column(s) to delete:
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[48px] flex flex-wrap gap-2">
            {columnsToDelete.length > 0 ? (
              columnsToDelete.map((col, idx) => (
                <span key={idx} className="tag-chip">
                  {col}
                  <button
                    type="button"
                    aria-label={`Remove ${col}`}
                    className="remove-button"
                    onClick={() =>
                      setColumnsToDelete((prev) =>
                        prev.filter((item) => item !== col)
                      )
                    }
                  >
                    &times;
                  </button>
                </span>
              ))
            ) : (
              <p className="text-gray-400">No columns selected yet</p>
            )}
          </div>

          {/* Dropdown to Add Columns */}
          <select
            className="border border-gray-300 rounded-lg p-3 mt-2 w-full"
            onChange={(e) => {
              const selected = e.target.value;
              if (selected && !columnsToDelete.includes(selected)) {
                setColumnsToDelete((prev) => [...prev, selected]);
              }
              e.target.selectedIndex = 0;
            }}
          >
            <option value="">Select column...</option>
            {availableColumns
              .filter((col) => !columnsToDelete.includes(col))
              .map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
          </select>
        </div>
      )}
      {selectedOption === "remove_duplicates" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column(s) to check duplicates:
          </label>

          <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[48px]">
            {duplicateColumns.length > 0 ? (
              <p className="text-gray-800">{duplicateColumns.join(", ")}</p>
            ) : (
              <p className="text-gray-400">No columns selected yet</p>
            )}
          </div>

          <select
            className="border border-gray-300 rounded-lg p-3 mt-2 w-full"
            onChange={(e) => {
              const selected = e.target.value;
              if (selected && !duplicateColumns.includes(selected)) {
                setDuplicateColumns((prev) => [...prev, selected]);
              }
              e.target.selectedIndex = 0;
            }}
          >
            <option value="">Select column...</option>
            {availableColumns
              .filter((col) => !duplicateColumns.includes(col))
              .map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
          </select>
        </div>
      )}

      {selectedOption === "handle_missing" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select column (or 'all'):
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            value={missingColumn}
            onChange={(e) => setMissingColumn(e.target.value)}
          >
            <option value="">Select column...</option>
            <option value="all">All Columns</option>
            {Object.entries(missingValues).map(([col, count], idx) => (
              <option key={idx} value={col}>
                {col} ({count} missing)
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Method:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            value={missingMethod}
            onChange={(e) => setMissingMethod(e.target.value)}
          >
            <option value="">Choose method</option>
            <option value="drop">Drop missing rows</option>
            <option value="fill_mean">Fill with mean</option>
            <option value="fill_median">Fill with median</option>
            <option value="fill_mode">Fill with mode</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Missing value marker (optional):
          </label>
          <input
            type="text"
            placeholder="e.g. -, N/A, null"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            value={missingSpec}
            onChange={(e) => setMissingSpec(e.target.value)}
          />
        </div>
      )}

      {selectedOption === "handle_outliers" && (
        <div className="mb-4">
          {/*Column Selection */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select numeric column:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            value={outlierColumn}
            onChange={(e) => setOutlierColumn(e.target.value)}
          >
            <option value="">Select column...</option>
            {numericColumns.map((col, idx) => (
              <option key={idx} value={col}>
                {col} (Outliers: {outliersSummary?.[col] ?? "0"})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedOption === "rank_column" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select categorical column:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            value={rankColumn}
            onChange={(e) => {
              const selected = e.target.value;
              setRankColumn(selected);
              setRankMapping({}); // Reset mapping when column changes
            }}
          >
            <option value="">Select column...</option>
            {availableColumns.map((col, idx) => (
              <option key={idx} value={col}>
                {col}
              </option>
            ))}
          </select>

          {rankColumn && (
            <>
              <p className="text-sm text-gray-700 mt-2 mb-1">Assign ranks:</p>
              {[...new Set(data.map((row) => row[rankColumn]))]
                .filter((v) => v !== undefined)
                .map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <span className="text-gray-700">{val}</span>
                    <input
                      type="number"
                      className="border border-gray-300 rounded px-2 py-1 w-24"
                      value={rankMapping[val] || ""}
                      onChange={(e) =>
                        setRankMapping((prev) => ({
                          ...prev,
                          [val]: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                ))}
            </>
          )}
        </div>
      )}

      {selectedOption === "split_column" && (
        <div className="flex flex-col gap-4 border p-4 rounded-lg bg-white shadow-md mt-4">
          {/* Column Selector */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Target Column to Split:
            </label>
            <select
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={splitTargetColumn}
              onChange={(e) => setSplitTargetColumn(e.target.value)}
            >
              <option value="">-- Select Column --</option>
              {availableColumns.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Split Method */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Split Method:
            </label>
            <select
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={splitMethod}
              onChange={(e) => {
                setSplitMethod(e.target.value);
                setCustomPhrases([]); // Reset when method changes
                setCustomPhraseInput("");
              }}
            >
              <option value="">-- Choose Method --</option>
              <option value="comma">1. Comma Separated</option>
              <option value="semicolon">2. Semicolon Separated</option>
              <option value="tags">3. &lt;&gt; Tag Separated</option>
              <option value="custom">4. Custom Phrase Matching</option>
            </select>
          </div>

          {/* Custom Phrase Input */}
          {splitMethod === "custom" && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Enter Custom Phrase:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={customPhraseInput}
                  onChange={(e) => setCustomPhraseInput(e.target.value)}
                  placeholder="e.g., Absolutely Yes"
                />
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    const trimmed = customPhraseInput.trim();
                    if (trimmed && !customPhrases.includes(trimmed)) {
                      setCustomPhrases((prev) => [...prev, trimmed]);
                      setCustomPhraseInput("");
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {customPhrases.length > 0 ? (
                  <p>
                    <strong>Added:</strong> {customPhrases.join(", ")}
                  </p>
                ) : (
                  <p>No custom phrases added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOption === "grouping" && (
        <div className="mb-6 w-full">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Categorical Column */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Categorical Column (Group by)
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 w-full shadow-sm"
                value={groupCategoricalCol}
                onChange={(e) => setGroupCategoricalCol(e.target.value)}
              >
                <option value="">-- Select categorical column --</option>
                {availableColumns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Numeric Column */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Numeric Column (Analyze)
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 w-full shadow-sm"
                value={groupNumericalCol}
                onChange={(e) => setGroupNumericalCol(e.target.value)}
              >
                <option value="">-- Select numeric column --</option>
                {availableColumns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              onClick={() => {
                if (!groupCategoricalCol || !groupNumericalCol) {
                  alert("Please select both columns.");
                  return;
                }
                setGroupingPairs((prev) => [
                  ...prev,
                  {
                    group_col: groupCategoricalCol,
                    value_col: groupNumericalCol,
                  },
                ]);
                setGroupCategoricalCol("");
                setGroupNumericalCol("");
              }}
            >
              Add Pair
            </button>

            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-black font-semibold px-4 py-2 rounded"
              onClick={() => setGroupingPairs([])}
            >
              Clear All
            </button>
          </div>

          {/* Grouping Preview */}
          {groupingPairs.length > 0 && (
            <div className="bg-gray-100 rounded p-4 border border-gray-300 mb-4">
              <h4 className="text-md font-semibold mb-2 text-gray-700">
                Grouping Pairs:
              </h4>
              <ul className="list-disc pl-6 text-gray-800">
                {groupingPairs.map((pair, idx) => (
                  <li key={idx}>
                    Group by <strong>{pair.group_col}</strong> — Analyze{" "}
                    <strong>{pair.value_col}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedOption === "generate_id" && (
        <div className="flex flex-col gap-4 border p-4 rounded-lg bg-white shadow-md mt-4">
          <p className="text-gray-800">
            This option will add a new column called <strong>row_id</strong>{" "}
            with unique sequential numbers (1 to N) for each row in your
            dataset.
          </p>
          <p className="text-sm text-gray-600 italic">
            No additional configuration is required. Click "Preprocess" to
            apply.
          </p>
        </div>
      )}

      <PreviewTable
        workbookUrl={`${sessionStorage.getItem("fileURL")}`} // ← the only data source
        columns={columns}
        duplicateIndices={duplicateIndices}
        setData={setData}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        isPreviewModalOpen={isPreviewModalOpen}
        outlierCells={outlierCells}
        selectedOption={selectedOption}
      />
      <div className="text-center mt-6">
        <a href="/analysis" className="text-blue-600 hover:underline">
          ← Back to Main Page
        </a>
      </div>
    </div>
  );
};

export default PreprocessDataPage;
