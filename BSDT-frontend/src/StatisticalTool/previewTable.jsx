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
  Copy, 
  ClipboardPaste,
   Undo2,
    Redo2 

} from "lucide-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./previewTable.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);


const HEADER_ROWS = 1;
const DEFAULT_ROWS = 10000; 
const DEFAULT_COLS = 1000; 

// chunk size for streaming rows into the grid
const CHUNK_SIZE = 5000; 

const PreviewTable = ({
  setData,
  columns,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  outlierCells = [],
  selectedOption = "",
  duplicateIndices = [],
  duplicateColumns,
  workbookFile,
  defaultSheetName,
  initialData,
  workbookUrl,
 setWorkbookUrl,
  multiSheetData,
}) => {
  //const API_BASE = "http://127.0.0.1:8000/api";
  const API_BASE = '/api/sa';

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

  // loading progress for chunked loads
  const [loadingProgress, setLoadingProgress] = useState({ loading: false, loaded: 0, total: 0 });

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

  // header context menu state 
  const [headerContextMenu, setHeaderContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    colId: null,
  });

  // copy / paste cache
  const [copiedRows, setCopiedRows] = useState([]);

  // history for undo/redo 
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  //helpers 
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

  // Create minimal rows
  const createMinimalRows = (columns, headerRowData = []) => {
    const headerObj = { __rowIdx: 0 };
    columns.forEach((col, i) => {
      headerObj[col] = headerRowData[i] ?? "";
    });
    return [headerObj];
  };

  // ensure row object exists at index, lazily create
  const ensureRowExists = (sheet, rowIndex) => {
    if (!sheet.data[rowIndex]) {
      const newRow = { __rowIdx: rowIndex };
      sheet.columns.forEach((c) => (newRow[c] = ""));
      sheet.data[rowIndex] = newRow;
    }
    return sheet.data[rowIndex];
  };

 
  const escapeRegExp = (s) => {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };


  const findMatchesInSheet = (sheet, needleText, opts = { matchCase: false, matchWhole: false }) => {
    const results = [];
    if (!sheet || !needleText) return results;
    const needle = opts.matchCase ? needleText : needleText.toLowerCase();
    for (let r = HEADER_ROWS; r < sheet.data.length; r++) {
      const row = sheet.data[r];
      if (!row) continue;
      sheet.columns.forEach((col) => {
        const val = row[col];
        if (typeof val !== "string") return;
        const compare = opts.matchCase ? val : val.toLowerCase();
        if ((opts.matchWhole && compare === needle) || (!opts.matchWhole && compare.includes(needle))) {
          results.push({ rowIndex: r, col });
        }
      });
    }
    return results;
  };

  // CHUNKED LOADER
  // Streams rows into AG-Grid using applyTransaction
  const loadRowsInChunks = useCallback(
    async (api, rows, onProgress) => {
      if (!api || !rows || rows.length === 0) {
        onProgress && onProgress(1, 1);
        return;
      }

      // make a shallow copy so we can slice without side-effects
      const total = rows.length;
      let index = 0;

      // use a macro-task loop (setTimeout) to avoid blocking UI
      return new Promise((resolve) => {
        const step = () => {
          // compute slice
          const end = Math.min(index + CHUNK_SIZE, total);
          const slice = rows.slice(index, end);

          try {
            // Add chunk to grid
            api.applyTransaction({ add: slice });
          } catch (e) {
            // fallback: if transaction failed (older grid states), try setRowData for remaining
            console.warn("applyTransaction failed during chunked load, falling back to setRowData for remainder", e);
            // combine existing rows + remaining slice
            try {
              const existing = api.getModel().rowsToDisplay ? api.getModel().rowsToDisplay : [];
            } catch {}
            api.setRowData(rows);
            onProgress && onProgress(total, total);
            return resolve();
          }

          index = end;
          onProgress && onProgress(index, total);

          if (index < total) {
            // schedule next chunk on next event loop tick
            setTimeout(step, 0);
          } else {
            resolve();
          }
        };

        // Kick off
        setTimeout(step, 0);
      });
    },
    []
  );

  // sheet loader
  useEffect(() => {
    const loadWorkbook = async () => {
      try {
       
        const finalizeAndStream = async (processedSheets, defaultIdx = 0) => {
          setSheets(processedSheets);

      
          const idx = defaultIdx >= 0 && defaultIdx < processedSheets.length ? defaultIdx : 0;
          setActiveSheetIndex(idx);

          historyRef.current = processedSheets.map((sh, i) => ({
            sheetIndex: i,
            data: JSON.parse(JSON.stringify(sh.data)),
          }));
          historyIndexRef.current = historyRef.current.length - 1;

       
          const api = gridApiRef.current;
          if (api && processedSheets[idx]) {
         
            try {
              api.setRowData([]);
            } catch (e) {
            
            }

         
            setLoadingProgress({ loading: true, loaded: 0, total: processedSheets[idx].data.length });

            await loadRowsInChunks(api, processedSheets[idx].data, (loaded, total) => {
              setLoadingProgress({ loading: true, loaded, total });
            });

           
            setLoadingProgress({ loading: false, loaded: processedSheets[idx].data.length, total: processedSheets[idx].data.length });
          }
        };

        // multi-sheet JSON input
        if (multiSheetData && multiSheetData.length > 0) {
          const processedSheets = multiSheetData.map((sh) => {
            const firstRow = sh.rows?.[0] || {};
            const keys = Object.keys(firstRow);
        
            const cols = generateColumns(Math.max(keys.length, 1)+10);
            const headerRow = Object.values(firstRow || []);

            const bodyRows = (sh.rows || []).slice(1).map((r, idx) => {
              const obj = { __rowIdx: idx + 1 };
              cols.forEach((col, i) => (obj[col] = r[keys[i]] ?? ""));
              return obj;
            });

            const data = createMinimalRows(cols, headerRow);
            bodyRows.forEach((r) => data.push(r));

            return {
              id: Math.random(),
              name: sh.name || `Sheet${Math.random().toString(36).slice(2, 7)}`,
              columns: cols,
              data,
            };
          });

          const defaultIdx = processedSheets.findIndex((s) => s.name === defaultSheetName);
          await finalizeAndStream(processedSheets, defaultIdx === -1 ? 0 : defaultIdx);
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
            const headerRow = aoa[0] || [];
            const cols = generateColumns(Math.max(headerRow.length, 1)+10);

            const bodyRows = aoa.slice(1).map((r, idx) => {
              const obj = { __rowIdx: idx + 1 };
              cols.forEach((col, i) => (obj[col] = r[i] ?? ""));
              return obj;
            });

            const data = createMinimalRows(cols, headerRow);
            bodyRows.forEach((r) => data.push(r));

            return {
              id: Math.random(),
              name,
              columns: cols,
              data,
            };
          });

          await finalizeAndStream(processedSheets, 0);
          return;
        }

        // initial direct JSON rows
        if (initialData && initialData.length > 0) {
          const firstObj = initialData[0];
          const keys = Object.keys(firstObj);
          const cols = generateColumns(Math.max(keys.length, 1)+10 ); // add extra cols
          const headerRow = keys;

          const bodyRows = initialData.map((r, idx) => {
            const obj = { __rowIdx: idx + 1 };
            cols.forEach((col, i) => (obj[col] = r[keys[i]] ?? ""));
            return obj;
          });

          const data = createMinimalRows(cols, headerRow);
          bodyRows.forEach((r) => data.push(r));

          const sheet = {
            id: Date.now(),
            name: "Sheet1",
            columns: cols,
            data,
          };

          await finalizeAndStream([sheet], 0);
        }
      } catch (err) {
        console.error("Workbook load error:", err);
        setLoadingProgress({ loading: false, loaded: 0, total: 0 });
      }
    };

    loadWorkbook();
  
  }, [workbookUrl, multiSheetData, initialData, workbookFile, defaultSheetName, columns]);
