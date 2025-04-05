const supabase = require('../db');
const bcrypt = require('bcryptjs');

// create project
async function createProject(userId, title,field, description,privacy_mode) {
    console.log(userId, title, field, description, privacy_mode);
    const newProject = await supabase
    .from('survey_project')
    .insert([{
        user_id: userId,
        title,
        field,
        privacy_mode,
        description,
    }])
    return newProject;
}
// find project by user id
async function findProjectByUserId(userId) {
    const { data, error } = await supabase
    .from('survey_project')
    .select('*')
    .eq('user_id', userId)
    return { data, error };
}
// find project by project id
async function findProjectById(projectId) {
    const { data, error } = await supabase
    .from('survey_project')
    .select('*')
    .eq('project_id', projectId)
    return { data, error };
}
// update project
async function updateProject(projectId, data) {
    console.log( data);
        const { datas, error } = await supabase
            .from('survey_project')
            .update({ 
                title: data.title,
                field: data.field,
                description: data.description,
                privacy_mode: data.privacy_mode,
                scheduled_type: data.scheduled_type,
                schedule_date: data.scheduled_date
            })
            .eq('project_id', projectId);
    
        if (error) {
            console.error("Error updating project:", error);
        } else {
            console.log("Project updated successfully:", data);
        }
        return { datas, error };
    }
async function deleteProject(projectId) {
    const { data, error } = await supabase
    .from('survey_project')
    .delete()
    .eq('project_id', projectId)
    return { error };
};

module.exports = {
    createProject,
    findProjectByUserId, findProjectById,
    updateProject, deleteProject
}