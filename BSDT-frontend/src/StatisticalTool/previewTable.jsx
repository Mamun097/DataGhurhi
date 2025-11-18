import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";
import {
  Search,
  X,
  Edit2,
  Trash2,
  Plus,
  Save,
  CloudUpload,
} from "lucide-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./previewTable.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const HEADER_ROWS = 1;
const DEFAULT_ROWS = 10000;
const DEFAULT_COLS = 1000;

const PreviewTable = ({
  setData,
  columns,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  outlierCells = [],
  selectedOption = "",
  duplicateIndices = [],

  workbookFile,
  defaultSheetName,
  initialData,
  workbookUrl,
  multiSheetData,
}) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [gridApi, setGridApi] = useState(null);

  const [selectedColumns, setSelectedColumns] = useState([]);

  const [showFindPanel, setShowFindPanel] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchWhole, setMatchWhole] = useState(false);
  const [matches, setMatches] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  // Save modal bottom-right
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFileName, setNewFileName] = useState(
    sessionStorage.getItem("file_name") || "edited.xlsx"
  );

const gridRef = useRef();
const activeSheet = sheets[activeSheetIndex];
const [columnApi, setColumnApi] = useState(null);

const onGridReady = (params) => {
  setGridApi(params.api);
  setColumnApi(params.columnApi);
};

 //Custom Context Menu State

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    rowIndex: null,
    colId: null,
  });

