import React, { useState, useEffect } from "react";

const PreviewTable = ({ columns, initialData, setData,data }) => {

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [highlightMatches, setHighlightMatches] = useState({});

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
    <div className="overflow-auto max-w-full p-4">
      {/* Controls */}
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
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563eb"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3b82f6"}
        >
        Replace
        </button>
        <button
        onClick={deleteSelectedRow}
        style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dc2626"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ef4444"}
        >
        Delete Selected Row
        </button>

      </div>

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
                        {value ?? "-"}
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
  );
};

export default PreviewTable;
