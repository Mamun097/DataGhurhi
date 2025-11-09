import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import Tooltip from "@mui/material/Tooltip";

const SurveyLogo = ({
  logo,
  setLogo,
  logoAlignment,
  setLogoAlignment,
  logoText,
  setLogoText,
  getLabel,
  setLogoInParent,
}) => {
  // Function to update the logo and relay it to the parent component
  const updateAndRelayLogo = (newLogo) => {
    setLogo(newLogo);
    if (setLogoInParent) {
      setLogoInParent(newLogo);
    }
  };

  // Function to handle Logo alignment changes
  const handleLogoAlignmentChange = (alignment) => {
    if (["left", "center", "right"].includes(alignment)) {
      setLogoAlignment(alignment);
    }
  };

  // Function to remove the current logo
  const handleRemoveLogo = () => {
    updateAndRelayLogo(null);
    const fileInput = document.getElementById("bannerLogoInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          textAlign:
            logoAlignment === "left"
              ? "left"
              : logoAlignment === "center"
              ? "center"
              : "right",
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt={getLabel("Survey Logo") || "Survey Logo"}
            className="img-fluid"
            style={{
              maxHeight: "200px",
              objectFit: "cover",
              display: "inline-block",
            }}
          />
        ) : (
          <div></div>
        )}
      </div>

      {/* Logo Controls */}
      <div className="mt-3 flex flex-column align-items-center">
        {/* Upload */}
        <div className="mt-3 button-group-mobile-compact justify-content-center">
          <label className="btn btn-outline-secondary btn-sm me-1"> 
            <Tooltip
              title="Max height: 200px, Max width: 600px"
              placement="top"
              arrow
              slotProps={{
                popper: {
                  sx: {
                    "& .MuiTooltip-tooltip": {
                      backgroundColor: "#25856f", // dark background
                      color: "#fff", // white text
                      fontSize: "0.9rem", // slightly bigger text
                      padding: "8px 12px", // more padding
                      borderRadius: "6px", // rounded edges
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.3)", // subtle shadow
                    },
                    "& .MuiTooltip-arrow": {
                      color: "#333", // arrow matches background
                    },
                  },
                },
              }}
            >
              <span>
                <i className="bi bi-image me-2"></i> {getLabel("Upload Logo")}
              </span>
            </Tooltip>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleImageUpload(e, updateAndRelayLogo);
              }}
              id="bannerLogoInput"
            />
          </label>

          {/* Remove */}
          {logo && (
            <button
              className="btn btn-outline-danger btn-sm me-1"
              onClick={handleRemoveLogo}
              title={getLabel("Remove current Logo")}
            >
              <i className="bi bi-trash"></i> {getLabel("Remove Logo")}
            </button>
          )}
        </div>

        {/* Alignment Buttons */}
        {logo && (
          <div className="mt-2 button-group-mobile-compact justify-content-center">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                className={`btn btn-sm me-1 ${
                  logoAlignment === align
                    ? "btn-aligned"
                    : "btn-outline-aligned"
                }`}
                onClick={() => handleLogoAlignmentChange(align)}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Logo Text Input */}
        {logo && (logoAlignment === "left" || logoAlignment === "right") && (
          <div className="mt-3 w-100">
            <textarea
              id="logoText"
              className="form-control text-center border-black"
              rows={3}
              placeholder="Enter a label for the logo"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              aria-label="Logo label"
            />

            <p className="mt-1 text-xs text-gray-500 text-center">
              {`Note: The label will be aligned automatically to the ${
                logoAlignment === "left" ? "right" : "left"
              } of the logo.`}
            </p>
          </div>
        )}

        {logo && logoAlignment === "center" && (
          <div className="mt-3 w-full">
            <textarea
              id="logoText"
              rows={3}
              className="form-control text-center border-black"
              aria-label="Logo label"
              placeholder="Enter a label for the logo"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500 text-center">
              Note: The label will be centered below the logo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyLogo;
