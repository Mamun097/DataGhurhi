import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";

import "ag-grid-community/styles/ag-theme-alpine.css";
import "./previewTable.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const HEADER_ROWS = 1;

const PreviewTable = ({
  initialData,
  setData,
  columns,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  outlierCells = [],
  selectedOption = "",
  duplicateIndices = [],
  workbookFile,
  workbookUrl,
  multiSheetData,
  defaultSheetName,
}) => {
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
    Array.from({ length: numRows }, () =>
      Object.fromEntries(colLetters.map((c) => [c, ""]))
    );

  // Convert array-of-arrays (SheetJS header:1) into our grid rows with a synthetic header row.
  const buildGridDataFromAoA = (aoa) => {
    const letters = generateColumnNames(Math.max(128, aoa?.[0]?.length || 0));
    const headerNames = (aoa?.[0] || []).map((h, i) =>
      h == null || h === "" ? `Column ${i + 1}` : String(h)
    );

    // Row0: put header names under letters (so the first visible row shows labels)
    const letterRow = Object.fromEntries(
      letters.map((L, i) => [L, headerNames[i] ?? ""])
    );

    const bodyRows = (aoa || []).slice(1).map((r) => {
      const o = {};
      letters.forEach((L, i) => (o[L] = r[i] ?? ""));
      return o;
    });

    // pad to 128 total rows (incl. the header letters row)
    while (bodyRows.length + 1 < 128)
      bodyRows.push(Object.fromEntries(letters.map((L) => [L, ""])));
    return { columns: letters, data: [letterRow, ...bodyRows] };
  };

  // If backend gives object rows, keep previous behavior
  const buildGridDataFromObjects = (rows, headerOrder) => {
    const letters = generateColumnNames(
      Math.max(
        128,
        headerOrder?.length || Object.keys(rows?.[0] || {}).length || 0
      )
    );
    const names =
      headerOrder && headerOrder.length
        ? headerOrder
        : Object.keys(rows?.[0] || {}).map((k, i) =>
            rows[0] && k ? k : `Column ${i + 1}`
          );

    const letterRow = Object.fromEntries(
      letters.map((L, i) => [L, names[i] ?? ""])
    );

    const body = (rows || []).map((r) => {
      const o = {};
      letters.forEach((L, i) => {
        const key = names[i];
        o[L] = key ? r[key] ?? "" : "";
      });
      return o;
    });
    while (body.length + 1 < 128)
      body.push(Object.fromEntries(letters.map((L) => [L, ""])));
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
        const aoa = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: true,
          blankrows: false,
        });
        const { columns, data } = buildGridDataFromAoA(aoa);
        return {
          id: `${name}-${Math.random().toString(36).slice(2)}`,
          name,
          columns,
          data,
        };
      });
      return built.length ? built : [];
    };

    (async () => {
      try {
        // Priority 1: explicit multiSheetData from backend
        if (multiSheetData && multiSheetData.length) {
          const built = multiSheetData.map((sh) => {
            const { columns: cols, data } = buildGridDataFromObjects(sh.rows);
            return {
              id: `${sh.name}-${Math.random().toString(36).slice(2)}`,
              name: sh.name,
              columns: cols,
              data,
            };
          });
          if (!cancelled) {
            setSheets(built);
            const idx = Math.max(
              0,
              built.findIndex((s) => s.name === defaultSheetName)
            );
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
          const letterRow = Object.fromEntries(
            letters.map((L, i) => [L, columns?.[i] ?? ""])
          );
          const body = initialData.map((row) => {
            const o = {};
            const keys = Object.keys(initialData[0] || {});
            letters.forEach(
              (L, i) => (o[L] = keys[i] ? row[keys[i]] ?? "" : "")
            );
            return o;
          });
          while (body.length + 1 < 128)
            body.push(Object.fromEntries(letters.map((L) => [L, ""])));
          const single = [
            {
              id: Date.now(),
              name: "Sheet1",
              columns: letters,
              data: [letterRow, ...body],
            },
          ];
          if (!cancelled) {
            setSheets((prev) => (prev.length ? prev : single));
            setActiveSheetIndex((prev) => prev ?? 0);
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
        const isOutlier =
          selectedOption === "handle_outliers" &&
          outlierCellMap?.[dfRowIndex]?.[col];
        const isDuplicate =
          selectedOption === "remove_duplicates" &&
          duplicateIndices.includes(dfRowIndex);
        return {
          backgroundColor: isOutlier
            ? "#865b56ff"
            : isDuplicate
            ? "#b19539ff"
            : "white",
          color: isOutlier ? "red" : "black",
          borderRight: "1px solid #ccc",
          borderBottom: "1px solid #ccc",
        };
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
  }, [
    activeSheet,
    outlierCellMap,
    duplicateIndices,
    selectedOption,
    rowNumberColDef,
  ]);

  useEffect(() => {
    if (activeSheet?.name) {
      sessionStorage.setItem("activesheetname", activeSheet.name);
    }
  }, [activeSheet?.name]);

  // Cell edits apply to active sheet only
  const onCellValueChanged = useCallback(
    (params) => {
      setSheets((prev) =>
        prev.map((s, i) =>
          i === activeSheetIndex
            ? {
                ...s,
                data: s.data.map((row, ridx) =>
                  ridx === params.rowIndex
                    ? { ...row, [params.colDef.field]: params.newValue }
                    : row
                ),
              }
            : s
        )
      );
    },
    [activeSheetIndex]
  );

  // Grid ready
  const onGridReady = (params) => setGridApi(params.api);

  // Add new blank sheet
  const addNewSheet = () => {
    const cols = generateColumnNames();
    const data = [
      Object.fromEntries(cols.map((c) => [c, ""])),
      ...generateEmptyRows(cols, 127),
    ];
    const newSheet = {
      id: Date.now(),
      name: `Sheet${sheets.length + 1}`,
      columns: cols,
      data,
    };
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
    else if (idx < activeSheetIndex)
      setActiveSheetIndex((i) => Math.max(0, i - 1));

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
    setSheets((prev) =>
      prev.map((s) =>
        s.id === sheet.id ? { ...s, name: renamingSheetName || s.name } : s
      )
    );
    if (sheet.id === sheets[activeSheetIndex]?.id) {
      sessionStorage.setItem(
        "activesheetname",
        renamingSheetName || sheet.name
      );
    }
    setRenamingId(null);
  };

  // Find & Replace (active sheet only)
  const handleFindReplace = () => {
    if (!findText) return;
    setSheets((prev) => {
      const updated = [...prev];
      const sh = updated[activeSheetIndex];
      const newData = sh.data.map((row) => {
        const r = { ...row };
        sh.columns.forEach((c) => {
          if (typeof r[c] === "string")
            r[c] = r[c].replace(new RegExp(findText, "gi"), replaceText);
        });
        return r;
      });
      updated[activeSheetIndex] = { ...sh, data: newData };
      setData?.(newData);
      return updated;
    });
  };

  // Send selections to backend for duplicate removal (active sheet only)
  const confirmAndRemove = (mode) => {
    const msg =
      mode === "all"
        ? "⚠️ Are you sure you want to remove ALL duplicate rows? This cannot be undone."
        : `⚠️ Are you sure you want to remove ${selectedDuplicates.length} selected duplicate row(s)?`;

    if (!window.confirm(msg)) return;

    fetch("http://103.94.135.115:8001/api/remove-duplicates/", {
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
          const letterRow = Object.fromEntries(
            letters.map((L, i) => [L, headerNames?.[i] ?? ""])
          );
          const bodyRows = (result.rows || []).map((r) => {
            const o = {};
            const keys = Object.keys(r);
            letters.forEach((L, i) => (o[L] = keys[i] ? r[keys[i]] ?? "" : ""));
            return o;
          });
          while (bodyRows.length + 1 < 128)
            bodyRows.push(Object.fromEntries(letters.map((L) => [L, ""])));
          const rebuilt = [letterRow, ...bodyRows];

          setSheets((prev) =>
            prev.map((s, i) =>
              i === activeSheetIndex ? { ...s, data: rebuilt } : s
            )
          );
          setSelectedDuplicates([]);
          setData?.(rebuilt);
          alert(result.message);
        } else {
          alert(result.error || "Something went wrong.");
        }
      })
      .catch((err) => alert("Error removing duplicates: " + err.message));
  };

  return (
    <div
      className={
        isPreviewModalOpen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          : ""
      }
    >
      <div
        className={`bg-white p-4 rounded-lg shadow-lg w-full ${
          isPreviewModalOpen
            ? "max-w-6xl max-h-[90vh] overflow-auto relative"
            : ""
        }`}
      >
        {isPreviewModalOpen && (
          <button
            onClick={() => setIsPreviewModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
          >
            ✖
          </button>
        )}

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
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Replace
          </button>
          {workbookFile == null && workbookUrl == null && !multiSheetData && (
            <span className="text-xs text-gray-500">
              Tip: pass <code>workbookFile</code>, <code>workbookUrl</code>, or{" "}
              <code>multiSheetData</code> to load multiple tabs.
            </span>
          )}
        </div>

        {/* Sheet Tabs */}
        <div className="flex items-center mb-2 border-b overflow-x-auto gap-1 py-1">
          {sheets.map((sheet, idx) => (
            <div key={sheet.id} className="flex items-center">
              {renamingId === sheet.id ? (
                <form onSubmit={(e) => handleRenameSubmit(e, sheet)}>
                  <input
                    value={renamingSheetName}
                    onChange={(e) => setRenamingSheetName(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                </form>
              ) : (
                <button
                  className={`px-4 py-2 rounded-t ${
                    idx === activeSheetIndex
                      ? "bg-gray-200 border border-b-0"
                      : "bg-gray-100 border"
                  }`}
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
              <button
                onClick={() => deleteSheet(sheet.id)}
                className="text-red-500 px-2"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addNewSheet}
            className="ml-1 px-3 py-2 bg-green-500 text-white rounded"
          >
            ➕ Add Sheet
          </button>
        </div>

        {/* AG Grid Table */}
        <div
          className="ag-theme-alpine"
          style={{ height: "70vh", width: "100%" }}
        >
          <AgGridReact
            rowData={activeSheet?.data || []}
            columnDefs={columnDefs}
            rowSelection={
              selectedOption === "remove_duplicates" ? "multiple" : undefined
            }
            getRowSelectable={(params) => params.node.rowIndex >= HEADER_ROWS}
            onSelectionChanged={(params) => {
              const dfPositions = params.api
                .getSelectedNodes()
                .map((n) => n.rowIndex - HEADER_ROWS) // grid index -> DF index
                .filter((i) => i >= 0);
              setSelectedDuplicates(dfPositions);
            }}
            animateRows={true}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
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
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
              onClick={() => confirmAndRemove("all")}
            >
              Remove All Duplicates
            </button>
            <button
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
              onClick={() => confirmAndRemove("selected")}
              disabled={selectedDuplicates.length === 0}
            >
              Remove Selected ({selectedDuplicates.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTable;
