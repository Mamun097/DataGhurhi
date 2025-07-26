const e = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.uploadFile = async (req, res) => {
    try {
        console.log("File upload request received");
        const file = req.file;
        const filename = req.file ? req.file.originalname: '';
        console.log("File name:", filename);
        if (!file) {
            console.error("No file uploaded");
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Prepare form data for the API request
        const formData = new FormData();
        // console.log("File path:", file.path);
        // console.log("File name:", file.originalname);
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
        formData.append('userID', req.jwt.id); // Assuming req.jwt.id contains the user ID
        console.log("User_ID:", req.jwt.id);

        // Call the Django API to process the file
        const response = await axios.post('http://103.94.135.115:8001/api/get-columns/', formData, {
            headers: formData.getHeaders(),
        });
         fs.unlinkSync(req.file.path); // Delete the file after processing
         console.log(response.data);
        return res.status(200).json(response.data);
    }
    catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error' });

    }
}
