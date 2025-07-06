const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const analysisFileUploadController = require('../controller/fileuploadController');
const { jwtAuthMiddleware } = require('../auth/authmiddleware');


router.post('/upload', jwtAuthMiddleware, upload.single('file'), analysisFileUploadController.uploadFile);

module.exports = router;