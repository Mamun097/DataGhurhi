import "bootstrap-icons/font/bootstrap-icons.css";
import { handleImageUpload } from "../utils/handleImageUpload";
import Tooltip from "@mui/material/Tooltip";

const SurveyBanner = ({
  currentBackgroundImage,
  setCurrentBackgroundImage,
  getLabel,
  setImageInParent,
}) => {
  // Function to update the background image and relay it to the parent component
  const updateAndRelayBackgroundImage = (newImageSrc) => {
    setCurrentBackgroundImage(newImageSrc);
    if (setImageInParent) {
      setImageInParent(newImageSrc);
    }
  };

  // Function to remove the current background image
  const handleRemoveImage = () => {
    updateAndRelayBackgroundImage("");
    const fileInput = document.getElementById("bannerImageInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div>
      <div style={{ position: "relative", width: "100%" }}>
        {currentBackgroundImage ? (
          <img
            src={currentBackgroundImage}
            alt={getLabel("Survey Banner") || "Survey Banner"}
            className="img-fluid"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div></div>
        )}
      </div>

      {/* Banner Controls */}
      <div className="mt-3 button-group-mobile-compact justify-content-center">
        <label className="btn btn-outline-secondary btn-sm me-1">
          <Tooltip
            title="Max height: 400px, Max width: 1200px"
            placement="top"
            arrow
            slotProps={{
              popper: {
                sx: {
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "#333", // dark background
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
              <i className="bi bi-image me-2"></i>{" "}
              {getLabel("Upload Banner Image")}
            </span>
          </Tooltip>

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              handleImageUpload(e, updateAndRelayBackgroundImage);
            }}
            id="bannerImageInput"
          />
        </label>
        {currentBackgroundImage && (
          <button
            className="btn btn-outline-danger btn-sm me-1"
            onClick={handleRemoveImage}
            title={getLabel("Remove current banner image")}
          >
            <i className="bi bi-trash"></i> {getLabel("Remove Banner")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyBanner;
