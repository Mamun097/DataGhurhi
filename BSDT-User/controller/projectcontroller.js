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
