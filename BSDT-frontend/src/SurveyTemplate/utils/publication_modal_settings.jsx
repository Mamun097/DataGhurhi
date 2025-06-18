// src/Components/PublicationSettingsModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
// Note: You can remove this CSS import if you aren't using custom styles
// import "../CSS/PublicationSettingsModal.css";

const PublicationSettingsModal = ({
  show,
  handleClose,
  handleConfirm,
  isLoggedInRequired,
  action,
}) => {
  const [localValue, setLocalValue] = useState(isLoggedInRequired);

  useEffect(() => {
    if (show) {
      setLocalValue(isLoggedInRequired);
    }
  }, [show, isLoggedInRequired]);

  const handleConfirmClick = () => {
    handleConfirm(localValue);
  };

  const titleText = action === "publish" ? "Publish Survey" : "Update Survey";
  const buttonText = action === "publish" ? "Publish" : "Update";

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      dialogClassName="modal-90w modal-dialog-centered"
      backdrop="static" // Prevents closing when clicking outside the modal
    >
      <Modal.Header closeButton>
        <Modal.Title>{titleText}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-sm-4">
        <Form>
          <Form.Group controlId="userResponseLoggedInStatus">
            <Form.Check
              type="switch"
              id="login-required-switch"
              className="fs-6"
              label="Require users to be logged in to respond"
              checked={localValue}
              onChange={(e) => setLocalValue(e.target.checked)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirmClick} className="ms-2">
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PublicationSettingsModal;