import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './PreprocessDataPage.css';
import PreviewTable from './previewTable';
import NavbarAcholder from '../ProfileManagement/navbarAccountholder';
import { useLocation } from 'react-router-dom';
import {Files} from "lucide-react";

const PreprocessDataPage = () => {
 
  const [data, setData] = useState([]);
  const filename = sessionStorage.getItem('file_name') || 'latest_uploaded.xlsx';
  const [columns, setColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [userId, setUserId] = useState(null);
  const location = useLocation();
  const [columnsToDelete, setColumnsToDelete] = useState([]);
  const [duplicateColumns, setDuplicateColumns] = useState([]);
  const [missingColumn, setMissingColumn] = useState('');
  const [missingMethod, setMissingMethod] = useState('');
  const [missingSpec, setMissingSpec] = useState('');
  const [missingValues, setMissingValues] = useState({});
  const [outlierColumn, setOutlierColumn] = useState('');
  const [outlierMethod, setOutlierMethod] = useState('');
  const [numericColumns, setNumericColumns] = useState([]);
  const [outliersSummary, setOutliersSummary] = useState({});
  const [outlierCells, setOutlierCells] = useState([]);
  const [rankColumn, setRankColumn] = useState('');
  const [rankMapping, setRankMapping] = useState({});
  const [splitTargetColumn, setSplitTargetColumn] = useState('');
  const [splitMethod, setSplitMethod] = useState('');
  const [customPhraseInput, setCustomPhraseInput] = useState('');
  const [customPhrases, setCustomPhrases] = useState([]);
  const [groupCategoricalCol, setGroupCategoricalCol] = useState('');
  const [groupNumericalCol, setGroupNumericalCol] = useState('');
  const [groupingPairs, setGroupingPairs] = useState([]);
  const [duplicateIndices, setDuplicateIndices] = useState([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const [panelStyle, setPanelStyle] = useState({ top: 0, right: 0, width: 380 });
  const panelRef = useRef(null);
  const draggingRef = useRef(null);
  const resizingRef = useRef(null);

  // Language
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "English");
  useEffect(() => localStorage.setItem("language", language), [language]);


  const uniqueCategoriesForRank = useMemo(() => {
    if (!rankColumn || data.length === 0) return [];
    // guard for differing key names
    return [...new Set(data.map(r => r[rankColumn]).filter(v => v !== undefined && v !== null))];
  }, [rankColumn, data]);

  const totalMissingCount = useMemo(() => {
    return Object.values(missingValues || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  }, [missingValues]);

  const totalOutliersCount = useMemo(() => {
    return Object.values(outliersSummary || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  }, [outliersSummary]);

  const totalDuplicateCount = useMemo(() => duplicateIndices.length, [duplicateIndices]);

 
  useEffect(() => {
    if (location.state?.userId) setUserId(location.state.userId);
  }, [location.state]);

  useEffect(() => {
    if (!userId) return;
    fetch('http://127.0.0.1:8000/api/preview-data/', {
      method: 'GET',
      headers: {
        'userID': userId,
        'filename': filename,
        'sheet': sessionStorage.getItem("activesheetname") || '',
        'Fileurl': sessionStorage.getItem("fileURL") || ''
      }
    })
      .then(r => r.json())
      .then(res => {
        setColumns(res.columns || []);
        setAvailableColumns(res.columns || []);
        setData(res.rows || []);
        setMissingValues(res.missing_values || {});
      })
      .catch(err => console.error("Preview fetch error:", err));
  }, [userId, sessionStorage.getItem("activesheetname")]);

  // Fetch outlier summary lazily when option selected
  useEffect(() => {
    if (selectedOption !== 'handle_outliers') return;
    fetch('http://127.0.0.1:8000/api/outliers-summary/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': userId,
        'filename': filename,
        'sheet': sessionStorage.getItem("activesheetname") || '',
        'Fileurl': sessionStorage.getItem("fileURL") || ''
      }
    })
      .then(r => r.json())
      .then(s => {
        if (s.success) {
          setNumericColumns(s.numeric_columns || []);
          setOutliersSummary(s.outliers_summary || {});
          setOutlierCells(s.outlier_cells || []);
        }
      })
      .catch(err => console.warn("Outlier summary error:", err));
  }, [selectedOption, userId]);

  //downloads
  const downloadAsExcel = useCallback((payload, fname) => {
    const worksheet = XLSX.utils.json_to_sheet(payload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, 'preprocessed_' + fname);
  }, []);

  const downloadAsPDF = useCallback((payload, fname = 'data.pdf') => {
    const doc = new jsPDF();
    if (!payload.length) doc.text('No data', 10, 10);
    else {
      const cols = Object.keys(payload[0]);
      const rows = payload.map(r => cols.map(c => r[c]));
      autoTable(doc, { head: [cols], body: rows });
    }
    doc.save(fname);
  }, []);

  // Panel drag/resizing handlers 
  useEffect(() => {
    function onMouseMove(e) {
      if (draggingRef.current) {
        const { startTop, startY } = draggingRef.current;
        const dy = e.clientY - startY;
        setPanelStyle(prev => ({ ...prev, top: Math.max(0, startTop + dy) }));
      } else if (resizingRef.current) {
        const { startWidth, startX } = resizingRef.current;
        const dx = startX - e.clientX; // dragging left edge outward -> increase width
        const newWidth = Math.min(Math.max(300, startWidth + dx), 900);
        setPanelStyle(prev => ({ ...prev, width: newWidth }));
      }
    }
    function onMouseUp() { draggingRef.current = null; resizingRef.current = null; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    draggingRef.current = { startTop: panelStyle.top, startY: e.clientY };
  };
  const startResize = (e) => {
    e.preventDefault();
    resizingRef.current = { startWidth: panelStyle.width, startX: e.clientX };
  };

  //Unified apply handler
  const handleApply = () => {
    if (!selectedOption) return;
    switch (selectedOption) {
      // delete
      case 'delete_column': {
        if (!columnsToDelete.length) return alert("Select at least one column to delete.");
        fetch('http://127.0.0.1:8000/api/delete-columns/', {
          method: 'POST',
          headers: {
            'userID': userId, 'filename': filename, 'sheet': sessionStorage.getItem("activesheetname") || '',
            'Fileurl': sessionStorage.getItem("fileURL") || '', 'Content-Type': 'application/json'
          },
          body: JSON.stringify({ columns: columnsToDelete })
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []);
              setAvailableColumns(res.columns || []);
              setData(res.rows || []);
              setColumnsToDelete([]);
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      // remove duplicates
      case 'remove_duplicates': {
        fetch('http://127.0.0.1:8000/api/find-duplicates/', {
          method: 'POST',
          headers: {
                        'userID': userId,
                        'filename': filename,
                        'sheet': sessionStorage.getItem("activesheetname") || '',
                        'Fileurl': sessionStorage.getItem("fileURL"),
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ columns: duplicateColumns }),
                    })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              //sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []);
              setAvailableColumns(res.columns || []);
              setData(res.rows || []);
              setDuplicateIndices(res.duplicate_indices || []);
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      // missing values
      case 'handle_missing': {
        if (!missingColumn || !missingMethod) return alert("Select column and method.");
        fetch('http://127.0.0.1:8000/api/handle-missing/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'userID': userId, 'filename': filename,
            'Fileurl': sessionStorage.getItem("fileURL") || '', 'sheet': sessionStorage.getItem("activesheetname") || ''
          },
          body: JSON.stringify({ column: missingColumn, method: missingMethod, missing_spec: missingSpec })
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []); setData(res.rows || []); setAvailableColumns(res.columns || []);
              setIsRightPanelOpen(false);

            } else alert(res.error || "Error");
          });
        break;
      }

      // outliers
      case 'handle_outliers': {
        if (!outlierColumn || !outlierMethod) return alert("Select column & method.");
        fetch('http://127.0.0.1:8000/api/handle-outliers/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'userID': userId, 'Fileurl': sessionStorage.getItem("fileURL") || '',
            'sheet': sessionStorage.getItem("activesheetname") || ''
          },
          body: JSON.stringify({ column: outlierColumn, method: outlierMethod })
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              setColumns(res.columns || []);
              setAvailableColumns(res.columns || []);
              setData(res.rows || []);
              sessionStorage.setItem("fileURL", res.file_url || '');
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      // rank column
      case 'rank_column': {
        if (!rankColumn || !Object.keys(rankMapping).length) return alert("Assign ranks.");
        fetch('http://127.0.0.1:8000/api/rank-column/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'userID': userId, 'filename': filename,
            'Fileurl': sessionStorage.getItem("fileURL") || '', 'sheet': sessionStorage.getItem("activesheetname") || ''
          },
          body: JSON.stringify({ column: rankColumn, mapping: rankMapping })
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []); setAvailableColumns(res.columns || []); setData(res.rows || []);
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      // split column
      case 'split_column': {
        if (!splitTargetColumn || !splitMethod) return alert("Select column & method.");
        if (splitMethod === 'custom' && !customPhrases.length) return alert("Add custom phrases.");
        fetch('http://127.0.0.1:8000/api/split-column/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'userID': userId, 'filename': filename,
            'Fileurl': sessionStorage.getItem("fileURL") || '', 'sheet': sessionStorage.getItem("activesheetname") || ''
          },
          body: JSON.stringify({
            column: splitTargetColumn, method: splitMethod,
            phrases: splitMethod === 'custom' ? customPhrases : [], delete_original: true
          })
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []); setAvailableColumns(res.columns || []); setData(res.rows || []);
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      // grouping
      // case 'grouping': {
      //   if (!groupingPairs.length) return alert("Add at least one group pair.");
      //   fetch('http://127.0.0.1:8000/api/group-data/', {
      //     method: 'POST',
      //     headers: {
      //       'userID': userId, 'filename': filename, 'sheet': sessionStorage.getItem("activesheetname") || '',
      //       'Fileurl': sessionStorage.getItem("fileURL") || '', 'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ groupingPairs })
      //   })
      //     .then(r => r.json())
      //     .then(res => {
      //       if (res.success) {
      //         sessionStorage.setItem("fileURL", res.file_url || '');
      //         alert("Grouped data saved.");
      //         const link = document.createElement('a');
      //         link.href = `http://127.0.0.1:8000${res.download_url}`;
      //         link.setAttribute('download', '');
      //         document.body.appendChild(link);
      //         link.click(); document.body.removeChild(link);
      //         setIsRightPanelOpen(false);
      //       } else alert(res.error || "Error");
      //     });
      //   break;
      // }

      // generate id
      case 'generate_id': {
        fetch('http://127.0.0.1:8000/api/generate-unique-id/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 'userID': userId, 'filename': filename,
            'Fileurl': sessionStorage.getItem("fileURL") || '', 'sheet': sessionStorage.getItem("activesheetname") || ''
          }
        })
          .then(r => r.json())
          .then(res => {
            if (res.success) {
              sessionStorage.setItem("fileURL", res.file_url || '');
              setColumns(res.columns || []); setAvailableColumns(res.columns || []); setData(res.rows || []);
              setIsRightPanelOpen(false);
            } else alert(res.error || "Error");
          });
        break;
      }

      default:
        alert("Unknown option");
    }
  };


  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
        <div  className="preprocess-page">
        {/* TOPBAR: title left, controls right */}
        <div className="topbar">
          <div className="title-left">
            <h1 className="page-title"> 
              <Files  />Data Preprocessing</h1>
            <div className="small-sub">File: {filename}</div>
          </div>

          <div className="topbar-right">
            <label className="select-wrap">

              <select
                className="select-input"
                value={selectedOption}
                onChange={(e) => { setSelectedOption(e.target.value); 
                  
                  if(e.target.value !== "open") {
                
                    setIsRightPanelOpen(true);}
                  }}
              >
                <option value="open">Preprocessing Menu</option>
                <option value="delete_column">Delete Column</option>
                <option value="remove_duplicates">Remove Duplicates</option>
                <option value="handle_missing">Handle Missing</option>
                <option value="handle_outliers">Handle Outliers</option>
                <option value="rank_column">Rank Column</option>
                <option value="split_column">Split Column</option>
                {/* <option value="grouping">Grouping</option> */}
                <option value="generate_id">Generate Unique ID</option>
              </select>
            </label>

            {/* three-dot icon */}
            <button className="icon-btn" onClick={() => setIsPopupOpen(true)} aria-label="menu">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* POPUP */}
        {isPopupOpen && (
          <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="popup-title">Actions</h3>
              <div className="popup-buttons">
                <button className="popup-btn" onClick={() => { if (!data.length) return alert("No data"); downloadAsExcel(data, filename); setIsPopupOpen(false); }}>Download Excel</button>
                <button className="popup-btn" onClick={() => { if (!data.length) return alert("No data"); window.location.href = '/visualization'; setIsPopupOpen(false); }}>Visualize</button>
                <button className="popup-btn" onClick={() => { if (!data.length) return alert("No data"); sessionStorage.setItem("preprocessed", "true"); sessionStorage.setItem("file_name", "preprocess_" + filename); window.location.href = 'http://localhost:5173/?tab=analysis'; setIsPopupOpen(false); }}>Analyze</button>
              </div>
              <button className="popup-close" onClick={() => setIsPopupOpen(false)}>✕</button>
            </div>
          </div>
        )}

        {/* RIGHT PANEL */}
        {isRightPanelOpen && (
          <div
            className="right-panel"
            ref={panelRef}
            style={{ top: panelStyle.top + 'px', right: panelStyle.right + 'px', width: panelStyle.width + 'px' }}
          >
            {/* resize handle on left edge */}
            <div className="resize-handle" onMouseDown={startResize} />

            {/* header: draggable */}
            <div className="right-panel-header" onMouseDown={startDrag} role="banner">
              <div className="panel-header-left">
                <h3 className="right-title">{(selectedOption || 'Option').replace(/_/g, ' ').toUpperCase()}</h3>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="sum-label">Missing</div>
                    <div className="sum-value">{totalMissingCount}</div>
                  </div>
                  <div className="summary-card">
                    <div className="sum-label">Outliers</div>
                    <div className="sum-value">{totalOutliersCount}</div>
                  </div>
                  <div className="summary-card">
                    <div className="sum-label">Duplicates</div>
                    <div className="sum-value">{totalDuplicateCount}</div>
                  </div>
                </div>
              </div>

              <div className="panel-header-right">
                <button className="icon-btn small" onClick={() => { setIsRightPanelOpen(false); }}>
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>

            {/* panel body with accordions (collapsible) */}
            <div className="right-panel-body">
              {/* small helper text */}
              <p className="panel-intro">Configure <strong>{(selectedOption || '').replace(/_/g,' ')}</strong> then click <strong>Apply</strong>.</p>

              {/* Accordion pattern: use details/summary for accessible collapse */}
              <details open className="panel-accordion">
                <summary className="accordion-summary">Configuration</summary>

                {/* Delete Column */}
                {selectedOption === 'delete_column' && (
                  <div className="panel-section">
                    <label className="panel-label">Columns to delete</label>
                    <div className="tags-box">
                      {columnsToDelete.length ? columnsToDelete.map((c, i) => (
                        <span key={i} className="tag-chip">{c}<button className="remove-button" onClick={() => setColumnsToDelete(prev => prev.filter(x => x !== c))}>×</button></span>
                      )) : <div className="placeholder-text">No selection</div>}
                    </div>
                    <select className="select-full" onChange={(e) => { const v = e.target.value; if (v && !columnsToDelete.includes(v)) setColumnsToDelete(prev => [...prev, v]); e.target.selectedIndex = 0; }}>
                      <option value="">Select column...</option>
                      {availableColumns.filter(c => !columnsToDelete.includes(c)).map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Remove duplicates */}
                {selectedOption === 'remove_duplicates' && (
                  <div className="panel-section">
                    <label className="panel-label">Columns to check duplicates</label>
                    <div className="tags-box">{duplicateColumns.length ? duplicateColumns.join(', ') : <div className="placeholder-text">No selection</div>}</div>
                    <select className="select-full" onChange={(e) => { const v = e.target.value; if (v && !duplicateColumns.includes(v)) setDuplicateColumns(prev => [...prev, v]); e.target.selectedIndex = 0; }}>
                      <option value="">Select column...</option>
                      {availableColumns.filter(c => !duplicateColumns.includes(c)).map((c, i) => <option key={i}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Handle missing */}
                {selectedOption === 'handle_missing' && (
                  <div className="panel-section">
                    <label className="panel-label">Target column</label>
                    <select className="select-full" value={missingColumn} onChange={(e) => setMissingColumn(e.target.value)}>
                      <option value="">Select...</option>
                      <option value="all">All Columns</option>
                      {Object.entries(missingValues).map(([k, v], i) => <option key={i} value={k}>{k} ({v})</option>)}
                    </select>

                    <label className="panel-label">Method</label>
                    <select className="select-full" value={missingMethod} onChange={(e) => setMissingMethod(e.target.value)}>
                      <option value="">Select method...</option>
                      <option value="drop">Drop missing rows</option>
                      <option value="fill_mean">Fill mean</option>
                      <option value="fill_median">Fill median</option>
                      <option value="fill_mode">Fill mode (Use It for Categorical Values) </option>
                    </select>

                    <label className="panel-label">Missing marker (optional)</label>
                    <input className="text-input" placeholder="e.g., -, N/A" value={missingSpec} onChange={(e) => setMissingSpec(e.target.value)} />
                  </div>
                )}

                {/* Outliers */}
                {selectedOption === 'handle_outliers' && (
                  <div className="panel-section">
                    <label className="panel-label">Numeric column</label>
                    <select className="select-full" value={outlierColumn} onChange={(e) => setOutlierColumn(e.target.value)}>
                      <option value="">Select...</option>
                      {numericColumns.map((n, i) => <option key={i} value={n}>{n} (Outliers: {outliersSummary[n] || 0})</option>)}
                    </select>

                    <label className="panel-label">Method</label>
                    <select className="select-full" value={outlierMethod} onChange={(e) => setOutlierMethod(e.target.value)}>
                      <option value="">Select...</option>
                      <option value="remove">Remove</option>
                      <option value="cap">Cap</option>
                    </select>
                  </div>
                )}

                {/* Rank column */}
                {selectedOption === 'rank_column' && (
                  <div className="panel-section">
                    <label className="panel-label">Column</label>
                    <select className="select-full" value={rankColumn} onChange={(e) => { setRankColumn(e.target.value); setRankMapping({}); }}>
                      <option value="">Select...</option>
                      {availableColumns.map((c,i) => <option key={i} value={c}>{c}</option>)}
                    </select>

                    {rankColumn && (
                      <>
                        <p className="panel-info">Assign numeric rank for each category</p>
                        {uniqueCategoriesForRank.length ? uniqueCategoriesForRank.map((v, i) => (
                          <div className="inline-row" key={i}>
                            <div className="cat-value">{String(v)}</div>
                            <input className="small-number" type="number" value={rankMapping[v] ?? ''} onChange={(e) => {
                              const t = e.target.value;
                              setRankMapping(prev => { const copy = { ...prev }; if (t === '') delete copy[v]; else copy[v] = Number(t); return copy; });
                            }} />
                          </div>
                        )) : <div className="placeholder-text">No categories detected</div>}
                      </>
                    )}
                  </div>
                )}

                {/* Split */}
                {selectedOption === 'split_column' && (
                  <div className="panel-section">
                    <label className="panel-label">Target column</label>
                    <select className="select-full" value={splitTargetColumn} onChange={(e) => setSplitTargetColumn(e.target.value)}>
                      <option value="">Select...</option>
                      {availableColumns.map((c,i) => <option key={i} value={c}>{c}</option>)}
                    </select>

                    <label className="panel-label">Method</label>
                    <select className="select-full" value={splitMethod} onChange={(e) => { setSplitMethod(e.target.value); setCustomPhrases([]); setCustomPhraseInput(''); }}>
                      <option value="">Select...</option>
                      <option value="comma">Comma separated</option>
                      <option value="semicolon">Semicolon separated</option>
                      <option value="tags">&lt;&gt; tag separated</option>
                      <option value="custom">Custom phrase</option>
                    </select>

                    {splitMethod === 'custom' && (
                      <>
                        <label className="panel-label">Custom phrase</label>
                        <div className="inline-row">
                          <input className="text-input" value={customPhraseInput} onChange={(e) => setCustomPhraseInput(e.target.value)} />
                          <button className="btn-secondary" onClick={() => { const t = customPhraseInput.trim(); if (t && !customPhrases.includes(t)) { setCustomPhrases(prev => [...prev, t]); setCustomPhraseInput(''); } }}>Add</button>
                        </div>
                        <div className="panel-info">{customPhrases.length ? 'Added: ' + customPhrases.join(', ') : 'No phrases yet'}</div>
                      </>
                    )}
                  </div>
                )}

                {/* Grouping */}
                {/* {selectedOption === 'grouping' && (
                  <div className="panel-section">
                    <label className="panel-label">Categorical (group by)</label>
                    <select className="select-full" value={groupCategoricalCol} onChange={(e) => setGroupCategoricalCol(e.target.value)}>
                      <option value="">Select...</option>
                      {availableColumns.map((c,i) => <option key={i} value={c}>{c}</option>)}
                    </select>

                    <label className="panel-label">Numeric (analyze)</label>
                    <select className="select-full" value={groupNumericalCol} onChange={(e) => setGroupNumericalCol(e.target.value)}>
                      <option value="">Select...</option>
                      {availableColumns.map((c,i) => <option key={i} value={c}>{c}</option>)}
                    </select>

                    <button className="btn-secondary small" onClick={() => {
                      if (!groupCategoricalCol || !groupNumericalCol) return alert("Select both");
                      setGroupingPairs(prev => [...prev, { group_col: groupCategoricalCol, value_col: groupNumericalCol }]);
                      setGroupCategoricalCol(''); setGroupNumericalCol('');
                    }}>+ Add Pair</button>

                    {groupingPairs.length ? <ul className="group-list">{groupingPairs.map((p,i) => <li key={i}>{p.group_col} → {p.value_col}</li>)}</ul> : <div className="placeholder-text">No pairs yet</div>}
                  </div>
                )} */}

                {/* Generate ID */}
                {selectedOption === 'generate_id' && (
                  <div className="panel-section">
                    <p className="panel-info">This will add a <strong>row_id</strong> column (1..N).</p>
                  </div>
                )}

              </details>
            </div>

            {/* footer: apply & cancel */}
            <div className="right-panel-footer">
              <button className="btn-apply" onClick={handleApply}>Apply</button>
              <button className="btn-cancel" onClick={() => setIsRightPanelOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* PREVIEW TABLE */}
      
        
        <PreviewTable
          workbookUrl={`http://127.0.0.1:8000${sessionStorage.getItem("fileURL")}`}
          columns={columns}
          duplicateIndices={duplicateIndices}
          setData={setData}
          setIsPreviewModalOpen={() => {}}
          isPreviewModalOpen={false}
          outlierCells={outlierCells}
          selectedOption={selectedOption}
        />

        <div className="center-link"><a href="/analysis" className="back-link">← Back</a></div>
      </div>
    
    </>
  );
};

export default PreprocessDataPage;
