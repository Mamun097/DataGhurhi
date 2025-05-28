const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../auth/authmiddleware');
const questionBankController = require('../controller/questionBankController');

// Get all questions
router.get('/', jwtAuthMiddleware, questionBankController.getAllQuestion);
// //shared question 
router.get('/shared', jwtAuthMiddleware, questionBankController.getSharedQuestion);
//share question by id
router.post('/share/:questionId', jwtAuthMiddleware, questionBankController.shareQuestion);
//update question by id
router.put('/update/:questionId', jwtAuthMiddleware, questionBankController.updateQuestion);
// //delete question by id
router.delete('/delete/:questionId', jwtAuthMiddleware, questionBankController.deleteQuestion);
//create question
router.post('/create', jwtAuthMiddleware, questionBankController.createQuestion);


module.exports = router;