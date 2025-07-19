import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Button,
  Form,
  ListGroup,
  Spinner,
  Alert,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useCallback } from "react";

const CollaborationModal = ({ show, handleClose, surveyId, surveyTitle }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [accessRole, setAccessRole] = useState("editor"); // Default role

  const pendingCollaborators = useMemo(
    () => collaborators.filter((c) => c.invitation === "pending"),
    [collaborators]
  );
  const acceptedCollaborators = useMemo(
    () => collaborators.filter((c) => c.invitation === "accepted"),
    [collaborators]
  );

  const getAuthToken = () => {
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return null;
    try {
      const parsed = JSON.parse(tokenString);
      return parsed.token || tokenString;
    } catch {
      return tokenString;
    }
  };

  const fetchCollaborators = useCallback(async () => {
    if (!surveyId) return;
    setIsLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:2000/api/survey-collaborator/get-survey-collaborators/${surveyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCollaborators(response.data.collaborators || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch collaborators.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    if (show) {
      fetchCollaborators();
    }
  }, [show, surveyId, fetchCollaborators]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const payload = {
        survey_id: surveyId,
        request_email: email,
        access_role: accessRole,
      };
      await axios.post(
        "http://localhost:2000/api/survey-collaborator/send-survey-collaboration-request",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Invitation sent to ${email}`);
      setEmail(""); // Clear input after sending
      fetchCollaborators(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to send invitation.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?")) {
      return;
    }
    setIsLoading(true);
    try {
      const token = getAuthToken();
      await axios.delete(
        `http://localhost:2000/api/survey-collaborator/${surveyId}/remove-collaborator/${collaboratorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Collaborator removed.");
      fetchCollaborators();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to remove collaborator.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Manage Collaborators for "{surveyTitle}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="ms-1">Send Invitation</h5>
        <Form onSubmit={handleSendInvite}>
          <div className="mb-3">
            <Form.Control
              type="email"
              placeholder="Collaborator's Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="mb-3">
            <Form.Select
              value={accessRole}
              onChange={(e) => setAccessRole(e.target.value)}
              disabled={isLoading}
              style={{ flex: "0 1 120px" }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Form.Select>
          </div>
          <div className="mb-3">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </Form>

        <hr />

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Using a function to render list items to avoid code duplication */}
        {["pending", "accepted"].map((status) => {
          const list =
            status === "pending" ? pendingCollaborators : acceptedCollaborators;
          const title =
            status === "pending"
              ? "Pending Invitations"
              : "Accepted Collaborators";
          const buttonText = status === "pending" ? "Cancel" : "Remove";

          return (
            <div key={status}>
              <h5 className="mt-4">
                {title} ({list.length})
              </h5>
              {list.length > 0 ? (
                <ListGroup variant="flush">
                  {list.map((collab) => (
                    <ListGroup.Item key={collab.user.user_id} className="px-0">
                      <Row className="align-items-center">
                        <Col>
                          <div className="text-truncate">
                            <strong>{collab.user.name}</strong>
                            <span className="text-muted d-block d-sm-inline ms-sm-2">
                              ({collab.user.email})
                            </span>
                          </div>
                          <em className="text-muted">{collab.access_role}</em>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleRemoveCollaborator(collab.user.user_id)
                            }
                            disabled={isLoading}
                          >
                            {buttonText}
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No {status} collaborators.</p>
              )}
            </div>
          );
        })}
      </Modal.Body>
      {/* <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default CollaborationModal;
