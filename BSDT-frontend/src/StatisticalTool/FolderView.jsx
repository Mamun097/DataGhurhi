import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Folder,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  MoreVertical,
  Download,
  Info,
  BarChart2,
  X,
  Eye // Added Eye icon for visuals
} from "lucide-react";
import "./FolderView.css";
import NavbarAcholder from '../ProfileManagement/navbarAccountholder';

export default function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [pathStack, setPathStack] = useState([]);
  
  // State for the file currently being previewed (The Popup)
  const [viewingFile, setViewingFile] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null); // For details modal
  const [showDetails, setShowDetails] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  
  const userId = localStorage.getItem("user_id") || "";
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "English");
  
  useEffect(() => localStorage.setItem("language", language), [language]);
  const currentPath = pathStack.join("/");

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (folderPath) => {
    try {
      const res = await axios.get(
        `/api/sa/files?user_id=${userId}${
          folderPath ? `&path=${folderPath}` : ""
        }`
      );
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openFolder = (folderName) => setPathStack([...pathStack, folderName]);
  const goBack = (index) => setPathStack(pathStack.slice(0, index + 1));

  // Helper to generate URL
  const getFileUrl = (fileName) => {
    return `/api/sa/files/${encodeURIComponent(fileName)}?user_id=${userId}&path=${encodeURIComponent(currentPath)}`;
  };

  const handleDownload = (file) => {
    const url = getFileUrl(file.name);
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobURL = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobURL;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobURL);
      })
      .catch((err) => console.error("Download error:", err));
  };

  const handleDetails = (file) => {
    setSelectedFile(file);
    setShowDetails(true);
    setMenuOpen(null);
  };

  const handleSendToAnalysis = async (file) => {
    const fileURL = `/media/ID_${userId}_uploads/saved_files/${file.name}`;
    sessionStorage.setItem("file_name", file.name);
    sessionStorage.setItem("fileURL", fileURL);
    window.location.href = "/?tab=analysis";
  };

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      openFolder(file.name);
    } else {
      setViewingFile(file); // Set the file to view in popup
    }
  };

  const closeViewer = () => {
    setViewingFile(null);
  };

  const getIcon = (type) => {
    if (type === "folder") return <Folder className="icon folder" />;
    if (["jpg", "jpeg", "png", "gif"].includes(type))
      return <Image className="icon image" />;
    if (["pdf"].includes(type)) return <FileText className="icon pdf" />;
    if (["doc", "docx", "xlsx", "xls"].includes(type))
      return <FileSpreadsheet className="icon doc" />;
    return <File className="icon default" />;
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      <NavbarAcholder language={language} setLanguage={setLanguage} />

      <div className="file-explorer">
        <div className="header">
          <h2>Personal Storage</h2>
        </div>

        <div className="breadcrumb">
          <span onClick={() => setPathStack([])} className="breadcrumb-item">
            Home
          </span>
          {pathStack.map((folder, idx) => (
            <span key={idx} className="breadcrumb-item" onClick={() => goBack(idx)}>
              {folder}
            </span>
          ))}
        </div>

        <div className="file-grid">
          {files.map((file) => (
            <div
              key={file.name}
              className={`file-card ${file.type === "folder" ? "folder-card" : ""}`}
            >
              {/* Updated onClick to handle both folders and files */}
              <div
                className="file-preview"
                onClick={() => handleFileClick(file)}
              >
                {["jpg", "jpeg", "png", "gif"].includes(file.type) ? (
                  <img
                    src={getFileUrl(file.name)}
                    alt={file.name}
                    className="file-thumbnail"
                  />
                ) : (
                  getIcon(file.type)
                )}
              </div>

              <div className="file-info">
                <span className="file-name" title={file.name}>
                  {file.name}
                </span>
                <button
                  className="menu-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening preview when clicking menu
                    setMenuOpen(menuOpen === file.name ? null : file.name);
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {menuOpen === file.name && (
                <div className="file-menu">
                  {file.type !== "folder" && (
                    <>
                      <button onClick={() => handleDownload(file)}>
                        <Download size={14} /> Download
                      </button>
                      <button onClick={() => handleDetails(file)}>
                        <Info size={14} /> Details
                      </button>
                      {["xlsx", "xls"].includes(file.type) && (
                        <button onClick={() => handleSendToAnalysis(file)}>
                          <BarChart2 size={14} /> Send to Analysis
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- NEW: Full Screen File Viewer (Popup) --- */}
        {viewingFile && (
          <div className="file-viewer-overlay" onClick={closeViewer}>
            <div className="file-viewer-container" onClick={(e) => e.stopPropagation()}>
              <div className="file-viewer-header">
                <h3>{viewingFile.name}</h3>
                <div className="viewer-actions">
                  <button onClick={() => handleDownload(viewingFile)} title="Download">
                    <Download size={20} />
                  </button>
                  <button onClick={closeViewer} title="Close">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="file-viewer-content">
                {/* Image Preview */}
                {["jpg", "jpeg", "png", "gif", "webp"].includes(viewingFile.type) ? (
                  <img 
                    src={getFileUrl(viewingFile.name)} 
                    alt="Preview" 
                    className="viewer-image" 
                  />
                ) : 
                /* PDF Preview */
                ["pdf"].includes(viewingFile.type) ? (
                   <iframe 
                     src={getFileUrl(viewingFile.name)} 
                     className="viewer-iframe"
                     title="PDF Preview"
                   />
                ) : (
                  /* Fallback for Excel/Docs (Cannot easily render in browser) */
                  <div className="viewer-placeholder">
                    {getIcon(viewingFile.type)}
                    <p>No preview available for this file type.</p>
                    <button className="download-btn-lg" onClick={() => handleDownload(viewingFile)}>
                      Download to View
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Old Details Modal (kept as is) */}
        {showDetails && selectedFile && (
          <div className="details-modal">
            <div className="details-content">
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                <X size={18} />
              </button>
              <h3>File Details</h3>
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
              <p><strong>Path:</strong> /{pathStack.join("/")}</p>
              {selectedFile.size && <p><strong>Size:</strong> {selectedFile.size} KB</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}