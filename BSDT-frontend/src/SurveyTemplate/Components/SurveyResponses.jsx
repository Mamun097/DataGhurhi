import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useLocation, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import apiClient from "../../api";
const chartAreaBorder = {
  id: "chartAreaBorder",
  afterDraw(chart, _args, opts) {
    if (!opts || opts.display === false || !chart.chartArea) return;
    const {
      ctx,
      chartArea: { left, top, right, bottom },
    } = chart;
    ctx.save();
    ctx.strokeStyle = opts.color || "#000";
    ctx.lineWidth = opts.width ?? 1.5;
    ctx.setLineDash(Array.isArray(opts.dash) ? opts.dash : []);
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.restore();
  },
};
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels,
  chartAreaBorder
);

ChartJS.defaults.color = "#000";
ChartJS.defaults.borderColor = "#000";

// Translation setup
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang) => {
  if (!GOOGLE_API_KEY) return textArray;
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      { q: textArray, target: targetLang, format: "text" }
    );
    return response.data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    return textArray;
  }
};

const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== "string") {
    return { headers: [], rows: [] };
  }

  try {
    const workbook = XLSX.read(csvText, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!data || data.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = (data[0] || []).map((h) => (h ?? "").toString().trim());

    const rows = data
      .slice(1)
      .map((row) => headers.map((_, colIdx) => (row[colIdx] ?? "").toString()));

    return { headers, rows };
  } catch (err) {
    console.error("Error parsing CSV with XLSX:", err);
    return { headers: [], rows: [] };
  }
};

