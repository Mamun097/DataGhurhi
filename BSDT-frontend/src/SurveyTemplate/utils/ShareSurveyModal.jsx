import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Tabs,
  Tab,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

// Imports for PDF generation
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import Logo
import dataghurhiLogo from "../../assets/logos/dataghurhi.png";

const ShareSurveyModal = ({ isOpen, onClose, surveyLink, surveyTitle }) => {
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [activeTab, setActiveTab] = useState("link");

  if (!isOpen) return null;

  const fullUrl = `https://dataghurhi.cse.buet.ac.bd/v/${surveyLink}`;
  const shareText = `Check out this survey: ${surveyTitle}`;

  const handleDownloadPdf = async () => {
    const posterElement = document.getElementById("survey-poster-container");
    if (!posterElement) return;

    try {
      toast.info("Generating PDF...");

      // Capture with high scale for print quality (300 DPI+)
      const canvas = await html2canvas(posterElement, {
        scale: 5, // Increased scale for sharp text/QR
        useCORS: true,
        logging: false,
        scrollX: 0, // Prevents image shifting if scrolled
        scrollY: 0,
        backgroundColor: "#ffffff", // Ensures white background
      });

      const imgData = canvas.toDataURL("image/png");

      // Initialize PDF (A4 size: 210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add image to PDF (stretch to fit A4 exactly)
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Save
      pdf.save(`Survey-Poster-${surveyLink}.pdf`);
      toast.success("PDF Downloaded!");
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("survey-qr-code");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `survey-qr-${surveyLink}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleShareQRCode = () => {
    const canvas = document.getElementById("survey-qr-code");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Error generating image data.");
        return;
      }
      const file = new File([blob], "survey-qr.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: surveyTitle,
            text: shareText,
            url: fullUrl,
          });
        } catch (error) {
          if (error.name !== "AbortError")
            toast.error("Could not share image.");
        }
      } else {
        toast.warning("Your browser doesn't support sharing images directly.");
      }
    }, "image/png");
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopyButtonText("Copied!");
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopyButtonText("Copy"), 2000);
      }
    } catch (err) {
      console.error("Fallback: Unable to copy", err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          setCopyButtonText("Copied!");
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopyButtonText("Copy"), 2000);
        })
        .catch(() => fallbackCopyTextToClipboard(fullUrl));
    } else {
      fallbackCopyTextToClipboard(fullUrl);
    }
  };

  const handleNativeLinkShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        console.error("Error sharing natively:", error);
      }
    }
  };

  // Social Links
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    fullUrl
  )}&text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    fullUrl
  )}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    fullUrl
  )}&title=${encodeURIComponent(surveyTitle)}&summary=${encodeURIComponent(
    shareText
  )}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText + " " + fullUrl
  )}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(
    surveyTitle
  )}&body=${encodeURIComponent(shareText + "\n\n" + fullUrl)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="bi bi-share-fill me-2"></i> Share Survey
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="settings-group">
            <Tabs
              id="share-survey-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3 nav-fill"
            >
              {/* TAB 1: Link */}
              <Tab eventKey="link" title="Survey Link">
                <div className="pt-2">
                  <p className="text-muted small mb-3">
                    Share this link directly or via social media.
                  </p>
                  <InputGroup className="mb-4">
                    <Form.Control
                      type="text"
                      value={fullUrl}
                      readOnly
                      className="bg-light"
                    />
                    <Button variant="primary" onClick={handleCopyToClipboard}>
                      <i className="bi bi-clipboard-check me-2"></i>{" "}
                      {copyButtonText}
                    </Button>
                  </InputGroup>
                  <div className="text-center position-relative mb-4">
                    <hr />
                    <span
                      className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small"
                      style={{ marginTop: "-1px" }}
                    >
                      OR SHARE VIA
                    </span>
                  </div>
                  <Row className="text-center g-2">
                    {navigator.share && (
                      <Col xs={12}>
                        <Button
                          variant="outline-dark"
                          onClick={handleNativeLinkShare}
                          className="w-100 mb-2"
                        >
                          <i className="bi bi-phone-vibrate me-2"></i> Explore
                          More Options
                        </Button>
                      </Col>
                    )}
                    <Col>
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn w-100 text-white"
                        style={{ background: "#1DA1F2" }}
                      >
                        <i className="bi bi-twitter"></i>
                      </a>
                    </Col>
                    <Col>
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn w-100 text-white"
                        style={{ background: "#1877F2" }}
                      >
                        <i className="bi bi-facebook"></i>
                      </a>
                    </Col>
                    <Col>
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn w-100 text-white"
                        style={{ background: "#0A66C2" }}
                      >
                        <i className="bi bi-linkedin"></i>
                      </a>
                    </Col>
                    <Col>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn w-100 text-white"
                        style={{ background: "#25D366" }}
                      >
                        <i className="bi bi-whatsapp"></i>
                      </a>
                    </Col>
                    <Col>
                      <a
                        href={emailUrl}
                        className="btn w-100 text-white"
                        style={{ background: "#7F7F7F" }}
                      >
                        <i className="bi bi-envelope-fill"></i>
                      </a>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* TAB 2: QR Code */}
              <Tab eventKey="qr" title="QR Code">
                <div className="d-flex flex-column align-items-center pt-3 pb-2">
                  <p className="text-muted small mb-3 text-center">
                    Scan this code to open the survey on mobile devices.
                  </p>
                  <div className="p-3 border rounded bg-white mb-3 shadow-sm">
                    <QRCodeCanvas
                      id="survey-qr-code"
                      value={fullUrl}
                      size={200}
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={downloadQRCode}>
                      <i className="bi bi-download me-2"></i> Download
                    </Button>
                    {navigator.canShare && (
                      <Button variant="success" onClick={handleShareQRCode}>
                        <i className="bi bi-share-fill me-2"></i> Share Image
                      </Button>
                    )}
                  </div>
                </div>
              </Tab>

              {/* TAB 3: Poster / Flyer */}
              <Tab eventKey="poster" title="Poster (Print)">
                <div className="d-flex flex-column align-items-center pt-3 pb-2">
                  <p className="text-muted small mb-3 text-center">
                    A printable flyer format. Click "Download PDF" to print.
                  </p>

                  {/* POSTER TEMPLATE CONTAINER */}
                  <div
                    id="survey-poster-container"
                    className="border shadow-sm mb-3 bg-white"
                    style={{
                      width: "300px", // Preview width
                      height: "424px", // A4 Aspect Ratio (1:1.414)
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* 1. Header Accent Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "linear-gradient(90deg, #2c3e50, #25856f)",
                      }}
                    ></div>

                    {/* 2. Logo Section */}
                    <div className="mt-3 mb-2">
                      <img
                        src={dataghurhiLogo}
                        alt="DataGhurhi Logo"
                        style={{ height: "45px", objectFit: "contain" }}
                      />
                    </div>

                    {/* 3. Title Section */}
                    <div
                      style={{
                        padding: "0 15px",
                        textAlign: "center",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <h6
                        className="text-uppercase text-secondary mb-2"
                        style={{
                          fontSize: "9px",
                          letterSpacing: "3px",
                          fontWeight: "600",
                        }}
                      >
                        Participate In
                      </h6>
                      <h2
                        style={{
                          fontSize: "12px", 
                          fontWeight: "800",
                          lineHeight: "1.3",
                          color: "#333",
                          marginBottom: "20px",
                          wordWrap: "break-word",
                        }}
                      >
                        {surveyTitle}
                      </h2>
                    </div>

                    {/* 4. QR Code Section */}
                    <div
                      style={{
                        display: "flex", // Centering Fix
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px",
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px dashed #ced4da",
                        marginBottom: "20px",
                        width: "fit-content", // Ensures box wraps QR tightly
                        margin: "0 auto 20px auto", // Force horizontal centering
                      }}
                    >
                      <QRCodeCanvas
                        value={fullUrl}
                        size={160}
                        level={"H"}
                        includeMargin={false}
                        fgColor="#25856f"
                      />
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#25856f",
                          textTransform: "uppercase",
                        }}
                      >
                        Scan To Participate
                      </div>
                    </div>

                    {/* 5. Footer URL Section */}
                    <div
                      style={{
                        width: "100%",
                        background: "#2c3e50",
                        color: "white",
                        padding: "15px 10px",
                        textAlign: "center",
                        marginTop: "auto",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "9px",
                          marginBottom: "5px",
                          opacity: 0.8,
                        }}
                      >
                        OR VISIT THE LINK
                      </p>
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "bold",
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          color: "#fff",
                        }}
                      >
                        {fullUrl}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button variant="danger" onClick={handleDownloadPdf}>
                    <i className="bi bi-file-earmark-pdf-fill me-2"></i>{" "}
                    Download PDF
                  </Button>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSurveyModal;
