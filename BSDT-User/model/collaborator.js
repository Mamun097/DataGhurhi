const supabase = require('../db');
const bcrypt = require('bcryptjs');

async function acceptInvitation(userId, projectID) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .update({ invitation: 'accepted' })
        .eq('user_id', userId)
        .eq('project_id', projectID)
        .select('*');    
    if (error) {
        console.error('Error accepting invitation:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}


async function rejectInvitation(userId, projectID) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .update({ invitation: 'declined' })
        .eq('user_id', userId)
        .eq('project_id', projectID)
        .select('*');
    if (error) {
        console.error('Error rejecting invitation:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function getAllInvitations(userId) {
    const { data, error } = await supabase.rpc('get_collab_requests', { target_user_id: userId });
    console.log('Data:', data);
    if (error) {
        console.error('Error fetching invitations:', error.message);
        return { data: null, error };
    }
    
    return { data, error: null };
}
async function allprojectviewCollaborator(userId) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .select('user_id,access_role, project_id, survey_project(project_id,user_id, title, field, description, user!survey_project_user_id_fkey(user_id, name, email))') 
        .eq('user_id', userId)
        .eq('invitation', 'accepted');
    if (error) {
        console.error('Error fetching projects:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}
// async function inviteSurveyCollaborator(projectId, userId,access_role) {
//     const { data, error } = await supabase
//         .from('survey_shared_with_collaborators')
//         .insert({
//             survey_id: projectId,
//             user_id: userId,
//             access_role: access_role,
//             invitation: 'pending'
//         })
//         .select('*');
//     if (error) {
//         console.error('Error inviting survey collaborator:', error.message);
//         return { data: null, error };
//     }
//     return { data, error: null };
    
// }

async function rejectSurveyCollaborator(userId, surveyId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .update({ invitation: 'declined' })
        .eq('user_id', userId)
        .eq('survey_id', surveyId)
        .select('*');
    if (error) {
        console.error('Error rejecting survey collaborator:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function acceptSurveyCollaborator(userId, surveyId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .update({ invitation: 'accepted' })
        .eq('user_id', userId)
        .eq('survey_id', surveyId)
        .select('*');
    if (error) {
        console.error('Error accepting survey collaborator:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function getAllSurveyInvitations(userId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('user_id, access_role, survey_id, survey(survey_id, user_id, title, user(user_id, name, email))')
        .eq('user_id', userId)
        .eq('invitation', 'pending');
}
async function allSurveyCollaborator(userId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('user_id, access_role, survey_id, survey(survey_id, user_id, title, user(user_id, name, email))')
        .eq('user_id', userId)
        .eq('invitation', 'accepted');
    if (error) {
        console.error('Error fetching survey collaborators:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

module.exports = {
    acceptInvitation,
    rejectInvitation,
    getAllInvitations,
    allprojectviewCollaborator,
    allSurveyCollaborator,
    acceptSurveyCollaborator,
    rejectSurveyCollaborator,
    getAllSurveyInvitations
    
};