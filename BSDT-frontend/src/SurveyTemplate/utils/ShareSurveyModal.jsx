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

const ShareSurveyModal = ({ isOpen, onClose, surveyLink, surveyTitle }) => {
  if (!isOpen) return null;

  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [activeTab, setActiveTab] = useState("link");

  const fullUrl = `https://dataghurhi.cse.buet.ac.bd/v/${surveyLink}`;
  const shareText = `Check out this survey: ${surveyTitle}`;

  //1. Download Logic (Same as before)
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

  //2. Native Image Share Logic
  const handleShareQRCode = () => {
    const canvas = document.getElementById("survey-qr-code");
    if (!canvas) return;

    // Convert Canvas to Blob (binary data)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Error generating image data.");
        return;
      }

      // Create a File object from the Blob
      const file = new File([blob], "survey-qr.png", { type: "image/png" });

      // Check if the browser supports sharing files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: surveyTitle,
            text: shareText,
            url: fullUrl,
          });
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error sharing image:", error);
            toast.error("Could not share image.");
          }
        }
      } else {
        toast.warning("Your browser doesn't support sharing images directly.");
      }
    }, "image/png");
  };

  //Clipboard Logic
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
      } else {
        toast.error("Copying the link failed.");
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
        .catch((err) => {
          fallbackCopyTextToClipboard(fullUrl);
        });
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

  // --- Social Links ---
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
              {/* TAB 1: Link & Social Share */}
              <Tab eventKey="link" title="Share Link">
                <div className="pt-2">
                  <p className="text-muted small mb-3">
                    Share this link with your respondents directly or via social
                    media.
                  </p>

                  <InputGroup className="mb-4">
                    <Form.Control
                      type="text"
                      value={fullUrl}
                      readOnly
                      aria-label="Survey Link"
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
                        title="Twitter"
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
                        title="Facebook"
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
                        title="LinkedIn"
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
                        title="WhatsApp"
                      >
                        <i className="bi bi-whatsapp"></i>
                      </a>
                    </Col>
                    <Col>
                      <a
                        href={emailUrl}
                        className="btn w-100 text-white"
                        style={{ background: "#7F7F7F" }}
                        title="Email"
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

                    {/* Only show this button if browser supports file sharing */}
                    {navigator.canShare && (
                      <Button variant="success" onClick={handleShareQRCode}>
                        <i className="bi bi-share-fill me-2"></i> Share Image
                      </Button>
                    )}
                  </div>
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

// return (
//   <Modal show={show} onHide={handleClose} centered>
//     <Modal.Header closeButton>
//       <Modal.Title>
//         <i className="bi bi-share-fill me-2"></i> Share Survey
//       </Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//       <Tabs
//         id="share-survey-tabs"
//         activeKey={activeTab}
//         onSelect={(k) => setActiveTab(k)}
//         className="mb-3 nav-fill"
//       >
//         {/* TAB 1: Link & Social Share */}
//         <Tab eventKey="link" title="Share Link">
//           <div className="pt-2">
//             <p className="text-muted small mb-3">
//               Share this link with your respondents directly or via social
//               media.
//             </p>

//             <Form.Label className="fw-bold">Survey Link</Form.Label>
//             <InputGroup className="mb-4">
//               <Form.Control
//                 type="text"
//                 value={fullUrl}
//                 readOnly
//                 aria-label="Survey Link"
//                 className="bg-light"
//               />
//               <Button variant="primary" onClick={handleCopyToClipboard}>
//                 <i className="bi bi-clipboard-check me-2"></i> {copyButtonText}
//               </Button>
//             </InputGroup>

//             <div className="text-center position-relative mb-4">
//               <hr />
//               <span
//                 className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small"
//                 style={{ marginTop: "-1px" }}
//               >
//                 OR SHARE VIA
//               </span>
//             </div>

//             <Row className="text-center g-2">
//               {navigator.share && (
//                 <Col xs={12}>
//                   <Button
//                     variant="outline-dark"
//                     onClick={handleNativeLinkShare}
//                     className="w-100 mb-2"
//                   >
//                     <i className="bi bi-phone-vibrate me-2"></i> System Share
//                   </Button>
//                 </Col>
//               )}
//               <Col>
//                 <a
//                   href={twitterUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn w-100 text-white"
//                   style={{ background: "#1DA1F2" }}
//                   title="Twitter"
//                 >
//                   <i className="bi bi-twitter"></i>
//                 </a>
//               </Col>
//               <Col>
//                 <a
//                   href={facebookUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn w-100 text-white"
//                   style={{ background: "#1877F2" }}
//                   title="Facebook"
//                 >
//                   <i className="bi bi-facebook"></i>
//                 </a>
//               </Col>
//               <Col>
//                 <a
//                   href={linkedinUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn w-100 text-white"
//                   style={{ background: "#0A66C2" }}
//                   title="LinkedIn"
//                 >
//                   <i className="bi bi-linkedin"></i>
//                 </a>
//               </Col>
//               <Col>
//                 <a
//                   href={whatsappUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn w-100 text-white"
//                   style={{ background: "#25D366" }}
//                   title="WhatsApp"
//                 >
//                   <i className="bi bi-whatsapp"></i>
//                 </a>
//               </Col>
//               <Col>
//                 <a
//                   href={emailUrl}
//                   className="btn w-100 text-white"
//                   style={{ background: "#7F7F7F" }}
//                   title="Email"
//                 >
//                   <i className="bi bi-envelope-fill"></i>
//                 </a>
//               </Col>
//             </Row>
//           </div>
//         </Tab>

//         {/* TAB 2: QR Code */}
//         <Tab eventKey="qr" title="QR Code">
//           <div className="d-flex flex-column align-items-center pt-3 pb-2">
//             <p className="text-muted small mb-3 text-center">
//               Scan this code to open the survey on mobile devices.
//             </p>

//             <div className="p-3 border rounded bg-white mb-3 shadow-sm">
//               <QRCodeCanvas
//                 id="survey-qr-code"
//                 value={fullUrl}
//                 size={200}
//                 level={"H"}
//                 includeMargin={true}
//               />
//             </div>

//             <div className="d-flex gap-2">
//               <Button variant="outline-primary" onClick={downloadQRCode}>
//                 <i className="bi bi-download me-2"></i> Download
//               </Button>

//               {/* Only show this button if browser supports file sharing */}
//               {navigator.canShare && (
//                 <Button variant="success" onClick={handleShareQRCode}>
//                   <i className="bi bi-share-fill me-2"></i> Share Image
//                 </Button>
//               )}
//             </div>
//           </div>
//         </Tab>
//       </Tabs>
//     </Modal.Body>
//   </Modal>
// );