const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
const dragOffset = useRef({ x: 0, y: 0 });



  // hide menu on outside click
  useEffect(() => {
    const hide = () =>
      setContextMenu((prev) => ({
        ...prev,
        visible: false,
      }));

    window.addEventListener("click", hide);
    return () => window.removeEventListener("click", hide);
  }, []);

  // Helpers
  const getExcelColumnName = (num) => {
    let name = "";
    let n = num;
    do {
      name = String.fromCharCode(65 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return name;
  };

  const generateColumns = (numCols) =>
    Array.from({ length: numCols }, (_, i) => getExcelColumnName(i));

  const createEmptyRows = (numRows, columns, headerRowData = null) =>
    Array.from({ length: numRows }, (_, i) => {
      const obj = { __rowIdx: i };
      columns.forEach((col, j) => {
        obj[col] =
          headerRowData && i === 0 ? headerRowData[j] || "" : "";
      });
      return obj;
    });


  // Column selection helper

  const handleSelectColumn = (colId) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev : [...prev, colId]
    );
  };


  // Create New Sheet From Selected Columns
 
  const createSheetFromColumns = () => {
    if (!activeSheet || selectedColumns.length === 0) return;

    const newCols = [...selectedColumns];
    const newData = activeSheet.data.map((row) => {
      const obj = { __rowIdx: row.__rowIdx };
      newCols.forEach((col) => (obj[col] = row[col]));
      return obj;
    });

    const newSheet = {
      id: Date.now(),
      name: `Extract_${newCols.join("_")}`,
      columns: newCols,
      data: newData,
    };

    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetIndex(sheets.length);
    setSelectedColumns([]);
  };


  // Delete Single/Multiple Rows

  const deleteSingleRow = (rowIndex) => {
    if (rowIndex < HEADER_ROWS) return;

    setSheets((prev) => {
      const updated = [...prev];
      const sh = updated[activeSheetIndex];
      const newData = sh.data.filter((_, i) => i !== rowIndex);
      updated[activeSheetIndex] = { ...sh, data: newData };
      return updated;
    });
  };

  const deleteMultipleRows = (rows) => {
    const removeSet = new Set(rows);

    setSheets((prev) => {
      const updated = [...prev];
      const sh = updated[activeSheetIndex];
      const newData = sh.data.filter(
        (_, idx) => !removeSet.has(idx)
      );
      updated[activeSheetIndex] = { ...sh, data: newData };
      return updated;
    });
  };


  // Load workbook / initial data

  useEffect(() => {
    const loadWorkbook = async () => {
      try {
        // multiple-sheet JSON input
        if (multiSheetData && multiSheetData.length > 0) {
          const processedSheets = multiSheetData.map((sh) => {
            const keys = Object.keys(sh.rows?.[0] || {});
            const cols = generateColumns(
              Math.max(keys.length, DEFAULT_COLS)
            );
            const headerRow = Object.values(sh.rows?.[0] || {});

            const bodyRows = sh.rows.slice(1).map((r) => {
              const obj = {};
              cols.forEach(
                (col, i) => (obj[col] = r[keys[i]] || "")
              );
              return obj;
            });

            const data = createEmptyRows(
              DEFAULT_ROWS,
              cols,
              headerRow
            );
            bodyRows.forEach((r, i) =>
              Object.assign(data[i + 1], r)
            );

            return {
              id: Math.random(),
              name: sh.name,
              columns: cols,
              data,
            };
          });

          setSheets(processedSheets);
          const defaultIdx = processedSheets.findIndex(
            (s) => s.name === defaultSheetName
          );
          setActiveSheetIndex(
            defaultIdx === -1 ? 0 : defaultIdx
          );
          return;
        }

        // URL fetch
        if (workbookUrl) {
          const res = await fetch(workbookUrl);
          const arr = new Uint8Array(
            await res.arrayBuffer()
          );
          const wb = XLSX.read(arr, { type: "array" });

          const processedSheets = wb.SheetNames.map(
            (name) => {
              const ws = wb.Sheets[name];
              const aoa = XLSX.utils.sheet_to_json(ws, {
                header: 1,
              });

              const cols = generateColumns(
                Math.max(aoa[0]?.length || 10, DEFAULT_COLS)
              );
              const headerRow = aoa[0] || [];

              const bodyRows = aoa.slice(1).map((r) => {
                const obj = {};
                cols.forEach(
                  (col, i) =>
                    (obj[col] = r[i] || "")
                );
                return obj;
              });

              const data = createEmptyRows(
                DEFAULT_ROWS,
                cols,
                headerRow
              );
              bodyRows.forEach((r, i) =>
                Object.assign(data[i + 1], r)
              );

              return {
                id: Math.random(),
                name,
                columns: cols,
                data,
              };
            }
          );

          setSheets(processedSheets);
          return;
        }

        // initial direct JSON rows
        if (initialData && initialData.length > 0) {
          const keys = Object.keys(initialData[0]);
          const cols = generateColumns(
            Math.max(keys.length, DEFAULT_COLS)
          );

          const headerRow = keys;
          const bodyRows = initialData.map((r) => {
            const obj = {};
            cols.forEach(
              (col, i) => (obj[col] = r[keys[i]] || "")
            );
            return obj;
          });

          const data = createEmptyRows(
            DEFAULT_ROWS,
            cols,
            headerRow
          );
          bodyRows.forEach((r, i) =>
            Object.assign(data[i + 1], r)
          );

          setSheets([
            {
              id: Date.now(),
              name: "Sheet1",
              columns: cols,
              data,
            },
          ]);
        }
      } catch (err) {
        console.error("Workbook load error:", err);
      }
    };

    loadWorkbook();
  }, [
    workbookUrl,
    multiSheetData,
    initialData,
    workbookFile,
    defaultSheetName,
  ]);

  // Duplicate / Outlier / Match maps

  const duplicateMap = useMemo(() => {
    const map = {};
    if (!activeSheet) return map;

    (duplicateIndices || []).forEach((item) => {
      let r = null;

      if (typeof item === "number") {
        r = item + HEADER_ROWS;
        activeSheet.columns.forEach((col) => {
          map[`${r}-${col}`] = true;
        });
      } else if (item && (item.rowIndex != null || item.row != null)) {
        r = Number(item.rowIndex ?? item.row) + HEADER_ROWS;
        const c = item.col ?? activeSheet.columns[item.colIndex];
        if (c) map[`${r}-${c}`] = true;
        else {
          activeSheet.columns.forEach((col) => {
            map[`${r}-${col}`] = true;
          });
        }
      }
    });
    return map;
  }, [duplicateIndices, activeSheet]);

  const outlierMap = useMemo(() => {
    const map = {};
    if (!activeSheet) return map;

    (outlierCells || []).forEach((item) => {
      const r = Number(item.rowIndex ?? item.row) + HEADER_ROWS;
      const c = item.col ?? item.column;
      if (!Number.isNaN(r) && c) map[`${r}-${c}`] = true;
    });
    return map;
  }, [outlierCells, activeSheet]);

  const matchMap = useMemo(() => {
    const map = {};
    (matches || []).forEach((m) => {
      const r = m.rowIndex + HEADER_ROWS;
      map[`${r}-${m.col}`] = true;
    });
    return map;
  }, [matches]);

  useEffect(() => {
    if (gridApi) gridApi.refreshCells({ force: true });
  }, [gridApi, duplicateMap, outlierMap, matchMap]);

 
  // Add / Rename / Delete Sheet

  const addNewSheet = () => {
    const cols = generateColumns(DEFAULT_COLS);
    const rows = createEmptyRows(DEFAULT_ROWS, cols);

    const newSheet = {
      id: Date.now(),
      name: `Sheet${sheets.length + 1}`,
      columns: cols,
      data: rows,
    };

    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  const renameSheet = (index) => {
    const newName = prompt("Enter new sheet name", sheets[index].name);
    if (!newName) return;

    setSheets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, name: newName } : s))
    );
  };

  const deleteSheet = (index) => {
    if (sheets.length === 1) return alert("Cannot delete the last sheet!");
    if (!window.confirm("Delete this sheet?")) return;

    setSheets((prev) => prev.filter((_, i) => i !== index));

    if (activeSheetIndex >= index && activeSheetIndex > 0)
      setActiveSheetIndex((prev) => prev - 1);
  };

  // Find & Replace

  const findMatchesFn = useCallback(() => {
    if (!activeSheet || !findText.trim()) {
      setMatches([]);
      setTotalMatches(0);
      return;
    }

    const needle = matchCase ? findText : findText.toLowerCase();
    const results = [];

    for (let r = HEADER_ROWS; r < activeSheet.data.length; r++) {
      const row = activeSheet.data[r];

      activeSheet.columns.forEach((col) => {
        const val = row[col];
        if (typeof val !== "string") return;

        const compare = matchCase ? val : val.toLowerCase();
        if (
          (matchWhole && compare === needle) ||
          (!matchWhole && compare.includes(needle))
        ) {
          results.push({ rowIndex: r, col });
        }
      });
    }

    setMatches(results);
    setTotalMatches(results.length);
    setReplaceIndex(0);
  }, [activeSheet, findText, matchCase, matchWhole]);

  useEffect(() => {
    findMatchesFn();
  }, [findText, matchCase, matchWhole, activeSheet]);

  const handleReplaceNext = useCallback(() => {
    if (!matches.length || !activeSheet) return;

    const m = matches[replaceIndex] || matches[0];
    if (!m) return;

    const updated = [...activeSheet.data];
    const old = updated[m.rowIndex][m.col];

    if (typeof old === "string") {
      updated[m.rowIndex][m.col] = old.replace(
        new RegExp(findText, matchCase ? "g" : "gi"),
        replaceText
      );
    }

    setSheets((prev) =>
      prev.map((s, i) =>
        i === activeSheetIndex ? { ...s, data: updated } : s
      )
    );

    setTimeout(() => {
      findMatchesFn();
      setReplaceIndex((i) => (i + 1) % Math.max(matches.length, 1));

      gridApi?.ensureIndexVisible(m.rowIndex);
      gridApi?.setFocusedCell(m.rowIndex, m.col);
      gridApi?.startEditingCell({
        rowIndex: m.rowIndex,
        colKey: m.col,
      });
    }, 100);
  }, [
    matches,
    replaceIndex,
    activeSheet,
    activeSheetIndex,
    findText,
    replaceText,
    matchCase,
    gridApi,
    findMatchesFn,
  ]);

  const handleReplaceAll = () => {
    if (!activeSheet || !findText.trim()) return;

    const updated = activeSheet.data.map((row) => {
      const o = { ...row };
      activeSheet.columns.forEach((c) => {
        if (typeof o[c] === "string") {
          const flags = matchCase ? "g" : "gi";
          const pattern = matchWhole ? `^${findText}$` : findText;
          o[c] = o[c].replace(new RegExp(pattern, flags), replaceText);
        }
      });
      return o;
    });

    setSheets((prev) =>
      prev.map((s, i) =>
        i === activeSheetIndex ? { ...s, data: updated } : s
      )
    );

    setTimeout(() => {
      findMatchesFn();
      const first = matches[0];
      if (!first) return;

      gridApi?.ensureIndexVisible(first.rowIndex);
      gridApi?.setFocusedCell(first.rowIndex, first.col);
      gridApi?.startEditingCell({
        rowIndex: first.rowIndex,
        colKey: first.col,
      });
    }, 120);
  };

  // SAVE / EXPORT

  const trimEmptyRows = (rows) => {
    const empty = (row) =>
      Object.values(row).every(
        (v) => v === "" || v == null
      );
    let end = rows.length;
    while (end > 0 && empty(rows[end - 1])) end--;
    return rows.slice(0, end);
  };

  const saveAsExcel = async () => handleSaveExcel("replace");
  const saveToDrive = () => setShowSaveModal(true);

  const handleSaveExcel = async (mode = "save") => {
    try {
      setShowSaveModal(false);

      if (!sheets.length) return alert("No data to save.");

      const wb = XLSX.utils.book_new();

      sheets.forEach((sh) => {
        const trimmed = trimEmptyRows(sh.data);
        const aoa = trimmed.map((row) =>
          sh.columns.map((c) => row[c])
        );

        const lastCol = aoa.reduce((max, r) => {
          let idx = -1;
          for (let i = 0; i < r.length; i++)
            if (r[i] !== "" && r[i] != null) idx = i;
          return Math.max(max, idx);
        }, -1);

        const clean = aoa.map((r) =>
          r.slice(0, lastCol + 1)
        );

        const ws = XLSX.utils.aoa_to_sheet(clean);
        XLSX.utils.book_append_sheet(wb, ws, sh.name);
      });

      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename =
        mode === "save"
          ? newFileName
          : sessionStorage.getItem("file_name") || newFileName;

      const formData = new FormData();
      formData.append("file", file, filename);
      formData.append(
        "user_id",
        localStorage.getItem("user_id") || ""
      );
      formData.append(
        "original_path",
        sessionStorage.getItem("fileURL") || ""
      );
      formData.append(
        "replace_original",
        mode === "replace" ? "true" : "false"
      );

      const res = await fetch(
        "http://127.0.0.1:8000/api/save-edited-excel/",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();
      if (res.ok && result.success) {
        console.log(result.saved_path);
        
        alert(
          mode === "replace"
            ? ` "${filename}" updated successfully!`
            : `Saved as "${filename}" successfully!`
        );
        console.log(sheets);
      } else {
        alert(result.error || "Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };
 
  // Column Definitions

  const columnDefs = useMemo(() => {
    if (!activeSheet) return [];

    const rowNum = {
      headerName: "#",
      pinned: "left",
      width: 60,
      editable: false,
      valueGetter: (p) => p.node.rowIndex + 1,
    };

    const cols = activeSheet.columns.map((col) => ({
      field: col,
      colId: col,
      headerName: col,
      editable: true,
      resizable: true,

      cellClassRules: {
        "dup-cell": (p) => {
          const r = p.data?.__rowIdx;
          return duplicateMap[`${r}-${col}`];
        },
        "outlier-cell": (p) => {
          const r = p.data?.__rowIdx;
          return outlierMap[`${r}-${col}`];
        },
        "match-cell": (p) => {
          const r = p.data?.__rowIdx;
          return matchMap[`${r}-${col}`];
        },
      },

      cellRenderer: (p) => {
        if (!findText || typeof p.value !== "string")
          return p.value;

        try {
          const reg = new RegExp(
            findText,
            matchCase ? "g" : "gi"
          );
          const html = p.value.replace(
            reg,
            (m) =>
              `<span style="background:yellow;font-weight:bold">${m}</span>`
          );
          return (
            <span
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return p.value;
        }
      },
    }));

    return [rowNum, ...cols];
  }, [
    activeSheet,
    duplicateMap,
    outlierMap,
    matchMap,
    findText,
    matchCase,
  ]);


  // Grid Events

 

  const onCellValueChanged = useCallback(
    (params) => {
      const { rowIndex, colDef, newValue } = params;

      setSheets((prev) =>
        prev.map((s, i) => {
          if (i !== activeSheetIndex) return s;
          const newData = [...s.data];
          newData[rowIndex] = {
            ...newData[rowIndex],
            [colDef.field]: newValue,
          };
          return { ...s, data: newData };
        })
      );

      if (setData) {
        const active = sheets[activeSheetIndex];
        if (active) setData(active.data);
      }
    },
    [activeSheetIndex, sheets, setData]
  );

 
  // Selection (duplicate removal)

  const [selectedDuplicates, setSelectedDuplicates] =
    useState([]);

  const onSelectionChanged = (params) => {
    const idxs = params.api
      .getSelectedNodes()
      .map((n) => n.rowIndex - HEADER_ROWS)
      .filter((i) => i >= 0);
    setSelectedDuplicates(idxs);
  };

  const confirmAndRemove = (mode) => {
    if (
      !window.confirm(
        mode === "all"
          ? "Remove ALL duplicate rows?"
          : `Remove ${selectedDuplicates.length} selected duplicates?`
      )
    )
      return;

    fetch("http://127.0.0.1:8000/api/remove-duplicates/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userID: localStorage.getItem("user_id"),
        filename: sessionStorage.getItem("file_name"),
        sheet: sheets[activeSheetIndex]?.name,
        Fileurl: sessionStorage.getItem("fileURL"),
      },
      body: JSON.stringify({
        columns,
        mode,
        selected: selectedDuplicates,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success)
          return alert(res.error || "Failed.");

        const active = sheets[activeSheetIndex];
        const letters = active.columns;
        const headerNames = columns;

        const letterRow = Object.fromEntries(
          letters.map((L, i) => [
            L,
            headerNames?.[i] || "",
          ])
        );

        const body = (res.rows || []).map((r) => {
          const o = {};
          const keys = Object.keys(r);
          letters.forEach(
            (L, i) => (o[L] = keys[i] ? r[keys[i]] : "")
          );
          return o;
        });

        // pad rows (old behavior)
        while (body.length + 1 < 128)
          body.push(
            Object.fromEntries(
              letters.map((L) => [L, ""])
            )
          );

        const rebuilt = [letterRow, ...body];

        setSheets((prev) =>
          prev.map((s, i) =>
            i === activeSheetIndex
              ? { ...s, data: rebuilt }
              : s
          )
        );

        setSelectedDuplicates([]);
        alert(res.message);
      })
      .catch((e) =>
        alert("Error: " + e.message)
      );
  };
  


// Copy / Paste 

const [copiedRows, setCopiedRows] = useState([]);

// COPY selected rows
const copySelectedRows = () => {
  if (!gridApi) return;

  const selectedNodes = gridApi.getSelectedNodes();
  if (!selectedNodes.length) return alert("Select rows to copy");

  // Copy the actual data
  const rowsData = selectedNodes.map((n) => ({ ...n.data }));
  setCopiedRows(rowsData);

  alert(`Copied ${rowsData.length} row(s)`);
};
const pasteAtRow = (targetRowIndex) => {
  if (!copiedRows.length) {
    alert("Nothing to paste!");
    return;
  }

  setSheets((prev) => {
    const updated = [...prev];
    const sh = updated[activeSheetIndex];

    copiedRows.forEach((rowData, offset) => {
      const rowIndex = targetRowIndex + offset;

      // Expand sheet if needed
      while (sh.data.length <= rowIndex) {
        sh.data.push(Object.fromEntries(sh.columns.map(c => [c, ""])));
      }

      // Copy values for all columns
      sh.columns.forEach((col) => {
        sh.data[rowIndex][col] = rowData[col] ?? "";
      });

      // Make sure __rowIdx is correct
      sh.data[rowIndex].__rowIdx = rowIndex;
    });

    return updated;
  });

  // Refresh grid so changes appear
  setTimeout(() => gridApi.refreshCells({ force: true }), 50);
};

  return (
    <div className="preview-wrapper">
      <h2 className="preview-title">Data Preview</h2>

      {/* Toolbar */}
      <div className="preview-toolbar">
        <button onClick={saveAsExcel}>
          <Save size={16} /> Update Edited
        </button>

        <button onClick={saveToDrive}>
          <CloudUpload size={16} /> Save to Drive
        </button>

        <button onClick={() => setShowFindPanel(true)}>
          <Search size={16} /> Advanced Find
        </button>
      </div>

      {/* Find & Replace Panel */}
      <div
        className={`find-panel ${
          showFindPanel ? "visible" : ""
        }`}
      >
        <div className="find-panel-header">
          <span>Find & Replace</span>
          <button
            className="close-btn"
            onClick={() => setShowFindPanel(false)}
          >
            <X size={16} />
          </button>
        </div>

        <label>Find</label>
        <input
          type="text"
          value={findText}
          onChange={(e) =>
            setFindText(e.target.value)
          }
        />

        <label>Replace</label>
        <input
          type="text"
          value={replaceText}
          onChange={(e) =>
            setReplaceText(e.target.value)
          }
        />

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={matchCase}
              onChange={() =>
                setMatchCase((v) => !v)
              }
            />
            Match Case
          </label>

          <label>
            <input
              type="checkbox"
              checked={matchWhole}
              onChange={() =>
                setMatchWhole((v) => !v)
              }
            />
            Match Whole Cell
          </label>
        </div>

        <div className="find-actions">
          <button onClick={handleReplaceNext}>
            Replace Next
          </button>

          <button onClick={handleReplaceAll}>
            Replace All
          </button>
        </div>

        {totalMatches > 0 && (
          <div className="match-count">
            {totalMatches} matches found
          </div>
        )}
      </div>

      {/* Sheet Tabs */}
      <div className="sheet-tabs">
        {sheets.map((sh, i) => (
          <div
            key={sh.id}
            className="sheet-tab-wrapper"
          >
            <button
              className={`sheet-tab ${
                i === activeSheetIndex
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSheetIndex(i)
              }
            >
              {sh.name}
            </button>

            <button
              className="sheet-icon-btn"
              onClick={() => renameSheet(i)}
            >
              <Edit2 size={14} />
            </button>

            <button
              className="sheet-icon-btn"
              onClick={() => deleteSheet(i)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          className="sheet-tab add-sheet-btn"
          onClick={addNewSheet}
        >
          <Plus size={14} /> Add Sheet
        </button>
      </div>
            {/* Table */}
      <div className="preview-table-container ag-theme-alpine"
      onContextMenu={(e) => e.preventDefault()}
        onPaste={(e) => e.stopPropagation()}   
        onCopy={(e) => e.stopPropagation()}
>
        {activeSheet && (
          <AgGridReact
            ref={gridRef}
            key={activeSheetIndex}
            rowData={activeSheet.data}
            columnDefs={columnDefs}
            defaultColDef={{ minWidth: 90 }}
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus
            rowSelection="multiple"
            enableRangeSelection
            enableCellTextSelection
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={onSelectionChanged}
            suppressContextMenu={true}
            onCellContextMenu={(params) => {
              params.event.preventDefault();
              setContextMenu({
            visible: true,
            rowIndex: params.rowIndex,
            colId: params.column?.colId || null,
          });
          setContextMenuPos({ x: params.event.clientX, y: params.event.clientY });

            }}
          />
        )}
      </div>

      {/* Duplicate remove buttons */}
      {selectedOption === "remove_duplicates" && (
        <div className="duplicate-actions">
          <button onClick={() => confirmAndRemove("all")}>
            Remove All Duplicates
          </button>

          <button
            onClick={() => confirmAndRemove("selected")}
            disabled={selectedDuplicates.length === 0}
          >
            Remove Selected ({selectedDuplicates.length})
          </button>
        </div>
      )}

      {/* SAVE-AS Modal */}
      {showSaveModal && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 99999,
            background: "white",
            padding: 12,
            width: 320,
            borderRadius: 8,
            boxShadow: "0 5px 20px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Save As
          </div>

          <input
            type="text"
            value={newFileName}
            onChange={(e) =>
              setNewFileName(e.target.value)
            }
            placeholder="filename.xlsx"
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 8,
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </button>

            <button
              onClick={() =>
                handleSaveExcel("save")
              }
              style={{
                background: "#2563eb",
                color: "white",
                borderRadius: 4,
                padding: "6px 12px",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM COMMUNITY CONTEXT MENU */}
      {contextMenu.visible && (
        <div
              className="my-context-menu"
              style={{
                position: "fixed",
                top: contextMenuPos.y,
                left: contextMenuPos.x,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 6,
                zIndex: 99999,
                width: 220,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
                dragOffset.current = {
                  x: e.clientX - contextMenuPos.x,
                  y: e.clientY - contextMenuPos.y,
                };
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                setContextMenuPos({
                  x: e.clientX - dragOffset.current.x,
                  y: e.clientY - dragOffset.current.y,
                });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >


          {/* SELECT COLUMN */}
          {contextMenu.colId && (
            <div
              className="my-context-item"
              onClick={() => {
                handleSelectColumn(contextMenu.colId);
                setContextMenu((m) => ({ ...m, visible: false }));
              }}
            >
              Select Column "{contextMenu.colId}"
            </div>
          )}

          {/* CREATE SHEET */}
          {selectedColumns.length > 0 && (
            <div
              className="my-context-item"
              onClick={() => {
                createSheetFromColumns();
                setContextMenu((m) => ({ ...m, visible: false }));
              }}
            >
              Create Sheet from Selected Columns ({selectedColumns.length})
            </div>
          )}
       
        <div >
        {/* COPY Paste ROWS */}
            <div
              className="my-context-item"
              onClick={() => {
                copySelectedRows();
                setContextMenu({ visible: false });
              }}
            >
              📄 Copy Selected Row(s)
            </div>

            <div
              className="my-context-item"
              onClick={() => {
                pasteAtRow(contextMenu.rowIndex);
                setContextMenu({ visible: false });
              }}
            >
              📥 Paste Here
            </div>
          </div>

      

        <hr style={{ margin: "6px 0", borderTop: "1px dashed #ccc" }} />


          {/* DELETE ROW */}
          {contextMenu.rowIndex >= HEADER_ROWS && (
            <div
              className="my-context-item"
              onClick={() => {
                deleteSingleRow(contextMenu.rowIndex);
                setContextMenu((m) => ({ ...m, visible: false }));
              }}
            >
              Delete This Row 
            </div>
          )}

          {/* DELETE SELECTED ROWS */}
          {gridApi &&
            gridApi.getSelectedNodes().length > 1 &&
            (() => {
              const rows = gridApi
                .getSelectedNodes()
                .map((n) => n.rowIndex)
                .filter((i) => i >= HEADER_ROWS);

              if (rows.length > 1)
                return (
                  <div
                    className="my-context-item"
                    onClick={() => {
                      deleteMultipleRows(rows);
                      setContextMenu((m) => ({ ...m, visible: false }));
                    }}
                  >
                    Delete {rows.length} Selected Rows
                  </div>
                );
            })()}
        </div>
      )}
    </div>
  );
};

export default PreviewTable;
