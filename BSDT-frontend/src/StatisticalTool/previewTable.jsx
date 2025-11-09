import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";
import { CloudUpload, Save } from "lucide-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./previewTable.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const HEADER_ROWS = 1; //  a synthetic top row with the provided header names under Excel letters


const PreviewTable = ({
  // legacy props
  initialData,
  setData,
  columns,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  outlierCells = [],
  selectedOption = "",
  duplicateIndices = [],

  // new props
  workbookFile,
  workbookUrl,
  multiSheetData,
  defaultSheetName,
}) => {
  // Utility: generate Excel-like column letters A..Z, AA.. etc
  const generateColumnNames = (numCols = 128) => {
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      let name = "";
      let n = i;
      do {
        name = String.fromCharCode(65 + (n % 26)) + name;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      cols.push(name);
    }
    return cols;
  };

  const generateEmptyRows = (colLetters, numRows = 128) =>
    Array.from({ length: numRows }, () => Object.fromEntries(colLetters.map((c) => [c, ""])));

  // Convert array-of-arrays (SheetJS header:1) into our grid rows with a synthetic header row.
  const buildGridDataFromAoA = (aoa) => {
    const letters = generateColumnNames(Math.max(128, (aoa?.[0]?.length || 0)));
    const headerNames = (aoa?.[0] || []).map((h, i) => (h == null || h === "" ? `Column ${i + 1}` : String(h)));

    // Row0: put header names under letters (so the first visible row shows labels)
    const letterRow = Object.fromEntries(letters.map((L, i) => [L, headerNames[i] ?? ""]));

    const bodyRows = (aoa || []).slice(1).map((r) => {
      const o = {};
      letters.forEach((L, i) => (o[L] = r[i] ?? ""));
      return o;
    });

    // pad to 128 total rows (incl. the header letters row)
    while (bodyRows.length + 1 < 128) bodyRows.push(Object.fromEntries(letters.map((L) => [L, ""])));
    return { columns: letters, data: [letterRow, ...bodyRows] };
  };

  // If backend gives object rows, keep previous behavior
  const buildGridDataFromObjects = (rows, headerOrder) => {
    const letters = generateColumnNames(Math.max(128, headerOrder?.length || Object.keys(rows?.[0] || {}).length || 0));
    const names = headerOrder && headerOrder.length
      ? headerOrder
      : Object.keys(rows?.[0] || {}).map((k, i) => rows[0] && k ? k : `Column ${i + 1}`);

    const letterRow = Object.fromEntries(letters.map((L, i) => [L, names[i] ?? ""]));

    const body = (rows || []).map((r) => {
      const o = {};
      letters.forEach((L, i) => {
        const key = names[i];
        o[L] = key ? r[key] ?? "" : "";
      });
      return o;
    });
    while (body.length + 1 < 128) body.push(Object.fromEntries(letters.map((L) => [L, ""])));
    return { columns: letters, data: [letterRow, ...body] };
  };

  // Sheets state
  const [sheets, setSheets] = useState([]); // [{id, name, columns:[letters], data:[rows]}]
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [gridApi, setGridApi] = useState(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(0); // Track the index of the next match
  const [totalMatches, setTotalMatches] = useState(0); // Track the total number of matches
  const [matches, setMatches] = useState([]);


  const activeSheet = sheets[activeSheetIndex];

 useEffect(() => {
    let cancelled = false;

  const loadFromWorkbookArray = (buf) => {
    const wb = XLSX.read(buf, {
      type: "array",
      cellDates: true,
      cellNF: false,
      raw: true,
    });
    
    console.log("[PreviewTable] Sheet names:", wb.SheetNames);

    const built = wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: false });
      const { columns, data } = buildGridDataFromAoA(aoa);
      return { id: `${name}-${Math.random().toString(36).slice(2)}`, name, columns, data };
    });
    return built.length ? built : [];
  };

    

    (async () => {
      try {
        // Priority 1: explicit multiSheetData from backend
        if (multiSheetData && multiSheetData.length) {
          const built = multiSheetData.map((sh) => {
            const { columns: cols, data } = buildGridDataFromObjects(sh.rows);
            return { id: `${sh.name}-${Math.random().toString(36).slice(2)}`, name: sh.name, columns: cols, data };
          });
          if (!cancelled) {
            setSheets(built);
            const idx = Math.max(0, built.findIndex((s) => s.name === defaultSheetName));
            setActiveSheetIndex(idx === -1 ? 0 : idx);
            setData?.(built[0]?.data || []);
          }
          return;
        }

        

        // Priority 2: workbookUrl
        if (workbookUrl) {
        const res = await fetch(workbookUrl, {
          // credentials: "include", // uncomment if you protect media with cookies
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch workbook: HTTP ${res.status}`);
        }
        const buf = new Uint8Array(await res.arrayBuffer());
        const built = loadFromWorkbookArray(buf);
        if (!cancelled && built.length) {
          setSheets(built);
          const defaultIdx = (() => {
            if (!defaultSheetName) return 0;
            const idx = built.findIndex((s) => s.name === defaultSheetName);
            return idx === -1 ? 0 : idx;
          })();
          setActiveSheetIndex(defaultIdx);
          setData?.(built[defaultIdx]?.data || []);
        }
        return;
      }

      // 4) Fallback: legacy single-sheet path
      if (initialData && initialData.length) {
        const letters = generateColumnNames();
        const letterRow = Object.fromEntries(letters.map((L, i) => [L, columns?.[i] ?? ""]));
        const body = initialData.map((row) => {
          const o = {};
          const keys = Object.keys(initialData[0] || {});
          letters.forEach((L, i) => (o[L] = keys[i] ? row[keys[i]] ?? "" : ""));
          return o;
        });
        while (body.length + 1 < 128) body.push(Object.fromEntries(letters.map((L) => [L, ""])));
        const single = [{ id: Date.now(), name: "Sheet1", columns: letters, data: [letterRow, ...body] }];
        if (!cancelled) {
          setSheets((prev) => (prev.length ? prev : single));
          setActiveSheetIndex((prev) => (prev ?? 0));
          setData?.((prev) => (prev?.length ? prev : [letterRow, ...body]));
        }
      }
    } catch (e) {
      console.error("Failed to load workbook:", e);
    }
  })();

  return () => {
    cancelled = true;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [workbookFile, workbookUrl, multiSheetData, columns, defaultSheetName]);
  // Outlier map
  const outlierCellMap = useMemo(() => {
    const map = {};
    outlierCells.forEach(({ row, column }) => {
      if (!map[row]) map[row] = {};
      map[row][column] = true;
    });
    return map;
  }, [outlierCells]);

  // Map of refs for each column filter (reserved for Excel-like filter UIs)
  const filterRefs = useRef({});

  // Row number column (Excel-style)
  const rowNumberColDef = useMemo(
    () => ({
      headerName: "#",
      valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
      width: 50,
      maxWidth: 60,
      pinned: "left",
      sortable: false,
      filter: false,
      editable: false,
      suppressMenu: true,
      headerClass: "custom-header",
      cellClass: "ag-row-number-cell",
    }),
    []
  );

  // Column definitions for the active sheet
  const columnDefs = useMemo(() => {
      const cols = (activeSheet?.columns || []).map((col) => ({
        headerName: col,
        field: col,
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        headerClass: "custom-header",
        cellStyle: (params) => {
          const dfRowIndex = params.rowIndex - HEADER_ROWS;
          const isOutlier = selectedOption === "handle_outliers" && outlierCellMap?.[dfRowIndex]?.[col];
          const isDuplicate = selectedOption === "remove_duplicates" && duplicateIndices.includes(dfRowIndex);
          const isMatchingText = findText && String(params.value).toLowerCase().includes(findText.toLowerCase());

          return {
            backgroundColor: isOutlier
              ? "#865b56ff"
              : isDuplicate
              ? "#b19539ff"
              : isMatchingText
              ? "#ffeb3b" // Highlight color (yellow)
              : "white",
            color: isOutlier ? "red" : "black",
            borderRight: "1px solid #ccc",
            borderBottom: "1px solid #ccc",
          };
        },
        cellRenderer: (params) => {
          if (!findText || typeof params.value !== "string") return params.value;

          // Create a regular expression for finding the text (case-insensitive)
          const regex = new RegExp(findText, "gi");

          // Wrap the matching text in a <span> with a custom class
          const highlightedText = params.value.replace(
            regex,
            (match) => `<span style="background-color: yellow; font-weight: bold;">${match}</span>`
          );

          return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
        },
      }));

      const defs = [rowNumberColDef, ...cols];

      if (selectedOption === "remove_duplicates") {
        defs.splice(1, 0, {
          headerName: "Remove?",
          field: "__remove__",
          width: 100,
          checkboxSelection: true,
          headerCheckboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          headerClass: "custom-header",
          sortable: false,
          filter: false,
          editable: false,
          suppressMenu: true,
          pinned: "left",
        });
      }

      return defs;
    }, [activeSheet, outlierCellMap, duplicateIndices, selectedOption, rowNumberColDef, findText]);


  useEffect(() => {
  if (activeSheet?.name) {
    sessionStorage.setItem("activesheetname", activeSheet.name);
  }
}, [activeSheet?.name]);

  // Cell edits apply to active sheet only
  const onCellValueChanged = useCallback(
  (params) => {
    const { rowIndex, colDef, newValue } = params;
    setSheets((prev) => {
      const updated = prev.map((s, i) => {
        if (i !== activeSheetIndex) return s;
        const newData = [...s.data];
        newData[rowIndex] = { ...newData[rowIndex], [colDef.field]: newValue };
        return { ...s, data: newData };
      });
      return updated;
    });

    // Also propagate to parent if needed
    if (setData) {
      const active = sheets[activeSheetIndex];
      if (active) setData(active.data);
    }
  },
  [activeSheetIndex, sheets, setData]
);

  // Grid ready
  const onGridReady = (params) => setGridApi(params.api);

  // Add new blank sheet
  const addNewSheet = () => {
    const cols = generateColumnNames();
    const data = [Object.fromEntries(cols.map((c) => [c, ""])), ...generateEmptyRows(cols, 127)];
    const newSheet = { id: Date.now(), name: `Sheet${sheets.length + 1}`, columns: cols, data };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  // Delete sheet
  const deleteSheet = (id) => {
    if (sheets.length === 1) return;
    const idx = sheets.findIndex((s) => s.id === id);
    const filtered = sheets.filter((s) => s.id !== id);
    setSheets(filtered);
    if (idx === activeSheetIndex) setActiveSheetIndex(0);
    else if (idx < activeSheetIndex) setActiveSheetIndex((i) => Math.max(0, i - 1));

    sessionStorage.setItem("activesheetname", nextActive?.name || "");
  };

  // Rename sheet
  const [renamingSheetName, setRenamingSheetName] = useState("");
  const startRename = (sheet) => {
    setRenamingId(sheet.id);
    setRenamingSheetName(sheet.name);
  };
  const handleRenameSubmit = (e, sheet) => {
    e.preventDefault();
    setSheets((prev) => prev.map((s) => (s.id === sheet.id ? { ...s, name: renamingSheetName || s.name } : s)));
    if (sheet.id === sheets[activeSheetIndex]?.id) {
      sessionStorage.setItem("activesheetname", renamingSheetName || sheet.name);
    }
    setRenamingId(null);
  };

  // Find all matches and update the matches list
 const findMatches = useCallback(() => {
  const allMatches = [];
  if (!activeSheet || !findText) {
    setMatches([]);
    setTotalMatches(0);
    return;
  }

  const needle = findText.toLowerCase();

  // start from HEADER_ROWS so we skip the synthetic header row (index 0)
  for (let rowIndex = HEADER_ROWS; rowIndex < activeSheet.data.length; rowIndex++) {
    const row = activeSheet.data[rowIndex];
    activeSheet.columns.forEach((col) => {
      const val = row[col];
      if (typeof val === "string" && val.toLowerCase().includes(needle)) {
        allMatches.push({ rowIndex, col });
      }
    });
  }

  setMatches(allMatches);
  setTotalMatches(allMatches.length);
  // ensure replaceIndex is within bounds
  setReplaceIndex((prev) => (allMatches.length ? Math.min(prev, allMatches.length - 1) : 0));
}, [activeSheet, findText]);


  // Handle Find and Replace All
  const handleFindReplace = () => {
    if (!findText) return;

    // Replace all occurrences of findText with replaceText
    setSheets((prev) => {
      const updated = [...prev];
      const sh = updated[activeSheetIndex];
      const newData = sh.data.map((row) => {
        const r = { ...row };
        sh.columns.forEach((c) => {
          if (typeof r[c] === "string") r[c] = r[c].replace(new RegExp(findText, "gi"), replaceText);
        });
        return r;
      });
      updated[activeSheetIndex] = { ...sh, data: newData };
      return updated;
    });

    // Reset the index after replacing all and recalculate matches
    setReplaceIndex(0);
    findMatches();
  };

  // Handle Replace Next (focus on the next cell that will be replaced)
  const handleReplaceNext = useCallback(() => {
  if (!findText || !matches || matches.length === 0 || !gridApi) return;

  // Current match to operate on
  const match = matches[replaceIndex];
  if (!match) return;

  // Make a shallow copy of data and replace only the matching cell
  const updatedData = activeSheet.data.map((r) => ({ ...r }));
  const cellVal = updatedData[match.rowIndex][match.col];
  if (typeof cellVal === "string") {
    updatedData[match.rowIndex][match.col] = cellVal.replace(new RegExp(findText, "gi"), replaceText);
  }

  // Update the sheets state
  setSheets((prev) => {
    const copy = [...prev];
    copy[activeSheetIndex] = { ...copy[activeSheetIndex], data: updatedData };
    return copy;
  });

  // After update, recalculate matches (so we don't keep pointing at stale matches)
  // Use a small timeout to let state propagate and grid render
  setTimeout(() => {
    findMatches();

    // Determine the next index to move to
    setReplaceIndex((prevIdx) => {
      const next = (prevIdx + 1) % Math.max(1, matches.length);
      return matches.length ? next % matches.length : 0;
    });

    // Scroll / focus into the replaced cell and start edit (if gridApi available)
    try {
      if (gridApi) {
        gridApi.ensureIndexVisible(match.rowIndex);
        // set focus to the replaced cell
        gridApi.setFocusedCell(match.rowIndex, match.col);
        // optionally start editing so user can see the change (comment out if undesired)
        gridApi.startEditingCell({ rowIndex: match.rowIndex, colKey: match.col });
      }
    } catch (err) {
      // defensive: don't let focus errors crash the flow
      console.warn("Could not focus cell:", err);
    }
  }, 120);
}, [findText, replaceText, matches, replaceIndex, activeSheet, activeSheetIndex, gridApi, findMatches]);

  // Run findMatches when findText changes
useEffect(() => {
  if (findText) {
    findMatches();
  } else {
    setTotalMatches(0);
    setMatches([]);
    setReplaceIndex(0);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [findText, activeSheet?.data, findMatches]);

  // Send selections to backend for duplicate removal (active sheet only)
  const confirmAndRemove = (mode) => {
    const msg = mode === "all"
      ? "⚠️ Are you sure you want to remove ALL duplicate rows? This cannot be undone."
      : `⚠️ Are you sure you want to remove ${selectedDuplicates.length} selected duplicate row(s)?`;

    if (!window.confirm(msg)) return;

    fetch("https://dataghurhi.cse.buet.ac.bd:8001/api/remove-duplicates/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userID: localStorage.getItem("user_id"),
        filename: sessionStorage.getItem("file_name"),
      },
      body: JSON.stringify({
        columns, // original DF header names (server determines subset)
        mode,
        selected: selectedDuplicates,
        sheet: sheets[activeSheetIndex]?.name,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const active = sheets[activeSheetIndex];
          const { columns: letters } = active;

          // Rebuild grid rows from server-returned DF rows
          const headerNames = columns; // server works in DF space
          const letterRow = Object.fromEntries(letters.map((L, i) => [L, headerNames?.[i] ?? ""]))
          const bodyRows = (result.rows || []).map((r) => {
            const o = {};
            const keys = Object.keys(r);
            letters.forEach((L, i) => (o[L] = keys[i] ? r[keys[i]] ?? "" : ""));
            return o;
          });
          while (bodyRows.length + 1 < 128) bodyRows.push(Object.fromEntries(letters.map((L) => [L, ""])));
          const rebuilt = [letterRow, ...bodyRows];

          setSheets((prev) => prev.map((s, i) => (i === activeSheetIndex ? { ...s, data: rebuilt } : s)));
          setSelectedDuplicates([]);
          setData?.(rebuilt);
          alert(result.message);
        } else {
          alert(result.error || "Something went wrong.");
        }
      })
      .catch((err) => alert("Error removing duplicates: " + err.message));
  };
  //save edited table

const [showSaveOptions, setShowSaveOptions] = useState(false); 
const [saveAsNew, setSaveAsNew] = useState(false);             
const [newFileName, setNewFileName] = useState(sessionStorage.getItem("file_name") || "edited.xlsx");             


const handleSaveExcel = async (mode , newName = "") => {
  try {
    setShowSaveOptions(false);
    setSaveAsNew(false);

    if (!sheets || !sheets.length) {
      alert("No data to save.");
      return;
    }

    console.log(mode);

    const wb = XLSX.utils.book_new();

    const trimEmptyRows = (rows) => {
      const isRowEmpty = (row) =>
        Object.values(row).every((v) => v === null || v === undefined || v === "");
      let end = rows.length;
      while (end > 0 && isRowEmpty(rows[end - 1])) end--;
      return rows.slice(0, end);
    };

    sheets.forEach((sheet) => {
      if (!sheet.data?.length) return;
      const trimmedData = trimEmptyRows(sheet.data);
      const aoa = trimmedData.map((row) => Object.values(row));
      const lastNonEmptyCol = aoa.reduce((max, row) => {
        const idx = row.map((v) => (v ? 1 : 0)).lastIndexOf(1);
        return Math.max(max, idx);
      }, -1);
      const cleanAoa = aoa.map((row) => row.slice(0, lastNonEmptyCol + 1));
      const ws = XLSX.utils.aoa_to_sheet(cleanAoa);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formData = new FormData();
    const userId = localStorage.getItem("user_id") || "";
    const originalPath = sessionStorage.getItem("fileURL");
    const filename= newFileName;


    if (!filename) {
      alert("Please enter a valid filename.");
      return;
    }

    formData.append("file", file, filename);
    formData.append("user_id", userId);
    formData.append("original_path", originalPath || "");
    formData.append("replace_original", mode === "replace" ? "true" : "false");

<<<<<<< Updated upstream
    const response = await fetch("https://dataghurhi.cse.buet.ac.bd:8001/api/save-edited-excel/", {
=======
    const response = await fetch("http://103.94.135.115:8001/api/save-edited-excel/", {
>>>>>>> Stashed changes
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (response.ok && result.success) {
      alert(
        mode === "replace"
          ? " Excel file replaced successfully!"
          : ` Excel file saved as "${filename}" successfully!`
      );
      setNewFileName("");
    } else {
      alert(result.error || "Failed to save Excel file.");
    }
  } catch (error) {
    console.error("Error saving Excel:", error);
    alert("An error occurred while saving Excel.");
  }
};

const [showRenameModal, setShowRenameModal] = useState(false);






  return (
    <div className={isPreviewModalOpen ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" : ""}>
      <div className={`bg-white p-4 rounded-lg shadow-lg w-full ${isPreviewModalOpen ? "max-w-6xl max-h-[90vh] overflow-auto relative" : ""}`}>
        {isPreviewModalOpen && (
          <button onClick={() => setIsPreviewModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold">✖</button>
        )}

        {!isPreviewModalOpen &&(
<>
           <div className="save-section">
      {/* Buttons Row */}
      <div className="button-group">
        <button className="file-update-btn" >
          <Save size={16} />
          Save Edited
        </button>

        <button
          className="file-save-btn"
          onClick={() => setShowRenameModal(true)}
        >
          <CloudUpload size={16} />
          Save to Cloud
        </button>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Rename and Save</h3>
            <input
              type="text"
              placeholder="Enter new file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-save" onClick={handleSaveExcel}>
                Save
              </button>
              <button
                className="modal-cancel"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

         {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-2">
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
          </div>
          <button
            onClick={handleReplaceNext}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Replace Next
          </button>
          <button
            onClick={handleFindReplace}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Replace All
          </button>


          {/* Display the number of matches */}
          {totalMatches > 0 && (
            <span className="text-sm text-gray-500">
              {`Found ${totalMatches} match${totalMatches > 1 ? "es" : ""}`}
            </span>
          )}          
 </div>
</>
        )}
                  
  


{/* 
  <button
    className="toolbar-btn save-as-btn flex items-center gap-1"
    onClick={() => console.log("clicked save as")}
  >
    <Save size={16} />
    Save As
  </button> */}


        {/* Sheet Tabs */}
        <div className="flex items-center mb-2 border-b overflow-x-auto gap-1 py-1">
          {sheets.map((sheet, idx) => (
            <div key={sheet.id} className="flex items-center">
              {renamingId === sheet.id ? (
                <form onSubmit={(e) => handleRenameSubmit(e, sheet)}>
                  <input value={renamingSheetName} onChange={(e) => setRenamingSheetName(e.target.value)} className="border px-2 py-1 rounded" />
                </form>
              ) : (
                <button
                  className={`px-4 py-2 rounded-t ${idx === activeSheetIndex ? "bg-gray-200 border border-b-0" : "bg-gray-100 border"}`}
                  onClick={() => {
                    setActiveSheetIndex(idx);
                    setData?.(sheets[idx]?.data || []);
                    sessionStorage.setItem("activesheetname", sheet.name);
                  }}
                  onDoubleClick={() => startRename(sheet)}
                  title={sheet.name}
                >
                  {sheet.name}
                </button>
              )}
              <button onClick={() => deleteSheet(sheet.id)} className="text-red-500 px-2">×</button>
            </div>
          ))}
          <button onClick={addNewSheet} className="ml-1 px-3 py-2 bg-green-500 text-white rounded">➕ Add Sheet</button>
        </div>


     


        {/* AG Grid Table */}
        <div className="ag-theme-alpine" style={{ height: "70vh", width: "100%" }}>
          <AgGridReact
  key={activeSheetIndex} // ensures grid refreshes properly when sheet changes
  rowData={[...(sheets[activeSheetIndex]?.data || [])]} // force shallow copy to trigger re-render
  columnDefs={columnDefs}
  rowSelection={selectedOption === "remove_duplicates" ? "multiple" : undefined}
  getRowSelectable={(params) => params.node.rowIndex >= HEADER_ROWS}
  onSelectionChanged={(params) => {
    const dfPositions = params.api
      .getSelectedNodes()
      .map((n) => n.rowIndex - HEADER_ROWS)
      .filter((i) => i >= 0);
    setSelectedDuplicates(dfPositions);
  }}
  animateRows={true}
  onGridReady={(params) => setGridApi(params.api)}
  onCellValueChanged={onCellValueChanged}
  stopEditingWhenCellsLoseFocus={true} // ✅ ensures value is committed on blur
  undoRedoCellEditing={true} // optional: enable undo/redo
  defaultColDef={{
    flex: 1,
    minWidth: 80,
    editable: true,
    resizable: true,
    sortable: true,
    filter: true,
  }}
  suppressCopySingleCellRanges={false}
/>

        </div>
        {selectedOption === "remove_duplicates" && (
          <div className="flex gap-4 mt-3">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={() => confirmAndRemove("all")}>Remove All Duplicates</button>
            <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg" onClick={() => confirmAndRemove("selected")} disabled={selectedDuplicates.length === 0}>Remove Selected ({selectedDuplicates.length})</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTable;
