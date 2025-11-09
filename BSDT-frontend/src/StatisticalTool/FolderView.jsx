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
} from "lucide-react";
import "./FolderView.css";

export default function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [pathStack, setPathStack] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const userId = localStorage.getItem("user_id") || "";

  const currentPath = pathStack.join("/");

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (folderPath) => {
    try {
      const res = await axios.get(
<<<<<<< Updated upstream
        `https://dataghurhi.cse.buet.ac.bd:8001/files?user_id=${userId}${
=======
        `http://127.0.0.1:8000/files?user_id=${userId}${
>>>>>>> Stashed changes
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

const handleDownload = (file) => {
<<<<<<< Updated upstream
  const url = `https://dataghurhi.cse.buet.ac.bd:8001/files/${encodeURIComponent(file.name)}?user_id=${userId}&path=${encodeURIComponent(currentPath)}`;
=======
  const url = `http://127.0.0.1:8000/files/${encodeURIComponent(file.name)}?user_id=${userId}&path=${encodeURIComponent(currentPath)}`;
>>>>>>> Stashed changes
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
    window.location.href = "/analysis";


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
    <div className="file-explorer">
      {/* Header */}
      <div className="header">
        <h2>Personal Storage</h2>
      </div>

      {/* Breadcrumb */}
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

   


      {/* File Grid */}
      <div className="file-grid">
        {files.map((file) => (
          <div
            key={file.name}
            className={`file-card ${file.type === "folder" ? "folder-card" : ""}`}
          >
            <div
              className="file-preview"
              onClick={() =>
                file.type === "folder" ? openFolder(file.name) : null
              }
            >
              {["jpg", "jpeg", "png", "gif"].includes(file.type) ? (
                <img
<<<<<<< Updated upstream
                  src={`https://dataghurhi.cse.buet.ac.bd:8001/files/${file.name}?user_id=${userId}&path=${currentPath}`}
=======
                  src={`http://127.0.0.1:8000/files/${file.name}?user_id=${userId}&path=${currentPath}`}
>>>>>>> Stashed changes
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
                onClick={() =>
                  setMenuOpen(menuOpen === file.name ? null : file.name)
                }
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

      {/* File Details Modal */}
      {showDetails && selectedFile && (
        <div className="details-modal">
          <div className="details-content">
            <button className="close-btn" onClick={() => setShowDetails(false)}>
              <X size={18} />
            </button>
            <h3>File Details</h3>
            <p>
              <strong>Name:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>Type:</strong> {selectedFile.type}
            </p>
            <p>
              <strong>Path:</strong> /{pathStack.join("/")}
            </p>
            {selectedFile.size && (
              <p>
                <strong>Size:</strong> {selectedFile.size} KB
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
