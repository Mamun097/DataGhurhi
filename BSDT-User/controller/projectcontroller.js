const e = require('express');
const Project = require('../model/project');
// const User = require('../model/user');


exports.allprojectviewUser = async (req, res) => {
    const { data, error } = await Project.findProjectByUserId(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ projects: data });
}
exports.projectData = async (req, res) => {
    const  projectId  = req.params.projectID;
    console.log(projectId);
    const { data, error } = await Project.findProjectById(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    return res.status(200).json({ project: data[0] });
}

// get all surveys of a project
exports.getAllSurveys = async (req, res) => {
    const projectId = req.params.projectID;
    //console.log("peyegeci", projectId);
    // It will be called from View-Project page. Project ID will be passed from the URL.
    const { data, error } = await Project.findSurveysByProjectId(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'No surveys found for this project' });
    }
    console.log(data)
    return res.status(200).json({ surveys: data });
}
// create survey
exports.createSurvey = async (req, res) => {
    
    const projectId = req.params.projectID;
    const { title } = req.body;
    const userId = req.jwt.id;
    const { data, error } = await Project.createSurvey(projectId, title, userId);

    if (error) {
        console.error(error);
        return res.status(400).json({ error: error.message || "Unknown error" }); // send only message
    }

    return res.status(201).json({ data, message: 'Survey created successfully' });
};

exports.updateProject = async (req, res) => {
    const projectId = req.params.projectID;
// check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const { data, error } = await Project.updateProject(projectId,req.body);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Project updated successfully' });
}

exports.createProject = async (req, res) => {
    console.log(req.body);
    const { title,field, description,privacy_mode } = req.body;
    const { data, error } = await Project.createProject(req.jwt.id, title, field, description,privacy_mode);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(201).json({ message: 'Project created successfully' });
}
exports.deleteProject = async (req, res) => {
    const projectId = req.params.projectID;
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { error } = await Project.deleteProject(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Project deleted successfully' });
}
// collaborators

exports.inviteCollaborator = async (req, res) => {
    const projectId = req.params.projectID;
    console.log(projectId);
    console.log(req.body);
    
    
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { data, error } = await Project.inviteCollaborator(projectId, req.body,res);
    if (error) {
        console.error(error);
        if (error== 'Collaborator exists') {
            return res.status(401).json({ error: 'Collaborator already exists' });
        }
    
        return res.status(500).json({ error: error });
    }
    return res.status(200).json({ message: 'Collaborator invited successfully' });
}
exports.getCollaborators = async (req, res) => {
    const projectId = req.params.projectID;
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { data, error } = await Project.getCollaborators(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ collaborators: data });
}
exports.removeCollaborator = async (req, res) => {
    const projectId = req.params.projectID;
    const collaboratorId = req.params.collaboratorId;
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { data, error } = await Project.removeCollaborator(projectId, collaboratorId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Collaborator removed successfully' });
}

