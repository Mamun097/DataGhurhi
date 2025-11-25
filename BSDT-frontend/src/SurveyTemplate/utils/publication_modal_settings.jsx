import Swal from "sweetalert2";

const PublicationSettingsModal = ({
  isOpen,
  onClose,
  handleConfirm,
  action, // "publish" or "update"
}) => {
  const titleText = action === "publish" ? "Publish Survey" : "Update Survey";
  const buttonText = action === "publish" ? "Publish" : "Update";
  const bodyText =
    action === "publish"
      ? "Are you sure you want to publish this survey? It will become visible to users."
      : "Are you sure you want to update this survey? Changes will be reflected immediately.";

  return (
    <div>
      {isOpen &&
        Swal.fire({
          title: titleText,
          text: bodyText,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: buttonText,
          cancelButtonText: "Cancel",

          // --- COLOR SETTINGS ---
          confirmButtonColor: "#1e9a20ff",
          cancelButtonColor: "#bb2c2cff",
        }).then((result) => {
          if (result.isConfirmed) {
            handleConfirm();
          } else {
            if (typeof onClose === "function") {
              onClose();
            }
          }
        })}
    </div>
  );
};

export default PublicationSettingsModal;

// return (
//   <Modal
//     show={show}
//     onHide={handleClose}
//     centered
//     dialogClassName="modal-90w modal-dialog-centered"
//     backdrop="static"
//   >
//     <Modal.Header closeButton>
//       <Modal.Title>{titleText}</Modal.Title>
//     </Modal.Header>
//     <Modal.Body className="p-3 p-sm-4">
//       <Form>
//         <Form.Group className="mb-3" controlId="userResponseLoggedInStatus">
//           <Form.Check
//             type="switch"
//             id="login-required-switch"
//             className="fs-6"
//             label={
//               isQuiz
//                 ? "Users must be logged in to respond in quiz mode"
//                 : "Require users to be logged in to respond"
//             }
//             checked={isQuiz? true : isLoggedInRequired}
//             disabled={isQuiz}
//             onChange={(e) => setLocalIsLoggedIn(e.target.checked)}
//           />
//         </Form.Group>

//         <Form.Group controlId="shuffleQuestionsStatus">
//           <Form.Check
//             type="switch"
//             id="shuffle-questions-switch"
//             className="fs-6"
//             label="Shuffle question order for each respondent"
//             checked={localShuffle}
//             onChange={(e) => setLocalShuffle(e.target.checked)}
//           />
//         </Form.Group>
//       </Form>
//     </Modal.Body>
//     <Modal.Footer className="d-flex justify-content-end">
//       <Button variant="outline-danger" onClick={handleClose}>
//         Cancel
//       </Button>
//       <Button
//         variant="outline-primary"
//         onClick={handleConfirmClick}
//         className="ms-2"
//       >
//         {buttonText}
//       </Button>
//     </Modal.Footer>
//   </Modal>
// );
