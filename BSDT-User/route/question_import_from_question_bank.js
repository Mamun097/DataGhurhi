const express = require("express");
const router = express.Router();
const questionImportController = require("../controller/question_import_from_question_bank_controller");

//!Get all previous own questions
router.get("/own-questions/:userId", questionImportController.getOwnQuestions);
/*GET /api/own-questions/:userId?tags=math,science&limit=5*/

//!Get all public questions
router.get("/public-questions/:userId", questionImportController.getPublicQuestions);
/*GET /api/public-questions/:userId?tags=math,science&limit=5*/


//!Import filtered questions
router.post("/import-questions", questionImportController.importQuestions);
/*
POST /api/import-questions
Content-Type: application/json

{
  "userId": 123,
  "tags": ["math", "science"],
  "limit": 5
}
*/

module.exports = router;
