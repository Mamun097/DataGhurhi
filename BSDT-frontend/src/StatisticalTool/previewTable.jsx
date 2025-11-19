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

   const API_BASE = 'http://127.0.0.1:8000/api';
  // ---------- state + refs ----------
  const [sheets, setSheets] = useState([]);
  const sheetsRef = useRef(sheets);
  useEffect(() => {
    sheetsRef.current = sheets;
  }, [sheets]);

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  const gridRef = useRef(null);
  const gridApiRef = useRef(null);
  const columnApiRef = useRef(null);

  const [selectedColumns, setSelectedColumns] = useState([]);

  const [showFindPanel, setShowFindPanel] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchWhole, setMatchWhole] = useState(false);
  const [matches, setMatches] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFileName, setNewFileName] = useState(
    sessionStorage.getItem("file_name") || "edited.xlsx"
  );

  // context menu + dragging
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
// ---------- header context menu state ----------
const [headerContextMenu, setHeaderContextMenu] = useState({
  visible: false,
  x: 0,
  y: 0,
  colId: null,
});

  // copy / paste cache
  const [copiedRows, setCopiedRows] = useState([]);

  // history for undo/redo (deep snapshots)
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // ---------- helpers ----------
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
        obj[col] = headerRowData && i === 0 ? headerRowData[j] || "" : "";
      });
      return obj;
    });

  // ---------- sheet loader ----------
  useEffect(() => {
    const loadWorkbook = async () => {
      try {
        // multi-sheet JSON input
        if (multiSheetData && multiSheetData.length > 0) {
          const processedSheets = multiSheetData.map((sh) => {
            const keys = Object.keys(sh.rows?.[0] || {});
            const cols = generateColumns(Math.max(keys.length, DEFAULT_COLS));
            const headerRow = Object.values(sh.rows?.[0] || {});

            const bodyRows = sh.rows.slice(1).map((r) => {
              const obj = {};
              cols.forEach((col, i) => (obj[col] = r[keys[i]] || ""));
              return obj;
            });

            const data = createEmptyRows(DEFAULT_ROWS, cols, headerRow);
            bodyRows.forEach((r, i) => Object.assign(data[i + 1], r));

            return {
              id: Math.random(),
              name: sh.name,
              columns: cols,
              data,
            };
          });

          setSheets(processedSheets);
          const defaultIdx = processedSheets.findIndex((s) => s.name === defaultSheetName);
          setActiveSheetIndex(defaultIdx === -1 ? 0 : defaultIdx);
          return;
        }

        // URL fetch
        if (workbookUrl) {
          const res = await fetch(workbookUrl);
          const arr = new Uint8Array(await res.arrayBuffer());
          const wb = XLSX.read(arr, { type: "array" });

          const processedSheets = wb.SheetNames.map((name) => {
            const ws = wb.Sheets[name];
            const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const cols = generateColumns(Math.max(aoa[0]?.length || 10, DEFAULT_COLS));
            const headerRow = aoa[0] || [];

            const bodyRows = aoa.slice(1).map((r) => {
              const obj = {};
              cols.forEach((col, i) => (obj[col] = r[i] || ""));
              return obj;
            });

            const data = createEmptyRows(DEFAULT_ROWS, cols, headerRow);
            bodyRows.forEach((r, i) => Object.assign(data[i + 1], r));

            return {
              id: Math.random(),
              name,
              columns: cols,
              data,
            };
          });

          setSheets(processedSheets);
          return;
        }

        // initial direct JSON rows
        if (initialData && initialData.length > 0) {
          const keys = Object.keys(initialData[0]);
          const cols = generateColumns(Math.max(keys.length, DEFAULT_COLS));

          const headerRow = keys;
          const bodyRows = initialData.map((r) => {
            const obj = {};
            cols.forEach((col, i) => (obj[col] = r[keys[i]] || ""));
            return obj;
          });

          const data = createEmptyRows(DEFAULT_ROWS, cols, headerRow);
          bodyRows.forEach((r, i) => Object.assign(data[i + 1], r));

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
  }, [workbookUrl, multiSheetData, initialData, workbookFile, defaultSheetName]);

  // initialize history baseline when sheets load
  useEffect(() => {
    if (sheets && sheets.length > 0 && historyRef.current.length === 0) {
      historyRef.current = [JSON.parse(JSON.stringify(sheets))];
      historyIndexRef.current = 0;
    }
  }, [sheets]);

  // ---------- maps (duplicate/outlier/find) ----------
  const activeSheet = sheets[activeSheetIndex];

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

  useEffect(() => {
    if (gridApiRef.current) gridApiRef.current.refreshCells({ force: true });
  }, [duplicateMap, outlierMap, matches]);

  // ---------- history helpers ----------
  const pushToHistory = useCallback((newSheets) => {
    // snapshot deep
    const snapshot = JSON.parse(JSON.stringify(newSheets));
    // trim forward history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snapshot);
    historyIndexRef.current++;
    sheetsRef.current = snapshot;
    setSheets(snapshot);
  }, []);

  // ---------- grid ready ----------
  const onGridReady = useCallback((params) => {
    gridApiRef.current = params.api;
    columnApiRef.current = params.columnApi;
    // expose api on ref for external access
    gridRef.current = params;
  }, []);

  // ---------- column defs (memoized) ----------
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

    // highlight header when selected -> headerClass returns class name
    headerClass: (params) => (selectedColumns.includes(col) ? "selected-header" : ""),

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
        return matches.some((m) => m.rowIndex === r && m.col === col);
      },
      // NEW: highlight cell when its column is selected
      "selected-col": (p) => {
        return selectedColumns.includes(col);
      },
    },

    cellRenderer: (p) => {
      if (!findText || typeof p.value !== "string") return p.value;
      try {
        const reg = new RegExp(findText, matchCase ? "g" : "gi");
        const html = p.value.replace(reg, (m) => `<span style="background:yellow;font-weight:bold">${m}</span>`);
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return p.value;
      }
    },
  }));

  return [rowNum, ...cols];
}, [activeSheet, duplicateMap, outlierMap, findText, matchCase, matches, selectedColumns]);


  // ---------- cell editing: use transactions to update single row ----------
  const onCellValueChanged = useCallback(
    (params) => {
      const { rowIndex, colDef, newValue } = params;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      // update underlying sheet model shallowly then push transaction to grid
      // create updated object (grid row objects are references in our model)
      const updatedRow = { ...sheet.data[rowIndex], [colDef.field]: newValue };

      // update in-memory sheet data
      const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
      newSheets[activeSheetIndex].data[rowIndex] = updatedRow;

      // apply transaction to grid (update row)
      const api = gridApiRef.current;
      try {
        api.applyTransaction({ update: [updatedRow] });
      } catch (e) {
        // fallback: setRowData
        api.setRowData(newSheets[activeSheetIndex].data);
      }

      // push history snapshot
      pushToHistory(newSheets);
    },
    [activeSheetIndex, pushToHistory]
  );

  // ---------- delete single / multiple rows using transactions ----------
  const deleteSingleRow = useCallback(
    (rowIndex) => {
      if (rowIndex < HEADER_ROWS) return;
      const api = gridApiRef.current;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      const rowObj = sheet.data[rowIndex];
      if (!rowObj) return;

      // create new sheets snapshot
      const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
      const removed = newSheets[activeSheetIndex].data.splice(rowIndex, 1);

      // inform grid via transaction
      if (api) {
        try {
          api.applyTransaction({ remove: removed });
        } catch {
          api.setRowData(newSheets[activeSheetIndex].data);
        }
      }

      pushToHistory(newSheets);
    },
    [activeSheetIndex, pushToHistory]
  );

  const deleteMultipleRows = useCallback(
    (rows) => {
      const api = gridApiRef.current;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      const toRemove = rows.map((r) => sheet.data[r]).filter(Boolean);
      if (!toRemove.length) return;

      const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
      // filter by index set
      const removeSet = new Set(rows);
      newSheets[activeSheetIndex].data = newSheets[activeSheetIndex].data.filter((_, idx) => !removeSet.has(idx));

      if (api) {
        try {
          api.applyTransaction({ remove: toRemove });
        } catch {
          api.setRowData(newSheets[activeSheetIndex].data);
        }
      }

      pushToHistory(newSheets);
    },
    [activeSheetIndex, pushToHistory]
  );

  // ---------- selection handlers (duplicate removal) ----------
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
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
        mode === "all" ? "Remove ALL duplicate rows?" : `Remove ${selectedDuplicates.length} selected duplicates?`
      )
    )
      return;

    fetch(`${API_BASE}/remove-duplicates/`, {
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
        if (!res.success) return alert(res.error || "Failed.");

        const active = sheetsRef.current[activeSheetIndex];
        const letters = active.columns;
        const headerNames = columns;

        const letterRow = Object.fromEntries(letters.map((L, i) => [L, headerNames?.[i] || ""]));
        const body = (res.rows || []).map((r) => {
          const o = {};
          const keys = Object.keys(r);
          letters.forEach((L, i) => (o[L] = keys[i] ? r[keys[i]] : ""));
          return o;
        });

        // pad rows like original code
        while (body.length + 1 < 128) body.push(Object.fromEntries(letters.map((L) => [L, ""])));

        const rebuilt = [letterRow, ...body];
        const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
        newSheets[activeSheetIndex].data = rebuilt;

        // update grid via setRowData because whole sheet replaced
        const api = gridApiRef.current;
        if (api) api.setRowData(rebuilt);

        pushToHistory(newSheets);
        setSelectedDuplicates([]);
        alert(res.message);
      })
      .catch((e) => alert("Error: " + e.message));
  };

  // copy selected rows
  const copySelectedRows = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;

    const selectedNodes = api.getSelectedNodes();
    if (!selectedNodes.length) return alert("Select rows to copy");

    const rowsData = selectedNodes.map((n) => ({ ...n.data }));
    setCopiedRows(rowsData);

    const tsvText = selectedNodes.map((node) => activeSheet.columns.map((col) => node.data[col] ?? "").join("\t")).join("\n");

    navigator.clipboard.writeText(tsvText).catch(() => alert("Clipboard access denied. Please allow permission."));
  }, [activeSheet]);

  // ---------- paste from clipboard into target row using transaction ----------
  const handleClipboardPaste = useCallback(
    async (targetRowIndex = 0) => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) {
          alert("Clipboard is empty or access denied.");
          return;
        }
        const rows = text.trim().split("\n").map((r) => r.split("\t"));

        const newSheets = JSON.parse(JSON.stringify(sheetsRef.current || []));
        if (!newSheets[activeSheetIndex]) {
          alert("No active sheet");
          return;
        }
        const sh = newSheets[activeSheetIndex];
        const api = gridApiRef.current;

        const updatedRows = [];
        const addedRows = [];

        rows.forEach((colsData, offset) => {
          const rowIndex = targetRowIndex + offset;

          if (!sh.data[rowIndex]) {
            // create empty row object with all columns
            const newRow = Object.fromEntries(sh.columns.map((c) => [c, ""]));
            newRow.__rowIdx = rowIndex;
            sh.data[rowIndex] = newRow;
            addedRows.push(sh.data[rowIndex]);
          }

          colsData.forEach((val, colIndex) => {
            if (colIndex < sh.columns.length) {
              sh.data[rowIndex][sh.columns[colIndex]] = val;
            }
          });

          sh.data[rowIndex].__rowIdx = rowIndex;
          updatedRows.push(sh.data[rowIndex]);
        });

        // apply transactions: update existing rows, add new rows if needed
        if (api) {
          try {
            if (updatedRows.length) api.applyTransaction({ update: updatedRows });
            if (addedRows.length) api.applyTransaction({ add: addedRows });
          } catch {
            api.setRowData(sh.data);
          }
        }

        pushToHistory(newSheets);
      } catch (err) {
        alert("Unable to read clipboard. Browser permission required.");
      }
    },
    [activeSheetIndex, pushToHistory]
  );

  // undo / redo using historyRef 
  const getFocusedCellInfo = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return null;
    const f = api.getFocusedCell?.();
    if (!f) return null;
    return {
      rowIndex: f.rowIndex,
      colId: f.column ? f.column.getColId() : f.column,
    };
  }, []);

  const restoreFocus = useCallback((cell) => {
    const api = gridApiRef.current;
    if (!api || !cell) return;
    api.ensureIndexVisible(cell.rowIndex);
    try {
      api.setFocusedCell(cell.rowIndex, cell.colId);
    } catch {
      // ignore
    }
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const focused = getFocusedCellInfo();
    historyIndexRef.current--;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
    sheetsRef.current = snapshot;
    setSheets(snapshot);
    const sheet = snapshot[activeSheetIndex];
    const api = gridApiRef.current;
    if (api && sheet) {
      api.setRowData(sheet.data);
      setTimeout(() => restoreFocus(focused), 10);
    } else {
      setTimeout(() => restoreFocus(focused), 50);
    }
  }, [activeSheetIndex, getFocusedCellInfo, restoreFocus]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const focused = getFocusedCellInfo();
    historyIndexRef.current++;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
    sheetsRef.current = snapshot;
    setSheets(snapshot);
    const sheet = snapshot[activeSheetIndex];
    const api = gridApiRef.current;
    if (api && sheet) {
      api.setRowData(sheet.data);
      setTimeout(() => restoreFocus(focused), 10);
    } else {
      setTimeout(() => restoreFocus(focused), 50);
    }
  }, [activeSheetIndex, getFocusedCellInfo, restoreFocus]);

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (!gridApiRef.current) return;

      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copySelectedRows();
      }
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        const cell = gridApiRef.current.getFocusedCell();
        await handleClipboardPaste(cell ? cell.rowIndex : 0);
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, copySelectedRows, handleClipboardPaste]);

  // ---------- add / rename / delete sheet ----------
  const addNewSheet = useCallback(() => {
    const cols = generateColumns(DEFAULT_COLS);
    const rows = createEmptyRows(DEFAULT_ROWS, cols);

    const newSheet = {
      id: Date.now(),
      name: `Sheet${sheetsRef.current.length + 1}`,
      columns: cols,
      data: rows,
    };

    const updatedSheets = [...sheetsRef.current, newSheet];
    pushToHistory(updatedSheets);
    setActiveSheetIndex(updatedSheets.length - 1);
  }, [pushToHistory]);

  const renameSheet = (index) => {
    const newName = prompt("Enter new sheet name", sheets[index].name);
    if (!newName) return;
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[index].name = newName;
    pushToHistory(newSheets);
  };

  const deleteSheet = (index) => {
    if (sheetsRef.current.length === 1) return alert("Cannot delete the last sheet!");
    if (!window.confirm("Delete this sheet?")) return;
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current)).filter((_, i) => i !== index);
    pushToHistory(newSheets);
    if (activeSheetIndex >= index && activeSheetIndex > 0) {
      setActiveSheetIndex((prev) => prev - 1);
    }
  };

  // ---------- find & replace ----------
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
        if ((matchWhole && compare === needle) || (!matchWhole && compare.includes(needle))) {
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
  }, [findText, matchCase, matchWhole, activeSheet, findMatchesFn]);

  const handleReplaceNext = useCallback(() => {
    if (!matches.length || !activeSheet) return;
    const m = matches[replaceIndex] || matches[0];
    if (!m) return;
    const updated = [...activeSheet.data];
    const old = updated[m.rowIndex][m.col];
    if (typeof old === "string") {
      updated[m.rowIndex][m.col] = old.replace(new RegExp(findText, matchCase ? "g" : "gi"), replaceText);
    }

    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[activeSheetIndex].data = updated;

    // apply transaction update for single row
    const api = gridApiRef.current;
    try {
      api.applyTransaction({ update: [updated[m.rowIndex]] });
    } catch {
      api.setRowData(updated);
    }

    pushToHistory(newSheets);

    setTimeout(() => {
      findMatchesFn();
      setReplaceIndex((i) => (i + 1) % Math.max(matches.length, 1));

      gridApiRef.current?.ensureIndexVisible(m.rowIndex);
      gridApiRef.current?.setFocusedCell(m.rowIndex, m.col);
      gridApiRef.current?.startEditingCell({ rowIndex: m.rowIndex, colKey: m.col });
    }, 100);
  }, [matches, replaceIndex, activeSheet, activeSheetIndex, findText, replaceText, matchCase, findMatchesFn, pushToHistory]);

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

    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[activeSheetIndex].data = updated;

    // full-set (replace) because many rows may change
    const api = gridApiRef.current;
    if (api) api.setRowData(updated);
    pushToHistory(newSheets);

    setTimeout(() => {
      findMatchesFn();
      const first = matches[0];
      if (!first) return;
      api?.ensureIndexVisible(first.rowIndex);
      api?.setFocusedCell(first.rowIndex, first.col);
      api?.startEditingCell({ rowIndex: first.rowIndex, colKey: first.col });
    }, 120);
  };

  // ---------- save / export ----------
  const trimEmptyRows = (rows) => {
    const empty = (row) => Object.values(row).every((v) => v === "" || v == null);
    let end = rows.length;
    while (end > 0 && empty(rows[end - 1])) end--;
    return rows.slice(0, end);
  };

  const saveAsExcel = async () => handleSaveExcel("replace");
  const saveToDrive = () => setShowSaveModal(true);

  const handleSaveExcel = async (mode = "save") => {
    try {
      setShowSaveModal(false);
      if (!sheetsRef.current.length) return alert("No data to save.");

      const wb = XLSX.utils.book_new();
      sheetsRef.current.forEach((sh) => {
        const trimmed = trimEmptyRows(sh.data);
        const aoa = trimmed.map((row) => sh.columns.map((c) => row[c]));
        const lastCol = aoa.reduce((max, r) => {
          let idx = -1;
          for (let i = 0; i < r.length; i++) if (r[i] !== "" && r[i] != null) idx = i;
          return Math.max(max, idx);
        }, -1);
        const clean = aoa.map((r) => r.slice(0, lastCol + 1));
        const ws = XLSX.utils.aoa_to_sheet(clean);
        XLSX.utils.book_append_sheet(wb, ws, sh.name);
      });

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const file = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = mode === "save" ? newFileName : sessionStorage.getItem("file_name") || newFileName;

      const formData = new FormData();
      formData.append("file", file, filename);
      formData.append("user_id", localStorage.getItem("user_id") || "");
      formData.append("original_path", sessionStorage.getItem("fileURL") || "");
      formData.append("replace_original", mode === "replace" ? "true" : "false");

      const res = await fetch(`${API_BASE}/save-edited-excel/`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert(mode === "replace" ? ` "${filename}" updated successfully!` : `Saved as "${filename}" successfully!`);
      } else {
        alert(result.error || "Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };

  // UI handlers 
  const handleSelectColumn = (colId) => {
    setSelectedColumns((prev) => (prev.includes(colId) ? prev : [...prev, colId]));
  };

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

    const updatedSheets = [...sheetsRef.current, newSheet];
    pushToHistory(updatedSheets);
    setActiveSheetIndex(updatedSheets.length - 1);
    setSelectedColumns([]);
  };

  // ---------- context menu handling ----------
  useEffect(() => {
    const hide = () =>
      setContextMenu((prev) => ({
        ...prev,
        visible: false,
      }));
    window.addEventListener("click", hide);
    return () => window.removeEventListener("click", hide);
  }, []);
useEffect(() => {
  const container = document.querySelector(".preview-table-container");

  if (!container) return;

  // capture phase so this runs before React's synthetic handler that prevented default
  const onHeaderContext = (e) => {
    try {
      const headerCell = e.target.closest(".ag-header-cell");
      if (!headerCell) return;

      // prevent default browser menu and stop event propagation
      e.preventDefault();
      e.stopPropagation();

      // ag-grid sets 'col-id' attribute on header cell
      const colId = headerCell.getAttribute("col-id");
      if (!colId) return;

      setHeaderContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        colId,
      });

      // also hide the normal cell context menu if open
      setContextMenu((m) => ({ ...m, visible: false }));
    } catch (err) {
      // ignore
    }
  };

  container.addEventListener("contextmenu", onHeaderContext, { capture: true });

  // hide when clicking anywhere
  const hide = () => setHeaderContextMenu((m) => ({ ...m, visible: false }));
  window.addEventListener("click", hide);

  return () => {
    container.removeEventListener("contextmenu", onHeaderContext, { capture: true });
    window.removeEventListener("click", hide);
  };
}, []);

  const isColumnPinned = (colId) => {
  try {
    const state = columnApiRef.current?.getColumnState?.() || [];
    const c = state.find((s) => s.colId === colId);
    return !!(c && (c.pinned === "left" || c.pinned === "right"));
  } catch {
    return false;
  }
};

const pinColumn = useCallback((colId) => {
  try {
    if (!columnApiRef.current) return;
    const pinned = isColumnPinned(colId);
    // If currently pinned -> unpin, else pin left by default
    columnApiRef.current.setColumnPinned(colId, pinned ? null : "left");
    // refresh visuals
    gridApiRef.current?.refreshHeader?.();
    gridApiRef.current?.refreshCells?.({ force: true });
  } catch (e) {
    console.error("Pin column error:", e);
  } finally {
    // hide header menu after action
    setHeaderContextMenu((m) => ({ ...m, visible: false }));
  }
}, []);

const toggleSelectColumn = useCallback((colId) => {
  setSelectedColumns((prev) => {
    const next = prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId];
    // refresh header and cells to apply classes immediately
    setTimeout(() => {
      gridApiRef.current?.refreshHeader?.();
      gridApiRef.current?.refreshCells?.({ force: true });
    }, 0);
    return next;
  });
  setHeaderContextMenu((m) => ({ ...m, visible: false }));
}, []);


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

        {showSaveModal && (
          <div
            style={{
              position: "fixed",
              left: 500,
              zIndex: 99999,
              background: "white",
              padding: 12,
              width: 400,
              borderRadius: 8,
              boxShadow: "0 5px 20px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#2ab17dff" }}>Save As</div>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.xlsx"
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 8,
                border: " 1px solid #2ab17dff",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button
                onClick={() => handleSaveExcel("save")}
                style={{
                  background: "#2ab17dff",
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

        <button onClick={() => setShowFindPanel(true)}>
          <Search size={16} /> Find and Replace
        </button>
      </div>

      {/* Find & Replace Panel */}
      <div className={`find-panel ${showFindPanel ? "visible" : ""}`}>
        <div className="find-panel-header">
          <span>Find & Replace</span>
          <button className="close-btn" onClick={() => setShowFindPanel(false)}>
            <X size={16} />
          </button>
        </div>

        <label>Find</label>
        <input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} />

        <label>Replace</label>
        <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />

        <div className="checkbox-row">
          <label>
            <input type="checkbox" checked={matchCase} onChange={() => setMatchCase((v) => !v)} />
            Match Case
          </label>

          <label>
            <input type="checkbox" checked={matchWhole} onChange={() => setMatchWhole((v) => !v)} />
            Match Whole Cell
          </label>
        </div>

        <div className="find-actions">
          <button onClick={handleReplaceNext}>Replace Next</button>
          <button onClick={handleReplaceAll}>Replace All</button>
        </div>

        {totalMatches > 0 && <div className="match-count">{totalMatches} matches found</div>}
      </div>

      {/* Sheet Tabs */}
      <div className="sheet-tabs">
        {sheets.map((sh, i) => (
          <div key={sh.id} className="sheet-tab-wrapper">
            <button className={`sheet-tab ${i === activeSheetIndex ? "active" : ""}`} onClick={() => setActiveSheetIndex(i)}>
              {sh.name}
            </button>

            <button className="sheet-icon-btn" onClick={() => renameSheet(i)}>
              <Edit2 size={14} />
            </button>

            <button className="sheet-icon-btn" onClick={() => deleteSheet(i)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button className="sheet-tab add-sheet-btn" onClick={addNewSheet}>
          <Plus size={14} /> Add Sheet
        </button>
      </div>

      {/* Table */}
      <div
        className="preview-table-container ag-theme-alpine"
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
            getRowId={params => params.data.__rowIdx}

            onCellContextMenu={(params) => {
              params.event.preventDefault();
              setContextMenu({
                visible: true,
                rowIndex: params.rowIndex,
                colId: params.column?.colId || null,
              });
              setContextMenuPos({ x: params.event.clientX, y: params.event.clientY });
            }}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={50}
          />
        )}
      </div>

      {/* Duplicate remove buttons */}
      {selectedOption === "remove_duplicates" && (
        <div className="duplicate-actions">
          <button className="remove-btn" onClick={() => confirmAndRemove("all")}>
            Remove All Duplicates
          </button>

          <button className="remove-btn" onClick={() => confirmAndRemove("selected")} disabled={selectedDuplicates.length === 0}>
            Remove Selected ({selectedDuplicates.length})
          </button>
        </div>
      )}

{/* HEADER CONTEXT MENU */}
{headerContextMenu.visible && (
  <div
    className="my-header-context-menu"
    style={{
      position: "fixed",
      top: headerContextMenu.y,
      left: headerContextMenu.x,
      background: "white",
      border: "1px solid #ccc",
      borderRadius: 6,
      zIndex: 200000,
      width: 220,
      boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
      padding: 6,
    }}
    onMouseDown={(e) => e.stopPropagation()}
  >
    <div
      className="my-context-item"
      onClick={() => toggleSelectColumn(headerContextMenu.colId)}
      style={{ padding: "8px 10px" }}
    >
      {selectedColumns.includes(headerContextMenu.colId) ? "Unselect Column" : `Select Column "${headerContextMenu.colId}"`}
    </div>
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

    <div style={{ height: 8 }} />

    {/* <div
      className="my-context-item"
      onClick={() => pinColumn(headerContextMenu.colId)}
      style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}
    >
      {/* Show pin/unpin based on current state */}
      {/* <span style={{ fontSize: 14 }}>{isColumnPinned(headerContextMenu.colId) ? "📌" : "📍"}</span>
      <span>{isColumnPinned(headerContextMenu.colId) ? "Unpin Column" : " Pin Column"}</span>
    </div> */} 
  </div>
)}


      {/* CONTEXT MENU */}
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

          <div>
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
              onClick={async () => {
                await handleClipboardPaste(contextMenu.rowIndex);
                setContextMenu({ visible: false });
              }}
            >
              📥 Paste from Clipboard
            </div>

            <div className="my-context-item" onClick={undo}>
              <i className="bi bi-arrow-counterclockwise"></i> Undo
            </div>

            <div className="my-context-item" onClick={redo}>
              <i className="bi bi-arrow-clockwise"></i> Redo
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
          {gridApiRef.current &&
            gridApiRef.current.getSelectedNodes().length > 1 &&
            (() => {
              const rows = gridApiRef.current
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
