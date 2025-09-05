import React, { use, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js/auto";
import { Copy } from "lucide-react";
import * as XLSX from "xlsx";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);
import "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarAcholder from "../../ProfileManagement/navbarAccountholder";
import apiClient from "../../api";

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
  if (!csvText || typeof csvText !== "string") return { headers: [], rows: [] };
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines
    .slice(1)
    .map((line) =>
      line.split(",").map((cell) => cell.trim().replace(/"/g, ""))
    );
  return { headers, rows };
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

  const countResponses = (index) => {
    const counts = {};
    responses.rows.forEach((row) => {
      const answer = row[index] || "Empty";
      counts[answer] = (counts[answer] || 0) + 1;
    });
    return counts;
  };

  const renderSummaryCharts = () => {
    return responses.headers.map((header, index) => {
      const counts = countResponses(index);
      const labels = Object.keys(counts);
      const values = Object.values(counts);

      // Decide chart type
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

      return (
        <div key={index} className="mb-4 d-flex justify-content-center">
          <div className="col-12 col-lg-6">
            <div className="border border-dark rounded shadow p-4 bg-white h-100">
              {/* Caption/Header */}
              <h6 className="text-center mb-4">{header}</h6>

              {/* Chart Container */}
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "320px" }}
              >
                {chartType === "pie" ? (
                  <Pie
                    id={`chart-${index}`}
                    data={chartData}
                    options={chartOptions}
                  />
                ) : (
                  <div style={{ width: "90%", height: "100%" }}>
                    <Bar
                      id={`chart-${index}`}
                      data={{
                        ...chartData,
                        datasets: [
                          {
                            ...chartData.datasets[0],
                            backgroundColor: "#36A2EB",
                          },
                        ],
                      }}
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                          datalabels: {
                            anchor: "end",
                            align: "end",
                            color: "black",
                            font: { weight: "bold", size: 12 },
                            formatter: (value) => value,
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

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
          {/* Half-width on desktop, full width on mobile */}
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
          {/* Half width on desktop, full width on mobile */}
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

            {/* Navigation */}
            <div
              className="mt-3"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                flexDirection: "row", // Explicitly force row direction
                flexWrap: "nowrap",
              }}
            >
              <button
                className="btn btn-outline-secondary d-flex justify-content-center align-items-center p-0 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px", // Ensures minimum width is maintained
                }}
                disabled={currentResponse === 0}
                onClick={() => setCurrentResponse((prev) => prev - 1)}
              >
                &lt;
              </button>

              <span
                className="fw-medium text-center flex-shrink-0"
                style={{
                  minWidth: "60px", // Increased from 40px for better mobile display
                  whiteSpace: "nowrap", // Prevents text wrapping
                }}
              >
                {currentResponse + 1} of {responses.rows.length}
              </span>

              <button
                className="btn btn-outline-secondary d-flex justify-content-center align-items-center p-0 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px", // Ensures minimum width is maintained
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
    const blob = new Blob([rawCsv], { type: "text/csv;charset=utf-8;" });
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

    try {
      const blob = new Blob([rawCsv], { type: "text/csv" });
      const file = new File([blob], `survey_${surveyTitle}_responses.csv`, {
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
        sessionStorage.setItem("surveyfile", "true");
        sessionStorage.setItem(
          "file_name",
          `survey_${surveyTitle}_responses.xlsx`
        );
        window.location.href = "/analysis";
      } else {
        alert(result.error || "Failed to prepare file for analysis.");
      }
    } catch (err) {
      console.error("Error sending file:", err);
      alert("Something went wrong while preparing analysis.");
    }
  };

  const downloadXLSX = () => {
    if (!responses || !responses.headers || !responses.rows) {
      console.error("No responses data available");
      return;
    }

    try {
      const dataForSheet = [responses.headers, ...responses.rows];
      const ws = XLSX.utils.aoa_to_sheet(dataForSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Responses");
      XLSX.writeFile(wb, `survey_${surveyTitle}_responses.xlsx`);
    } catch (error) {
      console.error("Error generating XLSX:", error);
    }
  };

  return (
    <>
      <NavbarAcholder language={language} setLanguage={setLanguage} />
      <div className="container " style={{ marginTop: " 100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{getLabel("Survey Responses")}</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={downloadCSV}>
              {getLabel("Download CSV")}
            </button>

            <button className="btn btn-success" onClick={downloadXLSX}>
              Download XLSX
            </button>

            <button className="btn btn-info" onClick={handleAnalyzeClick}>
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
            {activeTab === "summary" && renderSummaryCharts()}
            {activeTab === "questions" && renderQuestionTab()}
            {activeTab === "individual" && renderIndividualTab()}
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyResponses;
