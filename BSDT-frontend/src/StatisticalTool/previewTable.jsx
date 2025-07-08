import React, { useState, useEffect } from "react";

const PreviewTable = ({ columns, initialData, setData,data, setIsPreviewModalOpen, isPreviewModalOpen }) => {

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [highlightMatches, setHighlightMatches] = useState({});


    useEffect(() => {
    if (!isPreviewModalOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsPreviewModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isPreviewModalOpen]);
  useEffect(() => {
    if (Array.isArray(initialData)) {
      setData(initialData);
    }
  }, [initialData]);

  // Row click for selection
  const handleRowClick = (index) => {
    setSelectedRowIndex((prev) => (prev === index ? null : index));
  };

  // Live highlight on findText change
  useEffect(() => {
    const matches = {};
    if (findText.trim() !== "") {
      const regex = new RegExp(findText, "gi");

      data.forEach((row, rowIndex) => {
        columns.forEach((col) => {
          const cell = row[col];
          if (typeof cell === "string" && cell.match(regex)) {
            if (!matches[rowIndex]) matches[rowIndex] = {};
            matches[rowIndex][col] = true;
          }
        });
      });
    }
    setHighlightMatches(matches);
  }, [findText, data, columns]);

  // Replace text (case-insensitive)
  const handleFindReplace = () => {
    if (!findText.trim()) return;

    const regex = new RegExp(findText, "gi");
    const updated = data.map((row, rowIndex) => {
      const newRow = {};
      columns.forEach((col) => {
        const cell = row[col];
        if (typeof cell === "string") {
          newRow[col] = cell.replace(regex, replaceText);
        } else {
          newRow[col] = cell;
        }
      });
      return newRow;
    });
    setData(updated);
  };

  const deleteSelectedRow = () => {
    if (selectedRowIndex !== null) {
      const newData = data.filter((_, idx) => idx !== selectedRowIndex);
      setData(newData);
      setSelectedRowIndex(null);
    }
  };

  return (
    <div className={isPreviewModalOpen ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" : ""}>
      <div className={`bg-white p-4 rounded-lg shadow-lg w-full ${isPreviewModalOpen ? "max-w-6xl max-h-[90vh] overflow-auto relative" : ""}`}>

        {/* ❌ Close Button (only in preview modal) */}
        {isPreviewModalOpen && (
          <button
            onClick={() => setIsPreviewModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
          >
            ✖
          </button>
        )}
      {/* Controls */}
      {!isPreviewModalOpen && (
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Find"
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Replace"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          className="border p-2 rounded"
        />
        <button
        onClick={handleFindReplace}
        style={{
            backgroundColor: "#7481e4",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#3d4263"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#7481e4"}
        >
        Replace
        </button>
        <button
        onClick={deleteSelectedRow}
        style={{
            backgroundColor: "#82020b",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#5a0208"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#82020b"}
        >
        Delete Selected Row
        </button>

      </div>
      )}

      {/* Table */}
      
      <div className="overflow-auto max-h-[75vh] border rounded">
        <table className="table-auto text-sm text-left border-collapse min-w-full">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="p-2 border text-gray-800 font-semibold whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-red-500 p-4">
                  ⚠️ No data available
                </td>
              </tr>
            ) : (
              data.map((row, ridx) => (
                <tr
                    key={ridx}
                    onClick={() => handleRowClick(ridx)}
                    className={`transition ${
                        selectedRowIndex === ridx ? "bg-yellow-selected" : "hover-bg-gray"
                    }`}
                    >
                  {columns.map((col, cidx) => {
                    const value = row[col];
                    const isHighlighted = highlightMatches?.[ridx]?.[col];
                    return (
                      <td
                        key={cidx}
                        className={`p-2 border text-gray-700 whitespace-nowrap max-w-xs truncate ${
                            isHighlighted ? "bg-yellow-highlight" : ""
                        }`}
                        >
                        {value}
                        </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default PreviewTable;
