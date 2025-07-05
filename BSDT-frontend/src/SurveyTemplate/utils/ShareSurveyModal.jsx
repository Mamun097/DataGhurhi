import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const ShareSurveyModal = ({ show, handleClose, surveyLink, surveyTitle }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const fullUrl = `https://localhost:5173/v/${surveyLink}`;
  const shareText = `Check out this survey: ${surveyTitle}`;


  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopyButtonText('Copied!');
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      } else {
        toast.error("Copying the link failed.");
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
      toast.error("Failed to copy link.");
    }

    document.body.removeChild(textArea);
  };

  // Main handler that attempts the modern API and uses the fallback if it fails
  const handleCopyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopyButtonText('Copied!');
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      }).catch(err => {
        console.error('Modern copy failed, trying fallback: ', err);
        fallbackCopyTextToClipboard(fullUrl);
      });
    } else {
      fallbackCopyTextToClipboard(fullUrl);
    }
  };


  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        console.error('Error sharing natively:', error);
      }
    } else {
      alert("Your browser does not support native sharing. Please copy the link manually.");
    }
  };
  
  // --- Manual Share Link URLs ---
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(surveyTitle)}&summary=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(surveyTitle)}&body=${encodeURIComponent(shareText + '\n\n' + fullUrl)}`;


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="bi bi-share-fill me-2"></i> Share Survey</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Share this link with your respondents to collect responses.</p>
        
        {/* The Copy to Clipboard Input Group */}
        <Form.Label>Survey Link</Form.Label>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            value={fullUrl}
            readOnly
            aria-label="Survey Link"
          />
          <Button variant="outline-primary" onClick={handleCopyToClipboard}>
            <i className="bi bi-clipboard-check me-2"></i> {copyButtonText}
          </Button>
        </InputGroup>

        <hr />

        {/* Share Buttons Section */}
        <p className="text-center mb-2">Share via</p>
        <Row className="text-center g-2">
            {/* Native Share Button - shown only if the browser supports it */}
            {navigator.share && (
                 <Col xs={12}>
                    <Button variant="success" onClick={handleNativeShare} className="w-100 mb-2">
                        <i className="bi bi-phone-vibrate me-2"></i> Share via your Device...
                    </Button>
                 </Col>
            )}
            
            {/* Manual Fallback Links */}
            <Col><a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg w-100" style={{background: '#1DA1F2', color: 'white'}} title="Share on Twitter"><i className="bi bi-twitter"></i></a></Col>
            <Col><a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg w-100" style={{background: '#1877F2', color: 'white'}} title="Share on Facebook"><i className="bi bi-facebook"></i></a></Col>
            <Col><a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg w-100" style={{background: '#0A66C2', color: 'white'}} title="Share on LinkedIn"><i className="bi bi-linkedin"></i></a></Col>
            <Col><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg w-100" style={{background: '#25D366', color: 'white'}} title="Share on WhatsApp"><i className="bi bi-whatsapp"></i></a></Col>
            <Col><a href={emailUrl} className="btn btn-lg w-100" style={{background: '#7F7F7F', color: 'white'}} title="Share via Email"><i className="bi bi-envelope-fill"></i></a></Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ShareSurveyModal;