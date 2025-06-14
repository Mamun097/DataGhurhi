import ImportQuestionModal from "./importModal";
import React, { useState } from "react";
import axios from "axios";
import PreviewImportModal from "./previewModal";

const ImportFromQb = ({ addImportedQuestion, questionInfo}) => {

  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleImport = async ({ limit, tags, visibility }) => {
            const userId = localStorage.getItem("userId");
            let url = "";

            if (visibility === "own") {
              url = `http://localhost:2000/api/own-questions/${userId}?tags=${tags}&limit=${limit}`;
            } else if (visibility === "public") {
              url = `http://localhost:2000/api/public-questions?tags=${tags}&limit=${limit}`;
            } else {
              url = `http://localhost:2000/api/import-questions/${userId}?tags=${tags}&limit=${limit}`;
            }

            try {
              const res = await axios.get(url, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              setImportedQuestions(res.data); // Save to preview
              setShowPreviewModal(true);
            } catch (err) {
              console.error("Import failed", err);
            }
  };

const handleConfirmImport = (selectedQuestions) => {
  console.log("Selected Questions for Import:", selectedQuestions);

  const updatedQuestions = selectedQuestions.map((q, index) => {
    
    
    const newQuestion = {
      ...q,
      id: questionInfo.id , // assign incremental unique ID
      section: questionInfo.section, // assign the section from the question info
    };
    questionInfo.id += 1; // Increment the ID for the next question
    return newQuestion;
  });

  // Optionally update your app's state
  addImportedQuestion(updatedQuestions); // Use this in your app to update the state
};


  return (
    <>
      <button className="btn btn-outline-primary mb-md-0 me-md-3" onClick={() => setShowImportModal(true)}>
        Import Questions from Question Bank
      </button>

      <ImportQuestionModal
        show={showImportModal}
        onClose={() => { setShowImportModal(false); setImportedQuestions([]); setSelectedIds([]); }}
        onImport={handleImport}
      />

      <PreviewImportModal
        show={showPreviewModal}
        onClose={() => {setShowPreviewModal(false), setSelectedIds([])}}
        questions={importedQuestions}
        onConfirm={handleConfirmImport}
        setSelectedIds={setSelectedIds}
        selectedIds={selectedIds}
      />
    </>
  );
};
export default ImportFromQb;