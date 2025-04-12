const e = require('express');
const Collaborator = require('../model/collaborator');
const Project = require('../model/project');

exports.acceptInvitation = async (req, res) => {
    const  projectID  = req.params.projectID;
    const  userId  = req.jwt.id;
    console.log(userId);
    console.log(projectID);
    const { data, error } = await Collaborator.acceptInvitation(userId, projectID);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Invitation accepted successfully' });
}
exports.rejectInvitation = async (req, res) => {
    const  projectID = req.params.projectID;
    const userId  = req.jwt.id;
    console.log(userId);
    console.log(projectID);
    const { data, error } = await Collaborator.rejectInvitation(userId, projectID);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Invitation rejected successfully' });
}
exports.getAllInvitations = async (req, res) => {
    const  userId  = req.jwt.id;
    // console.log(userId);
    const { data, error } = await Collaborator.getAllInvitations(userId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ invitations: data });
}
exports.allprojectviewCollaborator = async (req, res) => {
    const  userId  = req.jwt.id;
    const { data, error } = await Collaborator.allprojectviewCollaborator(userId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ projects: data });
}