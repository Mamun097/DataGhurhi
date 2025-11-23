import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const PublicationSettingsModal = ({
  show, // Boolean to control modal visibility
  handleClose,
  handleConfirm,
  isLoggedInRequired,
  shuffleQuestions,
  action, // "publish" or "update"
  isQuiz,
}) => {
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(isLoggedInRequired);
  const [localShuffle, setLocalShuffle] = useState(shuffleQuestions);

  useEffect(() => {
    if (show) {
      setLocalIsLoggedIn(isLoggedInRequired);
      setLocalShuffle(shuffleQuestions);
    }
  }, [show, isLoggedInRequired, shuffleQuestions]);

  const handleConfirmClick = () => {
    handleConfirm(localIsLoggedIn, localShuffle);
  };

  const titleText = action === "publish" ? "Publish Survey" : "Update Survey";
  const buttonText = action === "publish" ? "Publish" : "Update";

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="modal-90w modal-dialog-centered"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{titleText}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-sm-4">
        <Form>
          <Form.Group className="mb-3" controlId="userResponseLoggedInStatus">
            <Form.Check
              type="switch"
              id="login-required-switch"
              className="fs-6"
              label={
                isQuiz
                  ? "Users must be logged in to respond in quiz mode"
                  : "Require users to be logged in to respond"
              }
              checked={isQuiz? true : isLoggedInRequired}
              disabled={isQuiz}
              onChange={(e) => setLocalIsLoggedIn(e.target.checked)}
            />
          </Form.Group>

          <Form.Group controlId="shuffleQuestionsStatus">
            <Form.Check
              type="switch"
              id="shuffle-questions-switch"
              className="fs-6"
              label="Shuffle question order for each respondent"
              checked={localShuffle}
              onChange={(e) => setLocalShuffle(e.target.checked)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button variant="outline-danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleConfirmClick}
          className="ms-2"
        >
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PublicationSettingsModal;
