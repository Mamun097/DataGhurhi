const SurveyNotOpen = ({ surveyOpenMessage, template }) => {
  const title = template?.template?.title || "Untitled Survey";
    console.log("template in SurveyNotOpen:", template);
  return (
    <div className="col-12 col-md-8 min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow-sm mt-4 min-vh-50">
        <div
          className="card-body text-center py-4"
          style={{
            background: "linear-gradient(90deg, #ffffff, #f8f9fa)",
            borderRadius: "6px",
          }}
        >
          <h2
            className="card-title mb-2"
            style={{ color: "#256f5e", fontWeight: 700 }}
          >
            {title}
          </h2>
          <p
            className="text-secondary mb-3"
            style={{ fontSize: "1.05rem", whiteSpace: "pre-wrap" }}
          >
            {surveyOpenMessage}
          </p>

          <div className="d-flex justify-content-center gap-2">
            <a href="/" className="btn btn-outline-primary btn-sm">
              Go to Home
            </a>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyNotOpen;
