import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./searchResults.css";
import NavbarHome from "./navbarhome";
import NavbarAcholder from "../ProfileManagement/NavbarAccountHolder";
import axios from "axios";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];

  const [language, setLanguage] = React.useState(
    localStorage.getItem("language") || "English"
  );
  const [translations, setTranslations] = React.useState({});
  const [sectionTitle, setSectionTitle] = React.useState({
    project: "Projects",
    account: "Accounts",
    survey: "Surveys",
    other: "Others",
  });
  const handleProjectClick = (projectId, role) => {
    console.log("Project clicked:", projectId, "Role:", role);
    navigate(`/view-project/${projectId}`, {
      state: { role: role },
    });
  };
  const translateText = async (textArray, targetLang) => {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          q: textArray,
          target: targetLang,
          format: "text",
        }
      );
      return response.data.data.translations.map((t) => t.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      return textArray;
    }
  };

  const getLabel = (text) => translations[text] || text;

  React.useEffect(() => {
    const loadTranslations = async () => {
      const labels = [
        "Showing Results:",
        "Projects",
        "Accounts",
        "Surveys",
        "Others",
        "No results found.",
        "Research Field:",
        "Visibility Setting:",
        "Created At:",
        "Research Description:",
        "Back",
        "Published At:"
      ];

      if (language === "English") {
        setTranslations({});
        setSectionTitle({
          project: "Projects",
          account: "Accounts",
          survey: "Surveys",
          other: "Others",
        });
        return;
      }

      const translated = await translateText(labels, "bn");
      const map = {};
      labels.forEach((label, idx) => {
        map[label] = translated[idx];
      });
      setTranslations(map);
      setSectionTitle({
        project: map["Projects"],
        account: map["Accounts"],
        survey: map["Surveys"],
        other: map["Others"],
      });
    };

    loadTranslations();
  }, [language]);

  const isLoggedIn = !!localStorage.getItem("token");
  const searchQuery = location.state?.query || "";

  const groupedResults = results.reduce((acc, item) => {
    const type = item.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <div>
      {isLoggedIn ? (
        <NavbarAcholder language={language} setLanguage={setLanguage} />
      ) : (
        <NavbarHome language={language} setLanguage={setLanguage} />
      )}

      <div className="search-results-page">
        <h2>
          {getLabel("Showing Results:")}{" "}
          <span className="search-query">"{searchQuery}"</span>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← {getLabel("Back")}
          </button>
        </h2>

        {results.length === 0 ? (
          <p>{getLabel("No results found.")}</p>
        ) : (
          Object.keys(groupedResults).map((type) => (
            <div key={type} className="group-section">
              <h3 className="group-title">{sectionTitle[type]}</h3>
              <div className="card-container">
                {type === "project"
                  ? groupedResults[type].map((project) => (
                      <div
                        key={project.project_id}
                        className="project-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleProjectClick(project.project_id, "viewer")}
                      >
                        <h4>{project.title}</h4>
                        <p>
                          <strong>{getLabel("Research Field:")}</strong>{" "}
                          {project.field}
                        </p>
                        {project.description && (
                          <p>
                            <strong>
                              {getLabel("Research Description:")}
                            </strong>{" "}
                            {project.description}
                          </p>
                        )}
                        <p>
                          <strong>{getLabel("Visibility Setting:")}</strong>{" "}
                          {project.privacy_mode}
                        </p>
                        <p>
                          <strong>{getLabel("Created At:")}</strong>{" "}
                          {new Date(project.created_at + "Z").toLocaleString(
                            "en-US",
                            {
                              timeZone: "Asia/Dhaka",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                      </div>
                    ))
                  : type === "survey"
                  ? groupedResults[type].map((survey, index) => (
                      <div
                        className="result-card"
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const fullUrl = `https://localhost:5173/v/${survey.survey_link}`;
                          window.open(fullUrl, "_blank");
                        }}
                      >
                        <h4>{survey.title}</h4>
                        <p>
                          <strong>{getLabel("Published At:")}</strong>{" "}
                          {new Date(
                            survey.published_date + "Z"
                          ).toLocaleString("en-US", {
                            timeZone: "Asia/Dhaka",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                        <span className="tag">Survey</span>
                      </div>
                    ))
                  : groupedResults[type].map((item, index) => (
                      <div className="result-card" key={index}>
                        <h4>{item.title || item.username || item.name}</h4>
                        <p>
                          {item.description ||
                            item.topic ||
                            item.email ||
                            "—"}
                        </p>
                        <span className="tag">{item.type}</span>
                      </div>
                    ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