const ensureBlankRowsAtEnd = (sheet, count = 10) => {
  if (!sheet || !Array.isArray(sheet.data)) return sheet;

  const cols = sheet.columns;
  if (!cols) return sheet;

  // remove header
  const header = sheet.data[0];
  const body = sheet.data.slice(1);

  // count trailing blanks
  let trailing = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    const row = body[i];
    const empty = cols.every((c) => row[c] === "" || row[c] == null);
    if (empty) trailing++;
    else break;
  }

  const need = Math.max(0, count - trailing);

  for (let i = 0; i < need; i++) {
    const newRow = { __rowIdx: body.length + 1 + i };
    cols.forEach((c) => (newRow[c] = ""));
    body.push(newRow);
  }

  // rebuild data with correct indexes
  sheet.data = [
    { ...header, __rowIdx: 0 },
    ...body.map((r, i) => ({ __rowIdx: i + 1, ...r })),
  ];

  return sheet;
};
useEffect(() => {
  const active = sheetsRef.current[activeSheetIndex];
  if (!active) return;

  // fix padding
  const clone = { ...active, data: [...active.data] };
  ensureBlankRowsAtEnd(clone, 10);

  // if changed, update sheet + grid
  if (clone.data.length !== active.data.length) {
    const newSheets = [...sheetsRef.current];
    newSheets[activeSheetIndex] = clone;
    sheetsRef.current = newSheets;
    setSheets(newSheets);

    const api = gridApiRef.current;
    if (api?.setRowData) api.setRowData(clone.data);
  }
}, [sheets, activeSheetIndex]);

  
  const pushToHistory = useCallback(
    (sheetIndex) => {
  
      const sheet = sheetsRef.current[sheetIndex];
      if (!sheet) return;

      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({
        sheetIndex,
        data: JSON.parse(JSON.stringify(sheet.data)),
      });
      historyIndexRef.current++;
    },
    []
  );


  const onGridReady = useCallback((params) => {
    gridApiRef.current = params.api;
    columnApiRef.current = params.columnApi;
    gridRef.current = params;
  }, []);

  //column defs
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
        "selected-col": (p) => {
          return selectedColumns.includes(col);
        },
      },

      cellRenderer: (p) => {
        if (!findText || typeof p.value !== "string") return p.value;
        try {
          const reg = new RegExp(findText, matchCase ? "g" : "gi");
          const html = p.value.replace(
            reg,
            (m) => `<span style="background:yellow;font-weight:bold">${m}</span>`
          );
          return <span dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return p.value;
        }
      },
    }));

    return [rowNum, ...cols];
  }, [activeSheet, duplicateMap, outlierMap, findText, matchCase, matches, selectedColumns]);

  //cell editing
  const onCellValueChanged = useCallback(
    (params) => {
      const { rowIndex, colDef, newValue } = params;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      ensureRowExists(sheet, rowIndex);

      sheet.data[rowIndex] = { ...sheet.data[rowIndex], [colDef.field]: newValue, __rowIdx: rowIndex };

     
      const api = gridApiRef.current;
      try {
        api.applyTransaction({ update: [sheet.data[rowIndex]] });
      } catch (e) {
        api.setRowData(sheet.data);
      }

      // push only changed sheet snapshot
      pushToHistory(activeSheetIndex);

      // trigger react state update shallowly 
      setSheets((prev) => {
        const next = [...prev];
        next[activeSheetIndex] = { ...sheet };
        return next;
      });
    },
    [activeSheetIndex, pushToHistory]
  );

  //delete single / multiple rows using transactions
  const deleteSingleRow = useCallback(
    (rowIndex) => {
      if (rowIndex < HEADER_ROWS) return;
      const api = gridApiRef.current;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      if (!sheet.data[rowIndex]) return;

      // remove the row object
      const newData = sheet.data.filter((_, idx) => idx !== rowIndex).map((r, idx) => ({ ...r, __rowIdx: idx }));
      sheet.data = newData;

      if (api) {
        try {
          api.setRowData(newData);
        } catch {
          api.setRowData(newData);
        }
      }

      pushToHistory(activeSheetIndex);
      setSheets((prev) => {
        const next = [...prev];
        next[activeSheetIndex] = { ...sheet };
        return next;
      });
    },
    [activeSheetIndex, pushToHistory]
  );

  const deleteMultipleRows = useCallback(
    (rows) => {
      const api = gridApiRef.current;
      const sheet = sheetsRef.current[activeSheetIndex];
      if (!sheet) return;

      const removeSet = new Set(rows);
      const newData = sheet.data.filter((_, idx) => !removeSet.has(idx)).map((r, idx) => ({ ...r, __rowIdx: idx }));
      sheet.data = newData;

      if (api) {
        try {
          api.setRowData(newData);
        } catch {
          api.setRowData(newData);
        }
      }

      pushToHistory(activeSheetIndex);
      setSheets((prev) => {
        const next = [...prev];
        next[activeSheetIndex] = { ...sheet };
        return next;
      });
    },
    [activeSheetIndex, pushToHistory]
  );

  // duplicate removal
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const onSelectionChanged = (params) => {
    const idxs = params.api
      .getSelectedNodes()
      .map((n) => n.rowIndex - HEADER_ROWS)
      .filter((i) => i >= 0);
    setSelectedDuplicates(idxs);
  };

 