const SurveyResponses = () => {
  const { survey_id } = useParams();
  const surveyTitle = useLocation().state?.title || "Survey Responses";
  console.log("Survey ID:", survey_id);
  console.log("Survey Title:", surveyTitle);
  const [responses, setResponses] = useState({ headers: [], rows: [] });
  const [rawCsv, setRawCsv] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [currentResponse, setCurrentResponse] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [responseCount, setResponseCount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [translatedLabels, setTranslatedLabels] = useState({});

  const labelsToTranslate = [
    "Survey Responses",
    "Download CSV",
    "Loading responses...",
    "No responses found.",
    "Summary",
    "Questions",
    "Individual",
    "Previous",
    "Next",
  ];

  const getLabel = (label) => translatedLabels[label] || label;

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    const englishMap = {};
    labelsToTranslate.forEach((label) => (englishMap[label] = label));

    const loadTranslations = async () => {
      const langCode = language === "বাংলা" || language === "bn" ? "bn" : "en";
      if (langCode === "en" || !GOOGLE_API_KEY) {
        setTranslatedLabels(englishMap);
      } else {
        const translated = await translateText(labelsToTranslate, langCode);
        const map = {};
        labelsToTranslate.forEach((label, idx) => {
          map[label] = translated[idx];
        });
        setTranslatedLabels(map);
      }
    };
    loadTranslations();
  }, [language]);

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      try {
        const tokenData = localStorage.getItem("token");
        const token = tokenData.startsWith("{")
          ? JSON.parse(tokenData).token
          : tokenData;
        const response = await apiClient.get(`/api/generatecsv/${survey_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (typeof response.data === "string") {
          setRawCsv(response.data);
          setResponses(parseCSV(response.data));
        }
      } catch (error) {
        console.error("Error loading survey responses", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResponses();
  }, [survey_id]);

  useEffect(() => {
    if (!survey_id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found for real-time connection.");
      return;
    }
    const eventSource = new EventSource(
      `/api/surveytemplate/stream/${survey_id}?token=${token}`
    );
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.count !== undefined) {
        setResponseCount(data.count);
      }
      if (data.error) {
        console.error("Stream error:", data.error);
        eventSource.close();
      }
    };
    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, [survey_id]);

  const countResponses = (index) => {
    const counts = {};
    responses.rows.forEach((row) => {
      const answer = row[index] || "Empty";
      counts[answer] = (counts[answer] || 0) + 1;
    });
    return counts;
  };

  function SummaryCharts({ responses, countResponses }) {
    const [titles, setTitles] = useState(() =>
      responses.headers.map((h) => ({ caption: h, x: "Options", y: "Count" }))
    );

    const PRESET_COLORS = [
      "#36A2EB",
      "#FF6384",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#2ECC71",
      "#E67E22",
      "#E74C3C",
      "#95A5A6",
    ];

    const [labelEditorsOpen, setLabelEditorsOpen] = useState(() =>
      responses.headers.map(() => false)
    );
    const toggleLabelEditor = (i) =>
      setLabelEditorsOpen((prev) => {
        const copy = [...prev];
        copy[i] = !copy[i];
        return copy;
      });

    const chartRefs = useRef({});

    const handleTitleChange = (i, field, value) => {
      setTitles((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], [field]: value };
        return copy;
      });
    };

    const safeFileName = (s) =>
      (s || "chart").replace(/[<>:"/\\|?*\x00-\x1F]+/g, "_").slice(0, 80);

    const downloadChartPDF = (i, captionText) => {
      const chart = chartRefs.current[i];
      if (!chart) return;

      const canvas = chart.canvas || chart.ctx?.canvas;
      if (!canvas) return;

      const s = (style && style[i]) || {};
      const title = s.showCaption ? (captionText || "").trim() : "";

      const imgW = canvas.width;
      const imgH = canvas.height;

      const outerPadX = 10;
      const outerPadY = 10;

      const sidePad = 8;
      const topPad = 6;
      const gap = title ? 8 : 0;

      const orientation = imgW >= imgH ? "landscape" : "portrait";
      const measureDoc = new jsPDF({
        orientation,
        unit: "pt",
        format: [imgW, imgH],
      });

      let captionHeight = 0;
      let wrapped = [];
      if (title) {
        const captionSize = Math.max(8, Number(s.captionSize) || 16);
        measureDoc.setFont("helvetica", "bold");
        measureDoc.setFontSize(captionSize);
        wrapped = measureDoc.splitTextToSize(title, imgW - sidePad * 2);
        const lineHeight = Math.round(captionSize * 1.2);
        captionHeight = wrapped.length * lineHeight;
      }

      const captionBlockH = title ? topPad + captionHeight + gap : 0;

      const pageW = imgW + outerPadX * 4;
      const pageH = captionBlockH + imgH + outerPadY * 2;

      const pdf = new jsPDF({
        orientation,
        unit: "pt",
        format: [pageW, pageH],
      });

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, pageH, "F");

      if (title) {
        const captionSize = Math.max(8, Number(s.captionSize) || 16);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(captionSize);
        pdf.setTextColor(0, 0, 0);
        pdf.text(wrapped, pageW / 2, outerPadY + topPad, {
          align: "center",
          baseline: "top",
        });
      }

      const y0 = outerPadY + captionBlockH;
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        outerPadX,
        y0,
        imgW,
        imgH,
        undefined,
        "FAST"
      );

      pdf.save(`${safeFileName(title || "chart")}.pdf`);
    };

    const [style, setStyle] = useState(() =>
      responses.headers.map(() => ({
        showCaption: true,
        captionSize: 16,
        axisTitleSize: 14,
        tickSize: 12,
        showValueLabels: true,
        showBorder: true,
        showGrid: true,
        barColor: "#36A2EB",
        barThickness: "",
        categoryPercentage: 0.85,
        stacked: false,
        customYMax: "",
        compactPDF: true,
        categorySlotPx: 160,
      }))
    );

    const updateStyle = (i, field, value) =>
      setStyle((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], [field]: value };
        return copy;
      });

    const [xColorsState, setXColorsState] = useState(() =>
      responses.headers.map(() => null)
    );

    const handleXColorEdit = (chartIdx, labelIdx, nextColor, baseLabels) => {
      setXColorsState((prev) => {
        const copy = [...prev];
        const uniformDefault = style?.[chartIdx]?.barColor || "#36A2EB";

        const base =
          Array.isArray(copy[chartIdx]) &&
          copy[chartIdx].length === baseLabels.length
            ? [...copy[chartIdx]]
            : baseLabels.map(() => uniformDefault);

        base[labelIdx] = nextColor;
        copy[chartIdx] = base;
        return copy;
      });
    };

    const [xLabelsState, setXLabelsState] = useState(() =>
      responses.headers.map(() => null)
    );

    const handleXLabelEdit = (chartIdx, labelIdx, nextValue, baseLabels) => {
      setXLabelsState((prev) => {
        const copy = [...prev];
        const current =
          Array.isArray(copy[chartIdx]) &&
          copy[chartIdx].length === baseLabels.length
            ? [...copy[chartIdx]]
            : [...baseLabels];
        current[labelIdx] = nextValue;
        copy[chartIdx] = current;
        return copy;
      });
    };

    return (
      <>
        {responses.headers.map((header, index) => {
          const counts = countResponses(index);
          const labels = Object.keys(counts);
          const values = Object.values(counts);

          const displayLabelsForBar =
            Array.isArray(xLabelsState[index]) &&
            xLabelsState[index].length === labels.length
              ? xLabelsState[index]
              : labels;

          const optionCount = labels.length;
          let chartType = null;
          if (optionCount === 0) chartType = "ignore";
          else if (optionCount <= 2) chartType = "pie";
          else if (optionCount <= 10) chartType = "bar";
          else chartType = "ignore";
          if (chartType === "ignore") return null;

          const chartData = {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                ],
                borderColor: "black",
                borderWidth: 2,
              },
            ],
          };

          const chartOptions = {
            plugins: {
              datalabels: {
                color: "black",
                font: { weight: "bold", size: 14 },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return percentage + "%";
                },
              },
              legend: { position: "bottom" },
            },
            maintainAspectRatio: false,
            responsive: true,
          };

          const maxValue = Math.max(...values, 0);
          const suggestedMax = maxValue === 0 ? 1 : Math.ceil(maxValue * 1.15);

          const captionText = titles[index]?.caption ?? header;
          const xTitle = titles[index]?.x ?? "Options";
          const yTitle = titles[index]?.y ?? "Count";

          const s = style[index] || {};
          const yMax = s.customYMax === "" ? null : Number(s.customYMax);
          const barThickness =
            s.barThickness === "" ? undefined : Number(s.barThickness);

          const uniformDefault = s.barColor || "#36A2EB";
          const perBarColors =
            Array.isArray(xColorsState[index]) &&
            xColorsState[index].length === labels.length
              ? xColorsState[index]
              : labels.map(() => uniformDefault);

          const slotPx = Math.max(40, Number(s.categorySlotPx) || 160);
          const extraPx = 140;
          const minPx = 320;
          const chartWidthPx = Math.max(
            minPx,
            labels.length * slotPx + extraPx
          );

          return (
            <div key={index} className="mb-4 d-flex justify-content-center">
              <div className="col-12 col-lg-8">
                <div className="border border-dark rounded shadow p-4 bg-white h-100">
                  {/* Editable controls */}
                  <div className="mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        {chartType === "bar" && (
                          <h6 className="mb-2">Edit Caption & Titles</h6>
                        )}

                        <div className="row g-3 align-items-end">
                          <div className="col-12 col-lg-6">
                            <label className="form-label small">Caption</label>
                            <input
                              className="form-control form-control-sm"
                              value={captionText}
                              onChange={(e) =>
                                handleTitleChange(
                                  index,
                                  "caption",
                                  e.target.value
                                )
                              }
                              placeholder="Chart caption"
                            />
                          </div>

                          {chartType === "bar" && (
                            <>
                              <div className="col-6 col-lg-3">
                                <label className="form-label small">
                                  X-axis title
                                </label>
                                <input
                                  className="form-control form-control-sm"
                                  value={xTitle}
                                  onChange={(e) =>
                                    handleTitleChange(
                                      index,
                                      "x",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Options"
                                />
                              </div>
                              <div className="col-6 col-lg-3">
                                <label className="form-label small">
                                  Y-axis title
                                </label>
                                <input
                                  className="form-control form-control-sm"
                                  value={yTitle}
                                  onChange={(e) =>
                                    handleTitleChange(
                                      index,
                                      "y",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Count"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {chartType === "bar" && (
                          <>
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  labelEditorsOpen[index]
                                    ? "btn-secondary"
                                    : "btn-outline-secondary"
                                }`}
                                onClick={() => toggleLabelEditor(index)}
                                aria-expanded={!!labelEditorsOpen[index]}
                                aria-controls={`xlabels-editor-${index}`}
                              >
                                {labelEditorsOpen[index]
                                  ? "Hide x-axis labels"
                                  : "Edit x-axis labels"}
                              </button>
                            </div>

                            <div
                              id={`xlabels-editor-${index}`}
                              className={
                                labelEditorsOpen[index] ? "mt-2" : "d-none"
                              }
                            >
                              <div className="row g-2">
                                {labels.map((lbl, li) => {
                                  const labelText =
                                    Array.isArray(xLabelsState[index]) &&
                                    xLabelsState[index].length === labels.length
                                      ? xLabelsState[index][li]
                                      : lbl;

                                  const uniformDefault =
                                    style?.[index]?.barColor || "#36A2EB";
                                  const currentColor =
                                    Array.isArray(xColorsState[index]) &&
                                    xColorsState[index].length === labels.length
                                      ? xColorsState[index][li]
                                      : uniformDefault;

                                  return (
                                    <div
                                      className="col-12 col-md-6 col-lg-4"
                                      key={li}
                                    >
                                      <div className="border rounded p-2 h-100">
                                        <input
                                          className="form-control form-control-sm mb-2"
                                          value={labelText ?? ""}
                                          onChange={(e) =>
                                            handleXLabelEdit(
                                              index,
                                              li,
                                              e.target.value,
                                              labels
                                            )
                                          }
                                          placeholder={`Label ${li + 1}`}
                                          style={{
                                            borderLeft: `5px solid ${currentColor}`,
                                            paddingLeft: "0.5rem",
                                          }}
                                        />

                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                          <input
                                            type="color"
                                            className="form-control form-control-color p-0"
                                            style={{
                                              width: 28,
                                              height: 28,
                                              cursor: "pointer",
                                            }}
                                            value={currentColor}
                                            onChange={(e) =>
                                              handleXColorEdit(
                                                index,
                                                li,
                                                e.target.value,
                                                labels
                                              )
                                            }
                                            aria-label={`Pick color for "${
                                              labelText || lbl
                                            }"`}
                                            title={`Color for "${
                                              labelText || lbl
                                            }"`}
                                          />

                                          <div className="d-flex flex-wrap gap-1">
                                            {PRESET_COLORS.map((c) => (
                                              <button
                                                key={c}
                                                type="button"
                                                onClick={() =>
                                                  handleXColorEdit(
                                                    index,
                                                    li,
                                                    c,
                                                    labels
                                                  )
                                                }
                                                className="border-0 rounded"
                                                style={{
                                                  width: 18,
                                                  height: 18,
                                                  background: c,
                                                  boxShadow:
                                                    c.toLowerCase() ===
                                                    (
                                                      currentColor || ""
                                                    ).toLowerCase()
                                                      ? "0 0 0 2px #000 inset"
                                                      : "0 0 0 1px rgba(0,0,0,.25) inset",
                                                }}
                                                aria-label={`Use ${c}`}
                                                title={c}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}

                        {chartType === "bar" && <hr className="my-3" />}

                        {/*Appearance & Styling (bar only)*/}
                        {chartType === "bar" && (
                          <div className="row g-3">
                            <div className="col-12 col-md-3">
                              <div className="small text-muted mb-1">
                                Appearance
                              </div>
                              <div className="d-grid gap-2">
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`cap-${index}`}
                                    checked={!!s.showCaption}
                                    onChange={(e) =>
                                      updateStyle(
                                        index,
                                        "showCaption",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`cap-${index}`}
                                  >
                                    Caption
                                  </label>
                                </div>

                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`val-${index}`}
                                    checked={!!s.showValueLabels}
                                    onChange={(e) =>
                                      updateStyle(
                                        index,
                                        "showValueLabels",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`val-${index}`}
                                  >
                                    Data Labels
                                  </label>
                                </div>

                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`brd-${index}`}
                                    checked={!!s.showBorder}
                                    onChange={(e) =>
                                      updateStyle(
                                        index,
                                        "showBorder",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`brd-${index}`}
                                  >
                                    Border
                                  </label>
                                </div>

                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`grd-${index}`}
                                    checked={!!s.showGrid}
                                    onChange={(e) =>
                                      updateStyle(
                                        index,
                                        "showGrid",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`grd-${index}`}
                                  >
                                    Grid
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="col-12 col-md-3">
                              <label className="form-label small">
                                Caption size
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="8"
                                  max="32"
                                  className="form-control"
                                  value={s.captionSize}
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "captionSize",
                                      Number(e.target.value) || 12
                                    )
                                  }
                                />
                                <span className="input-group-text">px</span>
                              </div>

                              <label className="form-label small mt-2">
                                Axis title size
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="8"
                                  max="28"
                                  className="form-control"
                                  value={s.axisTitleSize}
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "axisTitleSize",
                                      Number(e.target.value) || 12
                                    )
                                  }
                                />
                                <span className="input-group-text">px</span>
                              </div>

                              <label className="form-label small mt-2">
                                X/Y label & value size
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="8"
                                  max="24"
                                  className="form-control"
                                  value={s.tickSize}
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "tickSize",
                                      Number(e.target.value) || 10
                                    )
                                  }
                                />
                                <span className="input-group-text">px</span>
                              </div>
                            </div>

                            <div className="col-12 col-md-3">
                              <label className="form-label small">
                                Bar width
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  value={s.barThickness}
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "barThickness",
                                      e.target.value
                                    )
                                  }
                                  placeholder="auto"
                                />
                                <span className="input-group-text">px</span>
                              </div>

                              <label className="form-label small mt-2">
                                Gap width
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="40"
                                  max="400"
                                  className="form-control"
                                  value={s.categorySlotPx}
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "categorySlotPx",
                                      Number(e.target.value) || 160
                                    )
                                  }
                                />
                                <span className="input-group-text">px</span>
                              </div>

                              <label className="form-label small mt-2">
                                Y-Max
                              </label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control"
                                  value={
                                    s.customYMax === ""
                                      ? suggestedMax
                                      : s.customYMax
                                  }
                                  onChange={(e) =>
                                    updateStyle(
                                      index,
                                      "customYMax",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-start mb-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => downloadChartPDF(index, captionText)}
                    >
                      Download PDF
                    </button>
                  </div>

                  {s.showCaption && (
                    <h6
                      className="text-center mb-3"
                      style={{ fontSize: `${s.captionSize}px`, color: "#000" }}
                    >
                      {captionText}
                    </h6>
                  )}
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "320px" }}
                  >
                    {chartType === "pie" ? (
                      <Pie
                        id={`chart-${index}`}
                        data={chartData}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            chartAreaBorder: { display: false }, // <- ensure OFF for pie
                          },
                        }}
                        ref={(chart) => {
                          chartRefs.current[index] = chart;
                        }}
                      />
                    ) : (
                      <div
                        className="w-100"
                        style={{
                          overflowX: "auto",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        <div
                          style={{
                            width: chartWidthPx,
                            minWidth: chartWidthPx,
                            height: 320,
                            margin: "0 auto",
                          }}
                        >
                          <Bar
                            id={`chart-${index}`}
                            data={{
                              ...chartData,
                              labels: displayLabelsForBar,
                              datasets: [
                                {
                                  ...chartData.datasets[0],
                                  backgroundColor: perBarColors,
                                  borderColor: s.showBorder
                                    ? "#000"
                                    : "rgba(0,0,0,0)",
                                  borderWidth: s.showBorder ? 1.5 : 0,
                                  barThickness:
                                    s.barThickness === ""
                                      ? undefined
                                      : Number(s.barThickness),
                                  categoryPercentage: s.categoryPercentage,

                                  barPercentage: 1,
                                  maxBarThickness: Math.max(
                                    1,
                                    Number(s.barThickness) || slotPx * 0.9
                                  ),
                                },
                              ],
                            }}
                            options={{
                              ...chartOptions,
                              maintainAspectRatio: false,
                              layout: { padding: { top: 16 } },
                              plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                  display: false,
                                  labels: {
                                    color: "#000",
                                    font: { size: s.tickSize },
                                  },
                                },
                                datalabels: {
                                  display: !!s.showValueLabels,
                                  anchor: "end",
                                  align: "end",
                                  color: "#000",
                                  font: {
                                    weight: "bold",
                                    size: Math.max(10, s.tickSize - 1),
                                  },
                                  formatter: (value) => value,
                                  clip: false,
                                  clamp: true,
                                  offset: 2,
                                },

                                chartAreaBorder: {
                                  display: !!s.showBorder,
                                  color: "#000",
                                  width: 1.5,
                                  dash: [],
                                },
                              },
                              scales: {
                                x: {
                                  title: {
                                    display: true,
                                    text: xTitle,
                                    color: "#000",
                                    font: { size: s.axisTitleSize },
                                  },
                                  ticks: {
                                    color: "#000",
                                    font: { size: s.tickSize },
                                    maxRotation: 60,
                                    autoSkip: true,
                                  },
                                  grid: {
                                    display: !!s.showGrid,
                                    color: "#000",
                                    lineWidth: 0.75,
                                    borderDash: [1, 3],
                                    borderDashOffset: 0,
                                    drawOnChartArea: true,
                                    drawTicks: false,
                                    tickLength: 0,
                                  },
                                  border: { display: false },
                                },
                                y: {
                                  beginAtZero: true,
                                  max: Number.isFinite(yMax) ? yMax : undefined,
                                  suggestedMax: Number.isFinite(yMax)
                                    ? undefined
                                    : suggestedMax,
                                  title: {
                                    display: true,
                                    text: yTitle,
                                    color: "#000",
                                    font: { size: s.axisTitleSize },
                                  },
                                  ticks: {
                                    color: "#000",
                                    font: { size: s.tickSize },
                                    precision: 0,
                                  },
                                  grid: {
                                    display: !!s.showGrid,
                                    color: "#000",
                                    lineWidth: 0.75,
                                    borderDash: [1, 3],
                                    borderDashOffset: 0,
                                    drawOnChartArea: true,
                                    drawTicks: false,
                                    tickLength: 0,
                                  },
                                  border: { display: false },
                                },
                              },
                            }}
                            ref={(chart) => {
                              chartRefs.current[index] = chart;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  const renderQuestionTab = () => {
    const allAnswers = responses.rows.map(
      (row) => row[selectedQuestion] || "Empty"
    );
    const counts = allAnswers.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    const sortedOptions = Object.keys(counts).sort();

    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <select
              className="form-select mb-4"
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(Number(e.target.value))}
            >
              {responses.headers.map((header, i) => (
                <option key={i} value={i}>
                  {header}
                </option>
              ))}
            </select>

            {sortedOptions.map((option, i) => (
              <div key={i} className="card mb-3 shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <span className="fw-medium">{option}</span>
                  <span className="text-muted">
                    {counts[option]}{" "}
                    {counts[option] > 1 ? "responses" : "response"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderIndividualTab = () => {
    const response = responses.rows[currentResponse];
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <table className="table table-bordered">
              <tbody>
                {responses.headers.map((header, i) => (
                  <tr key={i}>
                    <th>{header}</th>
                    <td>{response[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              className="mt-3"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                flexDirection: "row",
                flexWrap: "nowrap",
              }}
            >
              <button
                className="btn btn-outline-secondary d-flex justify-content-center align-items-center p-0 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                }}
                disabled={currentResponse === 0}
                onClick={() => setCurrentResponse((prev) => prev - 1)}
              >
                &lt;
              </button>

              <span
                className="fw-medium text-center flex-shrink-0"
                style={{
                  minWidth: "60px",
                  whiteSpace: "nowrap",
                }}
              >
                {currentResponse + 1} of {responses.rows.length}
              </span>

              <button
                className="btn btn-outline-secondary d-flex justify-content-center align-items-center p-0 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                }}
                disabled={currentResponse === responses.rows.length - 1}
                onClick={() => setCurrentResponse((prev) => prev + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const downloadCSV = () => {
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + rawCsv;

    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `survey_${surveyTitle}_responses.csv`;
    link.click();
  };

  const handleAnalyzeClick = async () => {
    if (!rawCsv || rawCsv.trim() === "") {
      alert("No responses available to analyze.");
      return;
    }

    let baseTitle = surveyTitle.trim().replace(/\s+/g, "_");

    if (baseTitle.length > 50) {
      baseTitle = baseTitle.slice(0, 50);
    }

    const fileName = `survey_${baseTitle}_responses.csv`;

    // Trigger modal popup with auto-truncated title
    if (fileName.length > 70) {
      setTempTitle(baseTitle);
      setShowModal(true);
      return;
    }

    await uploadFile(baseTitle);
  };
  const uploadFile = async (titleToUse) => {
    try {
      const blob = new Blob([rawCsv], { type: "text/csv" });
      const file = new File([blob], `survey_${titleToUse}_responses.csv`, {
        type: "text/csv",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", "survey");

      const response = await fetch(
        "http://127.0.0.1:8000/api/upload-preprocessed/",
        {
          method: "POST",
          body: formData,
          headers: {
            userID: localStorage.getItem("user_id") || "",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const fixedUrl = result.file_url;

        sessionStorage.setItem("fileURL", fixedUrl || "");
        sessionStorage.setItem("surveyfile", "true");
        sessionStorage.setItem(
          "file_name",
          `survey_${titleToUse}_responses.xlsx`
        );

        setShowModal(false);
        window.location.href = "http://localhost:5173/?tab=analysis";
      } else {
        alert(result.error || "Failed to prepare file for analysis.");
      }
    } catch (err) {
      console.error("Error sending file:", err);
      alert("Something went wrong while preparing analysis.");
    }
  };

  const downloadXLSX = () => {
    if (!rawCsv || rawCsv.trim() === "") {
      console.error("No raw CSV data available");
      return;
    }

    try {
      // Parse CSV into a workbook
      const workbook = XLSX.read(rawCsv, { type: "string" });

      // Save as .xlsx
      const title = surveyTitle.replace(/\s+/g, "_");
      XLSX.writeFile(workbook, `survey_${title}_responses.xlsx`);
    } catch (error) {
      console.error("Error generating XLSX from CSV:", error);
    }
  };
  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalBox = {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "800px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
  };

  const modalInput = {
    padding: "6px",
    width: "100%",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  };

  const btnPrimary = {
    padding: "6px 12px",
    marginRight: "5px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  };

  const btnCancel = {
    padding: "6px 12px",
    background: "#ccc",
    border: "none",
    borderRadius: "4px",
  };

  return (
    <div style={{ paddingTop: "100px", backgroundColor: "#f0faf0" }}>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div
        style={{
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1);",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>
            {getLabel("Survey Responses")}
            {responseCount !== null && (
              <span className="badge bg-secondary ms-2">{responseCount}</span>
            )}
          </h3>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={downloadCSV}>
              {getLabel("Download CSV")}
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={downloadXLSX}
            >
              Download XLSX
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={handleAnalyzeClick}
            >
              {getLabel("Analyze the Result")}
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs mb-3">
          {["summary", "questions", "individual"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {getLabel(tab.charAt(0).toUpperCase() + tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>

        {isLoading && <p>{getLabel("Loading responses...")}</p>}

        {!isLoading && responses.rows.length === 0 && (
          <div className="alert alert-info">
            {getLabel("No responses found.")}
          </div>
        )}

        {!isLoading && responses.rows.length > 0 && (
          <div>
            {activeTab === "summary" && (
              <SummaryCharts
                responses={responses}
                countResponses={countResponses}
              />
            )}
            {activeTab === "questions" && renderQuestionTab()}
            {activeTab === "individual" && renderIndividualTab()}
          </div>
        )}
        {showModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h5>Filename Too Long</h5>
              <p>
                We shortened the filename automatically. You can further edit if
                needed.
              </p>

              <input
                type="text"
                value={tempTitle}
                onChange={(e) =>
                  setTempTitle(e.target.value.replace(/\s+/g, "_"))
                }
                style={modalInput}
              />

              <p>
                <b>Preview:</b> survey_{tempTitle}_responses.csv
              </p>

              <div style={{ marginTop: "10px" }}>
                <button
                  style={btnPrimary}
                  onClick={() => uploadFile(tempTitle)}
                >
                  Confirm & Upload
                </button>
                <button style={btnCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;
