const supabase = require('../db');
const bcrypt = require('bcryptjs');

async function acceptInvitation(userId, projectID) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
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
        .from('survey_shared_with_collaborators')
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
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('*')
        .eq('user_id', userId)
        .eq('invitation', 'pending');
    if (error) {
        console.error('Error fetching invitations:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}
async function allprojectviewCollaborator(userId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('*')
        .eq('user_id', userId)
        .eq('invitation', 'accepted');
    if (error) {
        console.error('Error fetching projects:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

module.exports = {
    acceptInvitation,
    rejectInvitation,
    getAllInvitations,
    allprojectviewCollaborator
};