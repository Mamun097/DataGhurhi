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

    const { data, error } = await Collaborator.getAllSurveyInvitation(userId);
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
