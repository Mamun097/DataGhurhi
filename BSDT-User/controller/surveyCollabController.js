const e = require('express');
const supabase = require('../db');
const Collaborator = require('../model/collaborator');


exports.acceptInvitation = async (req, res) => {
    const surveyID = req.params.surveyID;
    const userId = req.jwt.id;

    const { data, error } = await Collaborator.acceptSurveyCollaborator(userId, surveyID);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Invitation accepted successfully', data });
}

exports.rejectInvitation = async (req, res) => {
    const surveyID = req.params.surveyID;
    const userId = req.jwt.id;

    const { data, error } = await Collaborator.rejectSurveyCollaborator(userId, surveyID);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Invitation rejected successfully', data });
}

exports.getallInvitations = async (req, res) => {
    const userId = req.jwt.id;
    
    const { data, error } = await Collaborator.getAllSurveyInvitations(userId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ invitations: data });
}

exports.allSurveyCollaborator = async (req, res) => {
    const userId = req.jwt.id;
    const { data, error } = await Collaborator.allSurveyCollaborator(userId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ collaborators: data });
}

exports.sendSurveyCollaborationRequest = async (req, res) => {
    try {
        const { survey_id, request_email, access_role } = req.body;
        console.log('Controller function called');

        const userId = req.jwt?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (survey_id === undefined || survey_id === null || !request_email || !access_role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (typeof survey_id !== 'number' || !Number.isInteger(survey_id)) {
            return res.status(400).json({ error: 'Invalid survey_id. It must be an integer.' });
        }

        const result = await Collaborator.sendSurveyCollaborationRequest(survey_id, request_email, access_role, userId);

        if (result.error) {
            console.error("Error received from model:", result.error);

            const statusCode = result.error.status || 500;
            const errorMessage = result.error.message || 'An internal server error occurred.';
            
            return res.status(statusCode).json({ error: errorMessage });
        }

        return res.status(201).json({ message: 'Collaboration request sent successfully.', data: result.data });

    } catch (err) {
        console.error('Error in sendSurveyCollaborationRequest controller:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSurveyCollaborators = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        console.log('Survey ID:', surveyId);
        const userId = req.jwt.id;

        if (!surveyId || isNaN(surveyId)) {
            return res.status(400).json({ error: 'Invalid survey ID' });
        }

        const { data, error } = await Collaborator.getSurveyCollaborators(surveyId, userId);
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ collaborators: data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.removeCollaborator = async (req, res) => {
    try {
        const { surveyId, collaboratorId } = req.params;
        const userId = req.jwt.id; // The ID of the person attempting to remove (the owner)

        // Basic validation
        if (!surveyId || !collaboratorId) {
            return res.status(400).json({ error: 'Missing survey ID or collaborator ID' });
        }

        // Call the Model function
        const { data, error } = await Collaborator.removeSurveyCollaborator(surveyId, collaboratorId, userId);

        if (error) {
            console.error("Error removing collaborator:", error);
            // Use the status code from the model error, or default to 500
            const status = error.status || 500;
            return res.status(status).json({ error: error.message || 'Internal server error' });
        }

        return res.status(200).json({ message: 'Collaborator removed successfully', data });

    } catch (err) {
        console.error('Error in removeCollaborator controller:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