const confirmAndRemove = async (mode) => {
  if (
    !window.confirm(
      mode === "all" ? "Remove ALL duplicate rows?" : `Remove ${selectedDuplicates.length} selected duplicates?`
    )
  )
    return;

  try {
    const res = await fetch(`${API_BASE}/remove-duplicates/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userID: localStorage.getItem("user_id"),

      },
      body: JSON.stringify({
        columns:duplicateColumns,
        mode,
        selected: selectedDuplicates,
         filename: sessionStorage.getItem("file_name"),
        sheet: sheets[activeSheetIndex]?.name,
        Fileurl: sessionStorage.getItem("fileURL"),
      }),
    });

    const json = await res.json();
    sessionStorage.setItem("fileURL", json.file_url);
    setWorkbookUrl(json.file_url);
    if (!json.success) return alert(json.error || "Failed.");

    
    const active = sheetsRef.current[activeSheetIndex];
    const letters = active.columns;
    const headerNames = columns;

    const letterRow = Object.fromEntries(letters.map((L, i) => [L, headerNames?.[i] || ""]));
    const body = (json.rows || []).map((r) => {
      const o = {};
      const keys = Object.keys(r);
      letters.forEach((L, i) => (o[L] = keys[i] ? r[keys[i]] : ""));
      return o;
    });

    while (body.length + 1 < 128) body.push(Object.fromEntries(letters.map((L) => [L, ""])));

    const rebuilt = [
      Object.assign({ __rowIdx: 0 }, letterRow),
      ...body.map((row, idx) => ({ __rowIdx: idx + 1, ...row })),
    ];

    // update in-memory sheets
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[activeSheetIndex].data = rebuilt;
    sheetsRef.current = newSheets;
    setSheets(newSheets);

    // update grid safely:
    const api = gridApiRef.current ?? gridRef.current?.api;

    // prefer setRowData when available 
    if (api && typeof api.setRowData === "function") {
      try {
        api.setRowData(rebuilt);
      } catch (err) {
        console.warn("setRowData failed, falling back to chunked loader", err);
        // fallback to chunked loader below
        if (typeof loadRowsInChunks === "function") {
          await (async () => {
            try {
              api.setRowData([]); // clear first if possible
            } catch {}
            await loadRowsInChunks(api, rebuilt, (loaded, total) => {
              // optionally update small progress state or ignore
            });
          })();
        }
      }
    } else if (api && typeof api.applyTransaction === "function" && typeof loadRowsInChunks === "function") {
    
      try {
       
        try {
          api.setRowData([]);
        } catch {}
        await loadRowsInChunks(api, rebuilt, (loaded, total) => {
        
        });
      } catch (err) {
        console.error("chunked fallback failed:", err);
   
      }
    } else {
     
      console.warn("Grid API not available; updated sheets in memory only.");
    }

    pushToHistory(activeSheetIndex);
    setSelectedDuplicates([]);
    duplicateIndices.length = 0; // clear duplicates
    selectedOption=""; // reset mode
    alert(json.message);

  } catch (e) {
    alert("Error: " + (e.message || e));
  }
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

  // paste from clipboard into target row using transaction
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

          // lazily create row if not exists
          if (!sh.data[rowIndex]) {
            const newRow = { __rowIdx: rowIndex };
            sh.columns.forEach((c) => (newRow[c] = ""));
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

        if (api) {
          try {

            const existingIds = new Set();
            try {
              api.forEachNode((node) => {
                if (node && node.data && node.data.__rowIdx != null) existingIds.add(String(node.data.__rowIdx));
              });
            } catch (e) {
        
            }


            const toUpdate = [];
            const toAddFromUpdated = [];

            updatedRows.forEach((r) => {
              const id = String(r.__rowIdx);
              if (existingIds.has(id)) toUpdate.push(r);
              else toAddFromUpdated.push(r);
            });

        
            const toAdd = [...addedRows, ...toAddFromUpdated];

          
            if (toUpdate.length) {
              api.applyTransaction({ update: toUpdate });
            }
            if (toAdd.length) {
            
              api.applyTransaction({ add: toAdd });
            }
          } catch (err) {
            
            console.warn("Transaction update/add failed, falling back to setRowData:", err);
            try {
              api.setRowData(sh.data);
            } catch (e2) {
        
              console.error("setRowData fallback failed:", e2);
            }
          }
        }


        // push only changed sheet snapshot
        pushToHistory(activeSheetIndex);

        setSheets((prev) => {
          const next = [...prev];
          next[activeSheetIndex] = { ...sh };
          return next;
        });
      } catch (err) {
        alert("Unable to read clipboard. Browser permission required.");
      }
    },
    [activeSheetIndex, pushToHistory]
  );

  // undo / redo using per-sheet historyRef 
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
   
    }
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const focused = getFocusedCellInfo();
    historyIndexRef.current--;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    const { sheetIndex, data } = snapshot;
    // restore only that sheet's data
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[sheetIndex].data = JSON.parse(JSON.stringify(data));
    sheetsRef.current = newSheets;
    setSheets(newSheets);

    const api = gridApiRef.current;
    if (api && newSheets[sheetIndex]) {
      api.setRowData(newSheets[sheetIndex].data);
      setTimeout(() => restoreFocus(focused), 10);
    } else {
      setTimeout(() => restoreFocus(focused), 50);
    }
  }, [getFocusedCellInfo, restoreFocus]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const focused = getFocusedCellInfo();
    historyIndexRef.current++;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    const { sheetIndex, data } = snapshot;
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[sheetIndex].data = JSON.parse(JSON.stringify(data));
    sheetsRef.current = newSheets;
    setSheets(newSheets);

    const api = gridApiRef.current;
    if (api && newSheets[sheetIndex]) {
      api.setRowData(newSheets[sheetIndex].data);
      setTimeout(() => restoreFocus(focused), 10);
    } else {
      setTimeout(() => restoreFocus(focused), 50);
    }
  }, [getFocusedCellInfo, restoreFocus]);

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

  // add / rename / delete sheet 
  const addNewSheet = useCallback(() => {
    // create a small blank sheet with 1 header row
    const cols = generateColumns(10); // default to 10 columns for a new sheet
    const rows = createMinimalRows(cols, []);

    const newSheet = {
      id: Date.now(),
      name: `Sheet${sheetsRef.current.length + 1}`,
      columns: cols,
      data: rows,
    };

    const updatedSheets = [...sheetsRef.current, newSheet];
    setSheets(updatedSheets);
    sheetsRef.current = updatedSheets;
    // push baseline snapshot for this new sheet
    pushToHistory(updatedSheets.length - 1);
    setActiveSheetIndex(updatedSheets.length - 1);
  }, [pushToHistory]);

  const renameSheet = (index) => {
    const newName = prompt("Enter new sheet name", sheets[index].name);
    if (!newName) return;
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
    newSheets[index].name = newName;
    setSheets(newSheets);
    sheetsRef.current = newSheets;
  };

  const deleteSheet = (index) => {
    if (sheetsRef.current.length === 1) return alert("Cannot delete the last sheet!");
    if (!window.confirm("Delete this sheet?")) return;
    const newSheets = JSON.parse(JSON.stringify(sheetsRef.current)).filter((_, i) => i !== index);
    setSheets(newSheets);
    sheetsRef.current = newSheets;
    // adjust active sheet
    if (activeSheetIndex >= index && activeSheetIndex > 0) {
      setActiveSheetIndex((prev) => prev - 1);
    }
    // basic history trim
    historyRef.current = historyRef.current.filter((h) => h.sheetIndex !== index);
    historyIndexRef.current = Math.min(historyIndexRef.current, historyRef.current.length - 1);
  };

  //  find & replace 
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
      if (!row) continue;
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

    const sheet = sheetsRef.current[activeSheetIndex];
    sheet.data = updated;

    // apply transaction update for single row
    const api = gridApiRef.current;
    try {
      api.applyTransaction({ update: [updated[m.rowIndex]] });
    } catch {
      api.setRowData(updated);
    }

    pushToHistory(activeSheetIndex);

    setSheets((prev) => {
      const next = [...prev];
      next[activeSheetIndex] = { ...sheet };
      return next;
    });

    setTimeout(() => {
      findMatchesFn();
      setReplaceIndex((i) => (i + 1) % Math.max(matches.length, 1));

      gridApiRef.current?.ensureIndexVisible(m.rowIndex);
      gridApiRef.current?.setFocusedCell(m.rowIndex, m.col);
      gridApiRef.current?.startEditingCell({ rowIndex: m.rowIndex, colKey: m.col });
    }, 100);
  }, [matches, replaceIndex, activeSheet, activeSheetIndex, findText, replaceText, matchCase, findMatchesFn, pushToHistory]);

  // handleReplaceAll
  const handleReplaceAll = async () => {
    if (!sheetsRef.current.length || !findText.trim()) return;

    try {
   
      const sheet = JSON.parse(JSON.stringify(sheetsRef.current[activeSheetIndex]));
      if (!sheet) return;

      const patternText = matchWhole ? `^${escapeRegExp(findText)}$` : escapeRegExp(findText);
      const flags = matchCase ? "g" : "gi";
      const re = new RegExp(patternText, flags);

    
      const updated = sheet.data.map((row, idx) => {
        if (idx < HEADER_ROWS) return { ...row }; // keep header row intact
        const o = { ...row };
        sheet.columns.forEach((c) => {
          if (typeof o[c] === "string" && findText.length > 0) {
            o[c] = o[c].replace(re, replaceText);
          }
        });
        return o;
      });

      // update in-memory sheet and sheetsRef
      sheet.data = updated;
      const newSheets = JSON.parse(JSON.stringify(sheetsRef.current));
      newSheets[activeSheetIndex] = { ...sheet };
      sheetsRef.current = newSheets;

  
      const api = gridApiRef.current;
      const bodyRows = updated.slice(HEADER_ROWS);
      try {
        if (api) {
       
          api.applyTransaction({ update: bodyRows });
        } else {

        }
      } catch (e) {

        if (api) api.setRowData(updated);
      }

      // push history snapshot and update React state so UI reflects new sheet
      pushToHistory(activeSheetIndex);
      setSheets((prev) => {
        const next = [...prev];
        next[activeSheetIndex] = { ...sheet };
        return next;
      });

   
      const newMatches = findMatchesInSheet(sheet, findText, { matchCase, matchWhole });
      setMatches(newMatches);
      setTotalMatches(newMatches.length);
      setReplaceIndex(0);

      // focus first match if present
      if (newMatches.length > 0 && api) {
        const first = newMatches[0];
        // ensure it's visible and focus cell
        setTimeout(() => {
          try {
            api.ensureIndexVisible(first.rowIndex);
            api.setFocusedCell(first.rowIndex, first.col);
            api.startEditingCell({ rowIndex: first.rowIndex, colKey: first.col });
          } catch {
          
          }
        }, 50);
      }
    } catch (err) {
      console.error("Replace All failed:", err);
      alert("Replace All failed. See console for details.");
    }
  };

  //save / export 
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


  const handleSelectColumn = (colId) => {
    setSelectedColumns((prev) => (prev.includes(colId) ? prev : [...prev, colId]));
  };

  const createSheetFromColumns = () => {
    if (!activeSheet || selectedColumns.length === 0) return;
    const newCols = [...selectedColumns];
    const newData = activeSheet.data.map((row) => {
      const obj = { __rowIdx: row.__rowIdx };
      newCols.forEach((col) => (obj[col] = row[col] ?? ""));
      return obj;
    });

    const newSheet = {
      id: Date.now(),
      name: `Extract_${newCols.join("_")}`,
      columns: newCols,
      data: newData,
    };

    const updatedSheets = [...sheetsRef.current, newSheet];
    setSheets(updatedSheets);
    sheetsRef.current = updatedSheets;
    pushToHistory(updatedSheets.length - 1);
    setActiveSheetIndex(updatedSheets.length - 1);
    setSelectedColumns([]);
  };

  //  context menu handling ----------
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

    const onHeaderContext = (e) => {
      try {
        const headerCell = e.target.closest(".ag-header-cell");
        if (!headerCell) return;
        e.preventDefault();
        e.stopPropagation();
        const colId = headerCell.getAttribute("col-id");
        if (!colId) return;

        setHeaderContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          colId,
        });

        setContextMenu((m) => ({ ...m, visible: false }));
      } catch (err) {
      
      }
    };

    container.addEventListener("contextmenu", onHeaderContext, { capture: true });

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
      columnApiRef.current.setColumnPinned(colId, pinned ? null : "left");
      gridApiRef.current?.refreshHeader?.();
      gridApiRef.current?.refreshCells?.({ force: true });
    } catch (e) {
      console.error("Pin column error:", e);
    } finally {
      setHeaderContextMenu((m) => ({ ...m, visible: false }));
    }
  }, []);

  const toggleSelectColumn = useCallback((colId) => {
    setSelectedColumns((prev) => {
      const next = prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId];
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

        {/* Loading progress UI */}
        {loadingProgress.loading ? (
          <div style={{ marginLeft: 12, fontSize: 13 }}>
            Loading rows: {loadingProgress.loaded} / {loadingProgress.total}
          </div>
        ) : (
          loadingProgress.total > 0 && (
            <div style={{ marginLeft: 12, fontSize: 13, color: "#666" }}>
              Loaded {loadingProgress.total.toLocaleString()} rows
            </div>
          )
        )}
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
      {duplicateIndices.length > 0 && selectedOption === "remove_duplicates" && (
        <div className="duplicate-info-banner">
          Found {duplicateIndices.length} duplicate rows. You can remove duplicates using the buttons below.
        </div>
      )}
    

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
        <div
      className="ag-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft:"auto",
        width: "fit-content",
        gap: 20,
        padding: "6px 12px",
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "6px 6px",
      }}
    >
      <div className="toolbar-item" onClick={copySelectedRows}>
        <Copy size={18} />
        <span>Copy</span>
      </div>

      <div
        className="toolbar-item"
        onClick={() => handleClipboardPaste()}
      >
        <ClipboardPaste size={18} />
        <span>Paste</span>
      </div>

      <div className="toolbar-item" onClick={undo}>
        <Undo2 size={18} />
        <span>Undo</span>
      </div>

      <div className="toolbar-item" onClick={redo}>
        <Redo2 size={18} />
        <span>Redo</span>
      </div>
    </div>
      </div>

      {/* Table */}
      <div
        className="preview-table-container ag-theme-alpine"
        onContextMenu={(e) => e.preventDefault()}
        onPaste={(e) => e.stopPropagation()}
        onCopy={(e) => e.stopPropagation()}
        style={{ height: "60vh", width: "100%" }}
      >
        {activeSheet && (
          <AgGridReact
            ref={gridRef}
            key={activeSheetIndex}
            rowData={activeSheet.data}
            columnDefs={columnDefs}
            deltaRowDataMode={false}
            defaultColDef={{ minWidth: 90, sortable: false }}
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus
            rowSelection="multiple"
            enableRangeSelection
            enableCellTextSelection
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={onSelectionChanged}
            suppressContextMenu={true}
            getRowId={(params) => String(params.data.__rowIdx)}
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
            animateRows={false}
            suppressAnimationFrame={true}
          />
        )}
      </div>

      {/* Duplicate remove buttons */}
      {selectedOption === "remove_duplicates" && duplicateIndices.length > 0 && (
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
              <Copy size={15} /> Copy Selected Row(s)
            </div>

            <div
              className="my-context-item"
              onClick={async () => {
                await handleClipboardPaste(contextMenu.rowIndex);
                setContextMenu({ visible: false });
              }}
            >
              <ClipboardPaste size={15} /> Paste from Clipboard
            </div>

            <div className="my-context-item" onClick={undo}>
              <i className="bi bi-arrow-counterclockwise"></i> Undo
            </div>

            <div className="my-context-item" onClick={redo}>
              <i className="bi bi-arrow-clockwise"></i> Redo
            </div>
          </div>

          <hr style={{ margin: "6px 0", borderTop: "1px dashed #ccc" }} />

          {contextMenu.rowIndex >= HEADER_ROWS && (
            <div
              className="my-context-item"
              onClick={() => {
                deleteSingleRow(contextMenu.rowIndex);
                setContextMenu((m) => ({ ...m, visible: false }));
              }}
            >
              <Trash2 size={15}/> Delete This Row
            </div>
          )}

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
                   <Trash2 size={15}/> Delete {rows.length} Selected Rows
                  </div>
                );
            })()}
        </div>
      )}
    </div>
  );
};

export default PreviewTable;
